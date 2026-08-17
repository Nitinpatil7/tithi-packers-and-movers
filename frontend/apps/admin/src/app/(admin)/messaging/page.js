'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bell, CalendarDays, CheckCircle2, MessageSquare, Radio, Send, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@tithi/ui/Card';
import Button from '@tithi/ui/Button';
import Input from '@tithi/ui/Input';
import { useInAppNotifications, useMarkInAppNotificationRead, useNotifications, useSendNotification } from '@/hooks/useAdmin';

export default function AdminMessagingPage() {
  const searchParams = useSearchParams();
  const showUnread = searchParams.get('view') === 'unread';
  const [form, setForm] = useState({ channel: 'whatsapp', type: 'admin_message', customerMobile: '', customerName: '', title: 'Booking update', message: '' });
  const { data: notifications = [] } = useNotifications({ limit: 12 });
  const { data: unreadNotifications = [], isLoading: unreadLoading } = useInAppNotifications({ isRead: 'false', limit: 50 });
  const sendOne = useSendNotification();
  const markRead = useMarkInAppNotificationRead();
  const recentNotifications = useMemo(() => notifications, [notifications]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mobile = (params.get('mobile') || '').replace(/\D/g, '').slice(0, 10);
    const name = params.get('name') || '';
    if (mobile || name) setForm((current) => ({ ...current, customerMobile: mobile, customerName: name }));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (!form.message.trim()) throw new Error('Message is required.');
      if (!/^[6-9]\d{9}$/.test(form.customerMobile)) throw new Error('Enter a valid 10 digit mobile number.');
      const notification = await sendOne.mutateAsync({ ...form, meta: { source: 'admin_messaging' } });
      const actionUrl = notification?.meta?.whatsappActionUrl;
      if (actionUrl && form.channel === 'whatsapp') window.open(actionUrl, '_blank', 'noopener,noreferrer');
      toast.success('Message queued');
      setForm((current) => ({ ...current, message: '' }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return <div className="flex flex-col gap-6 text-left">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Customer communication</p>
      <h1 className="mt-1 text-2xl font-black text-slate-900">{showUnread ? 'Unread Notifications' : 'Messaging Center'}</h1>
      <p className="text-xs text-text-secondary mt-0.5">
        {showUnread ? 'Unread in-app alerts with full booking context and direct record links.' : 'Send one customer WhatsApp update with a click-to-send link.'}
      </p>
    </div>

    {showUnread && (
      <Card className="border border-sky-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-900">
              <Bell className="h-4 w-4 text-sky-600" />
              Unread In-app Notifications
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">Newest unread alerts appear first, matching the notification feed order.</p>
          </div>
          <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">{unreadNotifications.length}</span>
        </div>
        <div className="mt-4">
          {unreadLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-sky-50" />)}
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sky-100 bg-sky-50/50 px-5 py-12 text-center text-sm font-semibold text-slate-500">
              No records found. All in-app notifications are already read.
            </div>
          ) : (
            <div className="grid gap-3">
              {unreadNotifications.map((item) => <InAppNotificationCard key={item._id} item={item} onRead={() => markRead.mutate(item._id)} busy={markRead.isPending} />)}
            </div>
          )}
        </div>
      </Card>
    )}

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-8">
        <Card className="overflow-hidden border border-sky-100 bg-white shadow-[0_14px_40px_rgba(2,132,199,.08)]">
          <div className="bg-gradient-to-r from-sky-600 to-cyan-500 p-6 text-white"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><MessageSquare className="h-5 w-5" /></span><div><h3 className="font-black">Compose Customer Alert</h3><p className="mt-0.5 text-xs text-sky-50">Direct status updates, offers, or booking reminders.</p></div></div></div>
          <form onSubmit={submit} className="flex flex-col gap-5 p-6">
            <div className="grid gap-3 sm:grid-cols-2"><Choice active icon={Smartphone} label="Single customer" /></div>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Channel"><select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="admin-field"><option value="whatsapp">WhatsApp</option></select></Field><Field label="Message type"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="admin-field"><option value="admin_message">Status update</option><option value="booking_created">Booking confirmation</option></select></Field></div>
            <div className="grid gap-3 sm:grid-cols-2"><Input label="Recipient Mobile" placeholder="10 digit mobile number" value={form.customerMobile} onChange={(event) => setForm({ ...form, customerMobile: event.target.value.replace(/\D/g, '').slice(0, 10) })} maxLength={10} required /><Input label="Customer Name" placeholder="Customer name" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} /></div>
            <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <Field label="Message content"><textarea rows={5} className="w-full resize-none rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-800 placeholder:text-slate-400" placeholder="Hello, your booking status has been updated..." value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></Field>
            <div className="pt-2 flex justify-end"><Button type="submit" variant="primary" icon={Send} disabled={sendOne.isPending} className="px-5">Send Alert</Button></div>
          </form>
        </Card>
      </div>

      <div className="md:col-span-4 flex flex-col gap-6">
        <Card className="p-5 bg-white border border-sky-100 shadow-sm text-xs">
          <h4 className="flex items-center gap-2 font-bold text-slate-900 uppercase mb-2"><Radio className="h-4 w-4 text-sky-600" /> Latest Messages</h4>
          <div className="mt-3 flex flex-col gap-3">
            {recentNotifications.length === 0 ? <p className="text-text-secondary">No messages queued yet.</p> : recentNotifications.map((item) => <div key={item._id} className="rounded-xl border border-sky-100 bg-sky-50/50 p-3"><div className="flex justify-between gap-2"><span className="font-bold text-slate-900">{item.customerName || item.customerMobile}</span><span className="font-bold uppercase text-sky-600">{item.status}</span></div><p className="mt-1 line-clamp-2 text-slate-500">{item.message}</p>{item.meta?.whatsappActionUrl && <a className="mt-2 inline-block text-xs font-bold text-sky-700 hover:underline" href={item.meta.whatsappActionUrl} target="_blank" rel="noreferrer">Open WhatsApp</a>}</div>)}
          </div>
        </Card>
      </div>
    </div>
  </div>;
}

function InAppNotificationCard({ item, onRead, busy }) {
  const booking = item.bookingId;
  const bookingId = booking?.bookingid || item.meta?.bookingNumber;
  const scheduledAt = booking?.scheduledate || item.meta?.scheduledAt;
  const scheduledLabel = scheduledAt ? new Date(scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Schedule not set';

  return (
    <article className="rounded-xl border border-sky-100 bg-sky-50/40 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black text-slate-900">{item.title}</h4>
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black uppercase text-sky-700 ring-1 ring-sky-100">{item.type?.replaceAll('_', ' ')}</span>
          </div>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.message}</p>
          <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-sky-600" />{scheduledLabel}</span>
            <span>Customer: {booking?.customer?.name || item.meta?.customerName || 'Customer'}</span>
            <span>Status: {booking?.status?.replaceAll('_', ' ') || 'Not linked'}</span>
            <span>Service: {booking?.serviceType?.replaceAll('_', ' ') || item.meta?.serviceType?.replaceAll('_', ' ') || '-'}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {bookingId && (
            <Link href={`/bookings/${encodeURIComponent(bookingId)}`} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100">
              View booking
            </Link>
          )}
          <button type="button" onClick={onRead} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-700 disabled:opacity-50">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark read
          </button>
        </div>
      </div>
    </article>
  );
}

function Choice({ active, icon: Icon, label }) {
  return <div className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold ${active ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-sky-100 text-slate-500'}`}><Icon className="h-4 w-4" />{label}</div>;
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</span>{children}</label>;
}
