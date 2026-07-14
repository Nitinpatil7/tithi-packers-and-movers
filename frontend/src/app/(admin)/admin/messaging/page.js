'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Radio, Send, Smartphone, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAdminUsers, useBroadcastNotification, useNotifications, useSendNotification } from '@/hooks/useAdmin';

export default function AdminMessagingPage() {
  const [mode, setMode] = useState('single');
  const [form, setForm] = useState({ channel: 'whatsapp', type: 'admin_message', customerMobile: '', customerName: '', title: 'Booking update', message: '' });
  const { data: customers = [] } = useAdminUsers({ limit: 300 });
  const { data: notifications = [] } = useNotifications({ limit: 12 });
  const sendOne = useSendNotification();
  const broadcast = useBroadcastNotification();
  const activeCustomers = useMemo(() => customers.filter((item) => item.mobile), [customers]);

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
      if (mode === 'broadcast') {
        if (!activeCustomers.length) throw new Error('No booking customers found for broadcast.');
        await broadcast.mutateAsync({ targetCustomers: activeCustomers.map((item) => ({ name: item.name, mobile: item.mobile })), channel: form.channel, type: 'admin_broadcast', title: form.title, message: form.message, meta: { source: 'admin_messaging' } });
        toast.success(`Broadcast queued for ${activeCustomers.length} customers`);
      } else {
        if (!/^[6-9]\d{9}$/.test(form.customerMobile)) throw new Error('Enter a valid 10 digit mobile number.');
        await sendOne.mutateAsync({ ...form, meta: { source: 'admin_messaging' } });
        toast.success('Message queued');
      }
      setForm((current) => ({ ...current, message: '' }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return <div className="flex flex-col gap-6 text-left">
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Customer communication</p>
      <h1 className="mt-1 text-2xl font-black text-slate-900">Messaging Center</h1>
      <p className="text-xs text-text-secondary mt-0.5">Send WhatsApp/SMS booking updates now; real provider keys can be connected later.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-8">
        <Card className="overflow-hidden border border-sky-100 bg-white shadow-[0_14px_40px_rgba(2,132,199,.08)]">
          <div className="bg-gradient-to-r from-sky-600 to-cyan-500 p-6 text-white"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><MessageSquare className="h-5 w-5" /></span><div><h3 className="font-black">Compose Customer Alert</h3><p className="mt-0.5 text-xs text-sky-50">Direct status updates, offers, or booking reminders.</p></div></div></div>
          <form onSubmit={submit} className="flex flex-col gap-5 p-6">
            <div className="grid gap-3 sm:grid-cols-2"><Choice active={mode === 'single'} icon={Smartphone} label="Single customer" onClick={() => setMode('single')} /><Choice active={mode === 'broadcast'} icon={Users} label={`All booking users (${activeCustomers.length})`} onClick={() => setMode('broadcast')} /></div>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Channel"><select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="admin-field"><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option></select></Field><Field label="Message type"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="admin-field"><option value="admin_message">Status update</option><option value="admin_broadcast">Offer / broadcast</option><option value="booking_created">Booking confirmation</option></select></Field></div>
            {mode === 'single' && <div className="grid gap-3 sm:grid-cols-2"><Input label="Recipient Mobile" placeholder="9876543210" value={form.customerMobile} onChange={(event) => setForm({ ...form, customerMobile: event.target.value.replace(/\D/g, '').slice(0, 10) })} maxLength={10} required /><Input label="Customer Name" placeholder="Customer name" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} /></div>}
            <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <Field label="Message content"><textarea rows={5} className="w-full resize-none rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-800 placeholder:text-slate-400" placeholder="Hello, your booking status has been updated..." value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></Field>
            <div className="pt-2 flex justify-end"><Button type="submit" variant="primary" icon={Send} disabled={sendOne.isPending || broadcast.isPending} className="px-5">{mode === 'broadcast' ? 'Send Broadcast' : 'Send Alert'}</Button></div>
          </form>
        </Card>
      </div>

      <div className="md:col-span-4 flex flex-col gap-6">
        <Card className="p-5 bg-white border border-sky-100 shadow-sm text-xs">
          <h4 className="flex items-center gap-2 font-bold text-slate-900 uppercase mb-2"><Radio className="h-4 w-4 text-sky-600" /> Latest Messages</h4>
          <div className="mt-3 flex flex-col gap-3">
            {notifications.length === 0 ? <p className="text-text-secondary">No messages queued yet.</p> : notifications.map((item) => <div key={item._id} className="rounded-xl border border-sky-100 bg-sky-50/50 p-3"><div className="flex justify-between gap-2"><span className="font-bold text-slate-900">{item.customerName || item.customerMobile}</span><span className="font-bold uppercase text-sky-600">{item.status}</span></div><p className="mt-1 line-clamp-2 text-slate-500">{item.message}</p></div>)}
          </div>
        </Card>
      </div>
    </div>
  </div>;
}

function Choice({ active, icon: Icon, label, onClick }) {
  return <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold ${active ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-sky-100 text-slate-500'}`}><Icon className="h-4 w-4" />{label}</button>;
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</span>{children}</label>;
}
