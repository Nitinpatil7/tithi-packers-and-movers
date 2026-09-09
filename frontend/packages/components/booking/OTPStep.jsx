'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, User } from 'lucide-react';
import { useCheckMobile, useVerifyOTP } from '@hooks/useAuth';
import toast from 'react-hot-toast';
import BookingActionBar from './BookingActionBar';

const DEFAULT_RESEND_SECONDS = 120;

export default function OTPStep({ onSubmit, onBack, initialData = {} }) {
  const [name, setName] = useState(initialData.contactDetails?.name || '');
  const [email, setEmail] = useState(initialData.contactDetails?.email || '');
  const [mobile, setMobile] = useState(initialData.contactDetails?.mobile || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(DEFAULT_RESEND_SECONDS);
  const [shake, setShake] = useState(false);
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const sendingOtpRef = useRef(false);
  const verifyingOtpRef = useRef(false);
  const lastAutoVerifyOtpRef = useRef('');
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const checkMobileMutation = useCheckMobile();
  const verifyOTPMutation = useVerifyOTP();
  const verifyBusy = verifyOTPMutation.isPending || confirmingBooking;

  useEffect(() => {
    if (!otpSent || timer <= 0) return undefined;
    const interval = window.setInterval(() => setTimer((value) => value - 1), 1000);
    return () => window.clearInterval(interval);
  }, [otpSent, timer]);

  useEffect(() => {
    if (!otpSent || typeof window === 'undefined' || !('OTPCredential' in window) || !navigator.credentials) return undefined;
    const controller = new AbortController();
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: controller.signal,
    }).then((credential) => {
      const code = String(credential?.code || '').replace(/\D/g, '').slice(0, 6);
      if (code.length === 6) {
        setOtpValues(code.split(''));
        otpRefs[5]?.current?.focus();
      }
    }).catch(() => {});
    return () => controller.abort();
  }, [otpSent]);

  const sendOtp = async () => {
    if (sendingOtpRef.current || checkMobileMutation.isPending) return;
    if (!name.trim()) return toast.error('Please enter your full name.');
    if (!/^[6-9]\d{9}$/.test(mobile)) return toast.error('Please enter a valid 10-digit Indian mobile number.');
    sendingOtpRef.current = true;
    try {
      const response = await checkMobileMutation.mutateAsync(mobile);
      setOtpSent(true);
      setTimer(response?.data?.resendAfterSeconds || DEFAULT_RESEND_SECONDS);
      setOtpValues(['', '', '', '', '', '']);
      lastAutoVerifyOtpRef.current = '';
      toast.success('A new OTP has been sent. The previous OTP is now invalid.');
      window.setTimeout(() => otpRefs[0]?.current?.focus(), 100);
    } catch (error) {
      toast.error(error.message || 'Error sending OTP');
    } finally {
      sendingOtpRef.current = false;
    }
  };

  const verifyOtp = useCallback(async (otpOverride) => {
    if (verifyingOtpRef.current || verifyBusy) return;
    const otp = otpOverride || otpValues.join('');
    if (otp.length !== 6) return toast.error('Please enter the complete 6-digit OTP code.');
    verifyingOtpRef.current = true;
    let response;
    try {
      response = await verifyOTPMutation.mutateAsync({ mobile, otp });
    } catch (error) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      setOtpValues(['', '', '', '', '', '']);
      lastAutoVerifyOtpRef.current = '';
      otpRefs[0]?.current?.focus();
      toast.error(error.message || 'Invalid OTP code.');
      verifyingOtpRef.current = false;
      return;
    }
    if (!response.success) {
      lastAutoVerifyOtpRef.current = '';
      verifyingOtpRef.current = false;
      return;
    }
    try {
      setConfirmingBooking(true);
      await onSubmit({ contactDetails: { name: name.trim(), email: email.trim(), mobile }, verificationId: response.verificationId || response.data?.verificationId || response.verification?.id });
    } finally {
      verifyingOtpRef.current = false;
      setConfirmingBooking(false);
    }
  }, [email, mobile, name, onSubmit, otpValues, verifyBusy, verifyOTPMutation]);

  useEffect(() => {
    if (!otpSent || verifyBusy) return undefined;
    const otp = otpValues.join('');
    if (otp.length !== 6 || otpValues.some((digit) => digit.length !== 1)) return undefined;
    if (lastAutoVerifyOtpRef.current === otp) return undefined;
    lastAutoVerifyOtpRef.current = otp;
    const timeout = window.setTimeout(() => verifyOtp(otp), 80);
    return () => window.clearTimeout(timeout);
  }, [otpSent, otpValues, verifyBusy, verifyOtp]);

  const handleOtpChange = (value, index) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) {
      const next = [...otpValues];
      next[index] = '';
      setOtpValues(next);
      return;
    }
    if (digits.length > 1) {
      const next = [...otpValues];
      digits.slice(0, 6 - index).split('').forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      setOtpValues(next);
      otpRefs[Math.min(index + digits.length, 5)]?.current?.focus();
      return;
    }
    const next = [...otpValues];
    next[index] = digits;
    setOtpValues(next);
    if (index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpValues(pasted.split(''));
      otpRefs[5].current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left sm:gap-6">
      <div>
        <h3 className="mb-1 text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
          Verify & Confirm Booking
        </h3>
        <p className="text-sm font-normal text-text-secondary">
          First enter customer details, then verify OTP to confirm the order.
        </p>
      </div>

      {!otpSent ? (
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="booking-themed-card grid gap-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/90 via-white to-orange-50/80 p-3.5 shadow-[0_18px_50px_rgba(14,165,233,0.12)] ring-1 ring-white/70 sm:grid-cols-2 sm:gap-4 sm:rounded-3xl sm:p-6">
            <Field label="Full Name *" icon={User}><input value={name} onChange={(event) => setName(event.target.value)} className="booking-input text-base" placeholder="Enter full name" /></Field>
            <Field label="Email Address" icon={Mail}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="booking-input text-base" placeholder="customer@email.com" /></Field>
            <div className="sm:col-span-2">
              <Field label="Mobile Number *" icon={Phone}>
                <div className="flex gap-2.5 sm:gap-3">
                  <div className="shrink-0 rounded-xl border border-bg-border bg-bg-white px-3.5 py-3 text-sm font-semibold text-text-secondary sm:px-4 sm:py-3.5">+91</div>
                  <input value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} className="booking-input flex-1 text-base font-mono" placeholder="10-digit mobile number" />
                </div>
              </Field>
              <p className="mt-1.5 text-xs font-normal text-text-tertiary">OTP will be sent to this number for booking confirmation.</p>
            </div>
          </div>
          <BookingActionBar onBack={onBack} onNext={sendOtp} tone="orange" nextLabel={checkMobileMutation.isPending ? 'Sending...' : 'Send OTP'} disabled={checkMobileMutation.isPending} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="booking-themed-card booking-otp-sent-card rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-3.5 shadow-[0_16px_44px_rgba(16,185,129,0.12)] sm:rounded-3xl sm:p-5">
            <p className="mb-1 text-sm font-semibold text-emerald-800">OTP sent to +91 {mobile}</p>
            <p className="text-xs font-normal text-emerald-700">Enter the one-time password for Tithi Packers and Movers booking verification.</p>
          </div>
          <motion.div className="my-1 grid w-full min-w-0 grid-cols-6 gap-1.5 px-0.5 sm:mx-auto sm:my-2 sm:max-w-md sm:gap-3 sm:px-0" animate={shake ? 'shake' : ''} variants={{ shake: { x: [-10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.4 } } }}>
            {otpValues.map((value, index) => (
              <input key={index} ref={otpRefs[index]} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} pattern="[0-9]*" maxLength={1} value={value} onChange={(event) => handleOtpChange(event.target.value, index)} onPaste={handleOtpPaste} onKeyDown={(event) => { if (event.key === 'Backspace' && !otpValues[index] && index > 0) otpRefs[index - 1].current?.focus(); }} className="aspect-square h-auto min-h-0 w-full min-w-0 rounded-xl border-2 border-bg-border bg-bg-white text-center font-mono text-lg font-semibold text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-14 sm:rounded-2xl sm:text-xl" />
            ))}
          </motion.div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-text-tertiary">Didn&apos;t get the code?</span>
            {timer > 0 ? <span className="font-mono text-sm font-semibold text-text-secondary">Resend in {timer}s</span> : <button onClick={sendOtp} disabled={checkMobileMutation.isPending} className="text-sm font-semibold text-primary hover:underline disabled:opacity-60">{checkMobileMutation.isPending ? 'Sending...' : 'Resend OTP'}</button>}
          </div>
          <BookingActionBar onBack={() => setOtpSent(false)} backLabel="Edit" onNext={verifyOtp} tone="orange" nextLabel={confirmingBooking ? 'Confirming...' : verifyOTPMutation.isPending ? 'Verifying...' : 'Verify & Confirm'} disabled={verifyBusy} summary={`+91 ${mobile}`} />
        </div>
      )}
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return <label className="flex flex-col gap-1.5"><span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"><Icon className="h-3.5 w-3.5 text-primary" />{label}</span>{children}</label>;
}

export { OTPStep };
