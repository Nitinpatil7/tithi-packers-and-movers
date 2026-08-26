'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const sendingOtpRef = useRef(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const checkMobileMutation = useCheckMobile();
  const verifyOTPMutation = useVerifyOTP();

  useEffect(() => {
    if (!otpSent || timer <= 0) return undefined;
    const interval = window.setInterval(() => setTimer((value) => value - 1), 1000);
    return () => window.clearInterval(interval);
  }, [otpSent, timer]);

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
      toast.success('A new OTP has been sent. The previous OTP is now invalid.');
      window.setTimeout(() => otpRefs[0]?.current?.focus(), 100);
    } catch (error) {
      toast.error(error.message || 'Error sending OTP');
    } finally {
      sendingOtpRef.current = false;
    }
  };

  const verifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) return toast.error('Please enter the complete 6-digit OTP code.');
    try {
      const response = await verifyOTPMutation.mutateAsync({ mobile, otp });
      if (response.success) onSubmit({ contactDetails: { name: name.trim(), email: email.trim(), mobile }, verificationId: response.verificationId || response.data?.verificationId || response.verification?.id });
    } catch (error) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      setOtpValues(['', '', '', '', '', '']);
      otpRefs[0]?.current?.focus();
      toast.error(error.message || 'Invalid OTP code.');
    }
  };

  const handleOtpChange = (value, index) => {
    if (Number.isNaN(Number(value))) return;
    const next = [...otpValues];
    next[index] = value;
    setOtpValues(next);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
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
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Verify & Confirm Booking
        </h3>
        <p className="text-sm text-text-secondary font-medium">
          First enter customer details, then verify OTP to confirm the order.
        </p>
      </div>

      {!otpSent ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/90 via-white to-orange-50/80 p-5 shadow-[0_18px_50px_rgba(14,165,233,0.12)] ring-1 ring-white/70 dark:border-sky-900/60 dark:from-sky-950/50 dark:via-slate-950 dark:to-orange-950/40 dark:ring-white/5 sm:grid-cols-2 sm:p-6">
            <Field label="Full Name *" icon={User}><input value={name} onChange={(event) => setName(event.target.value)} className="booking-input text-base" placeholder="Enter full name" /></Field>
            <Field label="Email Address" icon={Mail}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="booking-input text-base" placeholder="customer@email.com" /></Field>
            <div className="sm:col-span-2">
              <Field label="Mobile Number *" icon={Phone}>
                <div className="flex gap-3">
                  <div className="shrink-0 rounded-xl border border-bg-border bg-white px-4 py-3.5 text-sm font-bold text-text-secondary">+91</div>
                  <input value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} className="booking-input flex-1 text-base font-mono" placeholder="10-digit mobile number" />
                </div>
              </Field>
              <p className="mt-2 text-xs font-medium text-text-tertiary">OTP will be sent to this number for booking confirmation.</p>
            </div>
          </div>
          <BookingActionBar onBack={onBack} onNext={sendOtp} tone="orange" nextLabel={checkMobileMutation.isPending ? 'Sending...' : 'Send OTP'} disabled={checkMobileMutation.isPending} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-[0_16px_44px_rgba(16,185,129,0.12)] dark:border-emerald-900/60 dark:from-emerald-950/50 dark:via-slate-950 dark:to-sky-950/40">
            <p className="mb-1 text-sm font-bold text-emerald-800">OTP sent to +91 {mobile}</p>
            <p className="text-xs font-medium text-emerald-700">Enter the one-time password for Tithi Packers and Movers booking verification.</p>
          </div>
          <motion.div className="my-2 flex justify-center gap-3" animate={shake ? 'shake' : ''} variants={{ shake: { x: [-10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.4 } } }}>
            {otpValues.map((value, index) => (
              <input key={index} ref={otpRefs[index]} type="text" maxLength={1} value={value} onChange={(event) => handleOtpChange(event.target.value, index)} onPaste={handleOtpPaste} onKeyDown={(event) => { if (event.key === 'Backspace' && !otpValues[index] && index > 0) otpRefs[index - 1].current?.focus(); }} className="h-14 w-12 rounded-2xl border-2 border-bg-border bg-white text-center font-mono text-xl font-black text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
            ))}
          </motion.div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-tertiary">Didn&apos;t get the code?</span>
            {timer > 0 ? <span className="font-mono text-sm font-bold text-text-secondary">Resend in {timer}s</span> : <button onClick={sendOtp} disabled={checkMobileMutation.isPending} className="text-sm font-bold text-primary hover:underline disabled:opacity-60">{checkMobileMutation.isPending ? 'Sending...' : 'Resend OTP'}</button>}
          </div>
          <BookingActionBar onBack={() => setOtpSent(false)} backLabel="Edit" onNext={verifyOtp} tone="orange" nextLabel={verifyOTPMutation.isPending ? 'Verifying...' : 'Verify & Confirm'} disabled={verifyOTPMutation.isPending} summary={`+91 ${mobile}`} />
        </div>
      )}
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return <label className="flex flex-col gap-1.5"><span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-secondary"><Icon className="h-3.5 w-3.5 text-primary" />{label}</span>{children}</label>;
}

export { OTPStep };
