'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '@/store/adminAuthStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back');
      router.replace('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-sky-50 px-4 py-10 grid place-items-center">
      <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_80px_rgba(2,132,199,0.18)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden min-h-[610px] flex-col justify-between bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 p-12 text-white lg:flex">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur"><Truck /></span>
            <div><p className="text-xl font-black tracking-wide">TITHI</p><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-100">Admin Console</p></div>
          </div>
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold"><ShieldCheck className="h-4 w-4" /> Secure operations portal</p>
            <h1 className="max-w-md text-5xl font-black leading-[1.05]">Move every booking forward.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-sky-50/90">Manage bookings, item catalog, customers and business insights from one calm, focused workspace.</p>
          </div>
          <p className="text-xs font-semibold text-white/70">Tithi Packers & Movers · Surat</p>
        </section>

        <section className="flex min-h-[610px] flex-col justify-center p-7 sm:p-12">
          <div className="mb-9 lg:hidden flex items-center gap-3 text-sky-700"><Truck /><span className="font-black tracking-wide">TITHI ADMIN</span></div>
          <p className="text-xs font-bold uppercase tracking-[.22em] text-sky-600">Administration</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">Sign in to your panel</h2>
          <p className="mt-2 text-sm text-slate-500">Use your administrator email and password.</p>

          <form onSubmit={submit} className="mt-9 space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><span className="relative block"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" /><input type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@tithi.com" className="w-full rounded-2xl border border-sky-100 bg-sky-50/60 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400" /></span></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Password</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" /><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" className="w-full rounded-2xl border border-sky-100 bg-sky-50/60 py-3.5 pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-400" /><button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
            <button disabled={loading} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in securely'}</button>
          </form>
          <p className="mt-7 text-center text-xs text-slate-400">Protected by secure HTTP-only session cookies</p>
        </section>
      </div>
    </main>
  );
}
