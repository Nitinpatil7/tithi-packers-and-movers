'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  IndianRupee,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  TicketCheck,
  Truck,
} from 'lucide-react';
import Badge from '@ui/Badge';
import Card from '@ui/Card';
import Spinner from '@ui/Spinner';
import { getBookingById, getMyBookings } from '@lib/api';
import { formatBookingDate, formatBookingTimeSlot, formatCurrency, getServiceLabel } from '@utils/utils';

const makeCaptcha = () => String(Math.floor(1000 + Math.random() * 9000));

const TRACKING_STEPS = [
  { key: 'pending', label: 'Requested' },
  { key: 'quote_sent', label: 'Quoted' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_progress', label: 'Moving' },
  { key: 'completed', label: 'Done' },
];

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg-page pb-16 pt-32"><Spinner size="md" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}

function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledBookingId = searchParams.get('bookingId') || searchParams.get('id') || '';
  const prefilledMobile = (searchParams.get('mobile') || '').replace(/\D/g, '').slice(0, 10);

  const [lookupMode, setLookupMode] = useState(prefilledMobile && !prefilledBookingId ? 'mobile' : 'bookingId');
  const [bookingId, setBookingId] = useState(prefilledBookingId);
  const [mobile, setMobile] = useState(prefilledMobile);
  const [captcha, setCaptcha] = useState('0000');
  const [captchaInput, setCaptchaInput] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    if (captchaInput !== captcha) return false;
    return lookupMode === 'bookingId' ? bookingId.trim().length >= 6 : mobile.length === 10;
  }, [bookingId, captcha, captchaInput, lookupMode, mobile]);

  useEffect(() => {
    setCaptcha(makeCaptcha());
  }, []);

  useEffect(() => {
    if (prefilledBookingId) {
      setLookupMode('bookingId');
      setBookingId(prefilledBookingId);
    } else if (prefilledMobile) {
      setLookupMode('mobile');
      setMobile(prefilledMobile);
    }
  }, [prefilledBookingId, prefilledMobile]);

  const refreshCaptcha = () => {
    setCaptcha(makeCaptcha());
    setCaptchaInput('');
  };

  const changeLookupMode = (mode) => {
    setLookupMode(mode);
    setError('');
    setBookings([]);
    setCaptchaInput('');
    if (mode === 'bookingId') setMobile('');
    else setBookingId('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBookings([]);
    if (captchaInput !== captcha) {
      setError('Captcha does not match.');
      refreshCaptcha();
      return;
    }
    try {
      setLoading(true);
      if (lookupMode === 'bookingId') {
        const booking = await getBookingById(bookingId.trim());
        setBookings([booking]);
      } else {
        const list = await getMyBookings(mobile);
        setBookings(list);
        if (!list.length) setError('No booking found for this mobile number.');
      }
    } catch (err) {
      setError(err.message || 'Could not fetch booking details.');
    } finally {
      setLoading(false);
      refreshCaptcha();
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg-page pb-16 pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-20 h-72 bg-[radial-gradient(circle_at_16%_18%,rgba(14,165,233,.15),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(249,115,22,.09),transparent_28%)]" />
      <motion.div
        className="pointer-events-none absolute right-8 top-36 hidden h-24 w-24 rounded-[28px] border border-sky-100 bg-white/55 shadow-sky md:block"
        animate={{ rotateY: [0, 14, 0], y: [0, -8, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-5 px-4 sm:gap-6 lg:grid-cols-[390px_1fr]">
        <Card className="h-fit border border-bg-border bg-bg-white/95 p-5 shadow-xs backdrop-blur transition hover:border-primary/20 hover:shadow-sky sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-text-primary">Track Booking</h1>
              <p className="mt-1 text-sm font-medium leading-6 text-text-secondary">Use booking ID for one booking, or mobile number to view all bookings.</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-bg-section p-1">
              <LookupPill icon={TicketCheck} label="Booking ID" note="Fastest" active={lookupMode === 'bookingId'} onClick={() => changeLookupMode('bookingId')} />
              <LookupPill icon={Smartphone} label="Mobile No." note="All bookings" active={lookupMode === 'mobile'} onClick={() => changeLookupMode('mobile')} />
            </div>

            {lookupMode === 'bookingId' ? (
              <Field label="Booking ID">
                <input value={bookingId} onChange={(event) => setBookingId(event.target.value)} placeholder="TPM-20260712-XXXX" className="booking-input" />
              </Field>
            ) : (
              <Field label="Mobile Number">
                <input value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 digit mobile number" className="booking-input" />
              </Field>
            )}

            <div className="rounded-2xl border border-bg-border bg-bg-section p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-text-tertiary">Captcha</span>
                  <div className="mt-1 font-mono text-2xl font-black tracking-[0.3em] text-text-primary">{captcha}</div>
                </div>
                <button type="button" onClick={refreshCaptcha} className="rounded-xl border border-bg-border bg-white p-2.5 text-primary">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <input value={captchaInput} onChange={(event) => setCaptchaInput(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Enter 4 digit captcha" className="booking-input mt-3" />
            </div>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

            <button disabled={!canSubmit || loading} className="btn-sky flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black disabled:opacity-50">
              {loading ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
              Track Booking
            </button>
          </form>
        </Card>

        <section className="space-y-4">
          <div className="rounded-3xl border border-bg-border bg-bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-black text-text-primary">Live Booking Status</h2>
                <p className="text-sm font-medium text-text-secondary">Fresh status is fetched from backend every time you track.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-72 place-items-center rounded-3xl border border-bg-border bg-bg-white"><Spinner size="lg" /></div>
          ) : bookings.length ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id || booking.bookingid || booking.bookingId}
                  booking={booking}
                  onOpen={() => router.push(`/website/my-bookings/${booking.bookingid || booking.bookingId || booking._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-bg-border bg-bg-white p-8 text-center">
              <div>
                <ClipboardList className="mx-auto h-12 w-12 text-text-tertiary" />
                <p className="mt-3 font-bold text-text-primary">No booking loaded</p>
                <p className="mt-1 text-sm font-medium text-text-secondary">Choose a lookup tab and enter the required detail above.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function BookingCard({ booking, onOpen }) {
  const total = booking.pricing?.totalAmount || booking.quoteSnapshot?.pricing?.totalAmount || booking.totalAmount || 0;
  const status = normalizeStatus(booking.status);
  const activeIndex = Math.max(0, TRACKING_STEPS.findIndex((step) => step.key === status));
  const isCancelled = status === 'cancelled';

  return (
    <Card onClick={onOpen} className="cursor-pointer overflow-hidden border border-bg-border bg-bg-white p-0 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sky">
      <div className="border-b border-bg-border bg-gradient-to-r from-primary/10 via-bg-white to-bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-xs ring-1 ring-primary/15">
              <Truck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-black text-text-primary">{booking.bookingid || booking.bookingId}</span>
                <Badge variant="status" type={booking.status} />
              </div>
              <p className="mt-1 text-sm font-bold text-text-secondary">{getServiceLabel(booking.serviceType)}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-text-tertiary">
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-primary" />{formatBookingDate(booking)}</span>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-primary" />{formatBookingTimeSlot(booking)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">Quote</p>
              <p className="font-mono text-base font-black text-text-primary">{total > 0 ? formatCurrency(total) : 'Pending'}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-5 gap-2">
          {TRACKING_STEPS.map((step, index) => {
            const done = !isCancelled && index < activeIndex;
            const active = !isCancelled && index === activeIndex;
            return (
              <div key={step.key} className="min-w-0">
                <div className={`h-1.5 rounded-full ${done || active ? 'bg-primary' : 'bg-bg-border'}`} />
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black ${done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-white' : 'bg-bg-section text-text-tertiary'}`}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className={`truncate text-[10px] font-black uppercase ${active ? 'text-primary' : done ? 'text-emerald-600' : 'text-text-tertiary'}`}>{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        {isCancelled && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">This booking has been cancelled.</p>}
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
          <InfoChip icon={MapPin} label="Pickup" value={booking.pickupLocation?.address || 'Address saved'} />
          <InfoChip icon={IndianRupee} label="Current status" value={getStatusText(booking.status)} />
        </div>
      </div>
    </Card>
  );
}

function LookupPill({ icon: Icon, label, note, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black shadow-xs transition ${active ? 'bg-white text-primary ring-1 ring-primary/20' : 'text-text-secondary hover:bg-white/70'}`}>
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
      <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-primary sm:inline">{note}</span>
    </button>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-text-tertiary">{label}</span>{children}</label>;
}

function normalizeStatus(status) {
  return String(status || 'pending').replace(/-/g, '_');
}

function getStatusText(status) {
  const labels = {
    pending: 'Request received',
    quote_sent: 'Quote sent',
    confirmed: 'Confirmed',
    in_progress: 'Move in progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  const value = normalizeStatus(status);
  return labels[value] || value.replace(/_/g, ' ');
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-bg-border bg-bg-section px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-text-tertiary">{label}</p>
        <p className="truncate text-xs font-bold text-text-primary">{value || '-'}</p>
      </div>
    </div>
  );
}

