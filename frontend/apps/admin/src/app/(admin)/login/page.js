'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { completeAdminPasswordReset, requestAdminPasswordReset, verifyAdminPasswordResetOtp } from '@/lib/adminAuth';
import { useSiteSetting } from '@hooks/useSiteSetting';
import { resolveSiteAssetUrl } from '@utils/siteAssets';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminAuthStore((state) => state.login);
  const { data: site = {} } = useSiteSetting();
  const logoSrc = resolveSiteAssetUrl(site.logoUrl);
  const [form, setForm] = useState({ email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMode, setResetMode] = useState('login');
  const [resetMeta, setResetMeta] = useState(null);
  const [verificationId, setVerificationId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back');
      router.replace('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const startReset = () => {
    setResetEmail(form.email.trim());
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetMeta(null);
    setVerificationId('');
    setResetMode('reset-email');
  };

  const requestReset = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    try {
      const response = await requestAdminPasswordReset(resetEmail.trim());
      setResetMeta(response.data || response);
      setResetMode('reset-otp');
      toast.success('Admin reset OTP sent');
    } catch (error) {
      toast.error(error.message || 'Could not send reset OTP');
    } finally {
      setResetLoading(false);
    }
  };

  const verifyResetOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(resetOtp.trim())) return toast.error('Enter the 6 digit OTP');
    setResetLoading(true);
    try {
      const response = await verifyAdminPasswordResetOtp(resetEmail.trim(), resetOtp.trim());
      setVerificationId(response.data?.verificationId || response.verificationId || '');
      setResetMode('reset-password');
      toast.success('OTP verified');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setResetLoading(false);
    }
  };

  const completeReset = async (event) => {
    event.preventDefault();
    if (newPassword.length < 12) return toast.error('Password must be at least 12 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setResetLoading(true);
    try {
      await completeAdminPasswordReset(resetEmail.trim(), verificationId, newPassword);
      setForm({ email: resetEmail.trim(), password: '' });
      setResetMode('login');
      setResetOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setVerificationId('');
      toast.success('Password reset. Please sign in.');
    } catch (error) {
      toast.error(error.message || 'Could not reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const backToLogin = () => {
    setResetMode('login');
    setResetLoading(false);
  };

  const isReset = resetMode !== 'login';
  const title = isReset ? 'Reset admin password' : 'Sign in to your panel';
  const subtitle = isReset ? 'Verify the OTP sent to the admin mobile number, then set a new password.' : 'Use your administrator email and password.';

  return (
    <main className="relative min-h-screen overflow-hidden bg-sky-50 px-4 py-10 grid place-items-center">
      <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_80px_rgba(2,132,199,0.18)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden min-h-[610px] flex-col justify-between bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 p-12 text-white lg:flex">
          <div>{logoSrc && <Image unoptimized src={logoSrc} alt={site.companyName || 'Company logo'} width={180} height={56} className="h-14 w-auto max-w-[190px] object-contain" />}</div>
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold"><ShieldCheck className="h-4 w-4" /> Secure operations portal</p>
            <h1 className="max-w-md text-5xl font-black leading-[1.05]">Move every booking forward.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-sky-50/90">Manage bookings, item catalog, customers and business insights from one calm, focused workspace.</p>
          </div>
          <div>{logoSrc && <Image unoptimized src={logoSrc} alt={site.companyName || 'Company logo'} width={140} height={44} className="h-10 w-auto max-w-[150px] object-contain opacity-80" />}</div>
        </section>

        <section className="flex min-h-[610px] flex-col justify-center p-7 sm:p-12">
          {logoSrc && <div className="mb-9 lg:hidden"><Image unoptimized src={logoSrc} alt={site.companyName || 'Company logo'} width={160} height={50} className="h-12 w-auto max-w-[170px] object-contain" /></div>}
          <p className="text-xs font-bold uppercase tracking-[.22em] text-sky-600">Administration</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

          {resetMode === 'login' && (
            <form onSubmit={submit} className="mt-9 space-y-5">
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><span className="relative block"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" /><input type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@tithi.com" className="min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50/60 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400" /></span></label>
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Password</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" /><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" className="min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50/60 py-3.5 pl-12 pr-14 text-sm text-slate-900 placeholder:text-slate-400" /><button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:bg-sky-100 hover:text-sky-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
              <button disabled={loading} className="mt-2 min-h-12 w-full rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in securely'}</button>
              <button type="button" onClick={startReset} className="min-h-11 w-full rounded-2xl border border-sky-100 bg-white px-5 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-50">Forgot password?</button>
            </form>
          )}

          {resetMode === 'reset-email' && (
            <form onSubmit={requestReset} className="mt-9 space-y-5">
              <ResetBack onClick={backToLogin} />
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Admin email</span><span className="relative block"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" /><input type="email" required autoComplete="username" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="admin@tithi.com" className="min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50/60 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400" /></span></label>
              <button disabled={resetLoading} className="min-h-12 w-full rounded-2xl bg-sky-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 disabled:opacity-60">{resetLoading ? 'Sending OTP...' : 'Send reset OTP'}</button>
            </form>
          )}

          {resetMode === 'reset-otp' && (
            <form onSubmit={verifyResetOtp} className="mt-9 space-y-5">
              <ResetBack onClick={() => setResetMode('reset-email')} />
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><Smartphone className="mr-2 inline h-4 w-4" /> OTP sent to admin mobile ending {resetMeta?.mobileLast4 || '****'}.</div>
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">6 digit OTP</span><input inputMode="numeric" pattern="[0-9]*" maxLength={6} required value={resetOtp} onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3.5 text-center font-mono text-lg font-black tracking-[0.35em] text-slate-900 placeholder:text-slate-300" /></label>
              <button disabled={resetLoading} className="min-h-12 w-full rounded-2xl bg-sky-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 disabled:opacity-60">{resetLoading ? 'Verifying...' : 'Verify OTP'}</button>
            </form>
          )}

          {resetMode === 'reset-password' && (
            <form onSubmit={completeReset} className="mt-9 space-y-5">
              <ResetBack onClick={() => setResetMode('reset-otp')} />
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">New password</span><span className="relative block"><KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" /><input type="password" required minLength={12} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 12 characters" className="min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50/60 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400" /></span></label>
              <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Confirm password</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" /><input type="password" required minLength={12} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="min-h-12 w-full rounded-2xl border border-sky-100 bg-sky-50/60 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400" /></span></label>
              <button disabled={resetLoading || !verificationId} className="min-h-12 w-full rounded-2xl bg-sky-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 disabled:opacity-60">{resetLoading ? 'Resetting...' : 'Reset password'}</button>
            </form>
          )}
          <p className="mt-7 text-center text-xs text-slate-400">Protected by secure HTTP-only session cookies</p>
        </section>
      </div>
    </main>
  );
}

function ResetBack({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-1 text-sm font-bold text-sky-700 hover:text-sky-900">
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
