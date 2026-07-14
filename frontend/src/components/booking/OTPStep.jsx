'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, Phone, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCheckMobile, useVerifyOTP } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const DEV_OTP = '123456';
const useRealOtpApi = process.env.NEXT_PUBLIC_USE_REAL_OTP === 'true';

export default function OTPStep({ onSubmit, onBack, initialData = {} }) {
  const [name, setName] = useState(initialData.contactDetails?.name || '');
  const [email, setEmail] = useState(initialData.contactDetails?.email || '');
  const [mobile, setMobile] = useState(initialData.contactDetails?.mobile || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [shake, setShake] = useState(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const checkMobileMutation = useCheckMobile();
  const verifyOTPMutation = useVerifyOTP();

  useEffect(() => {
    if (!otpSent || timer <= 0) return undefined;
    const interval = window.setInterval(() => setTimer((value) => value - 1), 1000);
    return () => window.clearInterval(interval);
  }, [otpSent, timer]);

  const sendOtp = async () => {
    if (!name.trim()) return toast.error('Please enter your full name.');
    if (!/^[6-9]\d{9}$/.test(mobile)) return toast.error('Please enter a valid 10-digit Indian mobile number.');
    if (!useRealOtpApi) {
      setOtpSent(true);
      setTimer(60);
      setOtpValues(['', '', '', '', '', '']);
      toast.success('Use OTP 123456 for now');
      window.setTimeout(() => otpRefs[0]?.current?.focus(), 100);
      return;
    }
    try {
      await checkMobileMutation.mutateAsync(mobile);
      setOtpSent(true);
      setTimer(60);
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error(error.message || 'Error sending OTP');
    }
  };

  const verifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) return toast.error('Please enter the complete 6-digit OTP code.');
    if (!useRealOtpApi) {
      if (otp !== DEV_OTP) {
        setShake(true);
        window.setTimeout(() => setShake(false), 500);
        setOtpValues(['', '', '', '', '', '']);
        otpRefs[0]?.current?.focus();
        toast.error('Invalid OTP. Use 123456 for now.');
        return;
      }
      onSubmit({ contactDetails: { name: name.trim(), email: email.trim(), mobile }, verificationId: 'dev-otp-bypass' });
      return;
    }
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
          <div className="grid gap-4 rounded-2xl border border-bg-border bg-bg-section p-6 sm:grid-cols-2">
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
          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button>
            <button onClick={sendOtp} disabled={useRealOtpApi && checkMobileMutation.isPending} className="btn-orange px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60">
              {useRealOtpApi && checkMobileMutation.isPending ? 'Sending...' : useRealOtpApi ? 'Send OTP' : 'Continue to OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="mb-1 text-sm font-bold text-emerald-800">OTP sent to +91 {mobile}</p>
            <p className="text-xs font-medium text-emerald-700">{useRealOtpApi ? 'Enter the 6-digit verification code sent to your phone.' : 'Temporary OTP is 123456 until SMS credentials are connected.'}</p>
          </div>
          <motion.div className="my-2 flex justify-center gap-3" animate={shake ? 'shake' : ''} variants={{ shake: { x: [-10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.4 } } }}>
            {otpValues.map((value, index) => (
              <input key={index} ref={otpRefs[index]} type="text" maxLength={1} value={value} onChange={(event) => handleOtpChange(event.target.value, index)} onPaste={handleOtpPaste} onKeyDown={(event) => { if (event.key === 'Backspace' && !otpValues[index] && index > 0) otpRefs[index - 1].current?.focus(); }} className="h-14 w-12 rounded-2xl border-2 border-bg-border bg-white text-center font-mono text-xl font-black text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
            ))}
          </motion.div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-tertiary">Didn&apos;t get the code?</span>
            {timer > 0 ? <span className="font-mono text-sm font-bold text-text-secondary">Resend in {timer}s</span> : <button onClick={sendOtp} className="text-sm font-bold text-primary hover:underline">{useRealOtpApi ? 'Resend OTP' : 'Reset OTP'}</button>}
          </div>
          <div className="flex items-center justify-between border-t border-bg-border pt-4">
            <Button variant="secondary" onClick={() => setOtpSent(false)} icon={ArrowLeft}>Edit details</Button>
            <button onClick={verifyOtp} disabled={useRealOtpApi && verifyOTPMutation.isPending} className="btn-orange px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-60">
              {useRealOtpApi && verifyOTPMutation.isPending ? 'Verifying...' : 'Verify & Confirm'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return <label className="flex flex-col gap-1.5"><span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-secondary"><Icon className="h-3.5 w-3.5 text-primary" />{label}</span>{children}</label>;
}

export { OTPStep };
