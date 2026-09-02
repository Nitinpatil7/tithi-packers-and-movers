'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, CalendarDays, CheckCircle2, ChevronDown, Edit3, MessageSquare, Radio, Save, Send, Smartphone, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@tithi/ui/Card';
import Button from '@tithi/ui/Button';
import Input from '@tithi/ui/Input';
import { useAdminUsers, useInAppNotifications, useMarkInAppNotificationRead, useNotificationTemplates, useNotifications, useSendNotification, useUpdateNotificationTemplate } from '@/hooks/useAdmin';

const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const MESSAGE_STATUSES = [
  { value: 'received', backendStatus: 'pending', label: 'Booking received', notificationType: 'booking_created', title: 'Booking received' },
  { value: 'pending', backendStatus: 'pending', label: 'Request pending', notificationType: 'status_update', title: 'Booking request pending' },
  { value: 'quote_sent', backendStatus: 'quote_sent', label: 'Quote sent', notificationType: 'quote_sent', title: 'Quote sent for your booking' },
  { value: 'confirmed', backendStatus: 'confirmed', label: 'Booking confirmed', notificationType: 'status_update', title: 'Booking confirmed' },
  { value: 'in_progress', backendStatus: 'in_progress', label: 'Move in progress', notificationType: 'status_update', title: 'Move in progress' },
  { value: 'completed', backendStatus: 'completed', label: 'Booking completed', notificationType: 'booking_completed', title: 'Booking completed' },
  { value: 'cancelled', backendStatus: 'cancelled', label: 'Booking cancelled', notificationType: 'status_update', title: 'Booking cancelled' },
];

const statusByValue = (value) => MESSAGE_STATUSES.find((item) => item.value === value) || MESSAGE_STATUSES[0];

const trackingUrlFor = ({ bookingId, mobile }) => {
  const query = new URLSearchParams();
  if (bookingId) query.set('bookingId', bookingId);
  if (mobile) query.set('mobile', mobile);
  return `${WEBSITE_URL}/my-bookings${query.toString() ? `?${query.toString()}` : ''}`;
};
const feedbackUrlPreview = () => `${WEBSITE_URL}/feedback`;

const renderTemplate = (template = '', values = {}) => String(template || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => (
  values[key] === undefined || values[key] === null ? '' : String(values[key])
));

const buildStatusTemplate = ({ status, customerName, customerMobile, bookingId, templates = [] }) => {
  const statusItem = statusByValue(status);
  const name = String(customerName || '').trim() || 'Customer';
  const ref = bookingId ? ` ${bookingId}` : '';
  const trackingUrl = trackingUrlFor({ bookingId, mobile: customerMobile });
  const isCompleted = statusItem.backendStatus === 'completed';
  const feedbackUrl = feedbackUrlPreview();
  const savedTemplate = templates.find((item) => item.status === statusItem.backendStatus);
  const values = {
    companyName: 'Tithi Packers and Movers',
    customerName: name,
    bookingId: bookingId || '',
    status: statusItem.label,
    trackingUrl: isCompleted ? feedbackUrl : trackingUrl,
    feedbackUrl,
  };
  if (savedTemplate?.message) {
    return {
      type: statusItem.notificationType,
      title: renderTemplate(savedTemplate.title || statusItem.title, values),
      message: renderTemplate(savedTemplate.message, values),
      trackingUrl: isCompleted ? '' : trackingUrl,
      feedbackUrl: isCompleted ? feedbackUrl : '',
    };
  }
  const linesByStatus = {
    received: `Hello ${name}, we have received your Tithi Packers and Movers booking${ref}. Our team will review the details and contact you shortly.`,
    pending: `Hello ${name}, your Tithi Packers and Movers booking${ref} is currently pending review. Our team is checking the details.`,
    quote_sent: `Hello ${name}, your quote for Tithi Packers and Movers booking${ref} has been shared. Please review the booking status using the link below.`,
    confirmed: `Hello ${name}, your Tithi Packers and Movers booking${ref} is confirmed. Our team will arrive as per the scheduled time.`,
    in_progress: `Hello ${name}, your Tithi Packers and Movers booking${ref} is now in progress. You can track the latest status using the link below.`,
    completed: `Hello ${name}, your Tithi Packers and Movers booking${ref} is completed. Thank you for choosing us.`,
    cancelled: `Hello ${name}, your Tithi Packers and Movers booking${ref} has been cancelled. Please contact our team if you need help booking again.`,
  };
  return {
    type: statusItem.notificationType,
    title: statusItem.title,
    message: isCompleted
      ? `${linesByStatus[statusItem.value]}\n\nShare feedback: ${feedbackUrl}\n\nPlease open the link and submit your review.`
      : `${linesByStatus[statusItem.value]}\n\nTrack booking: ${trackingUrl}\n\nOpen the link, enter the captcha, and your booking details will show automatically.`,
    trackingUrl: isCompleted ? '' : trackingUrl,
    feedbackUrl: isCompleted ? feedbackUrl : '',
  };
};

const initialTemplate = buildStatusTemplate({ status: 'received', customerName: '', customerMobile: '', bookingId: '' });

export default function AdminMessagingPage() {
  const searchParams = useSearchParams();
  const showUnread = searchParams.get('view') === 'unread';
  const [form, setForm] = useState({ channel: 'whatsapp', type: initialTemplate.type, messageStatus: 'received', customerMobile: '', customerName: '', bookingId: '', title: initialTemplate.title, message: initialTemplate.message, trackingUrl: initialTemplate.trackingUrl, feedbackUrl: initialTemplate.feedbackUrl || '' });
  const { data: notifications = [] } = useNotifications({ limit: 12 });
  const { data: unreadNotifications = [], isLoading: unreadLoading } = useInAppNotifications({ isRead: 'false', limit: 50 });
  const { data: templates = [], isLoading: templatesLoading } = useNotificationTemplates();
  const updateTemplate = useUpdateNotificationTemplate();
  const sendOne = useSendNotification();
  const markRead = useMarkInAppNotificationRead();
  const recentNotifications = useMemo(() => notifications, [notifications]);

  const applyTemplate = useCallback((nextForm) => {
    const template = buildStatusTemplate({
      status: nextForm.messageStatus,
      customerName: nextForm.customerName,
      customerMobile: nextForm.customerMobile,
      bookingId: nextForm.bookingId,
      templates,
    });
    return {
      ...nextForm,
      type: template.type,
      title: template.title,
      message: template.message,
      trackingUrl: template.trackingUrl,
      feedbackUrl: template.feedbackUrl || '',
    };
  }, [templates]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mobile = (params.get('mobile') || '').replace(/\D/g, '').slice(0, 10);
    const name = params.get('name') || '';
    const bookingId = params.get('bookingId') || params.get('bookingid') || '';
    if (mobile || name || bookingId) {
      setForm((current) => applyTemplate({ ...current, customerMobile: mobile, customerName: name, bookingId }));
    }
  }, [applyTemplate]);

  const updateMessageStatus = (messageStatus) => {
    setForm((current) => applyTemplate({ ...current, messageStatus }));
  };

  const pickRecipient = (user) => {
    setForm((current) => applyTemplate({
      ...current,
      customerMobile: user.mobile || '',
      customerName: user.name || current.customerName,
      bookingId: user.lastBookingId || user.bookingid || user.bookingId || current.bookingId,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (!form.message.trim()) throw new Error('Message is required.');
      if (!/^[6-9]\d{9}$/.test(form.customerMobile)) throw new Error('Enter a valid 10 digit mobile number.');
      const { bookingId, messageStatus, trackingUrl, feedbackUrl, ...notificationPayload } = form;
      const isCompletedMessage = messageStatus === 'completed';
      const notification = await sendOne.mutateAsync({
        ...notificationPayload,
        meta: {
          source: 'admin_messaging',
          messageStatus,
          bookingNumber: bookingId,
          trackingUrl: isCompletedMessage ? undefined : trackingUrl || trackingUrlFor({ bookingId, mobile: form.customerMobile }),
          feedbackUrl: isCompletedMessage ? feedbackUrl : undefined,
        },
      });
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
              {unreadNotifications.map((item) => <InAppNotificationCard key={item._id} item={item} onRead={() => markRead.mutateAsync(item._id)} busy={markRead.isPending} />)}
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
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Channel"><select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className="admin-field"><option value="whatsapp">WhatsApp</option></select></Field><Field label="Message type"><select value={form.messageStatus} onChange={(event) => updateMessageStatus(event.target.value)} className="admin-field">{MESSAGE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></Field></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <RecipientMobilePicker
                mobile={form.customerMobile}
                name={form.customerName}
                onMobileChange={(customerMobile) => setForm((current) => ({ ...current, customerMobile }))}
                onPick={pickRecipient}
              />
              <Input label="Customer Name" placeholder="Customer name" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
            </div>
            <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <Field label="Message content"><textarea rows={5} className="w-full resize-none rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-800 placeholder:text-slate-400" placeholder="Hello, your booking status has been updated..." value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></Field>
            <div className="pt-2 flex justify-end"><Button type="submit" variant="primary" icon={Send} disabled={sendOne.isPending} className="px-5">Send Alert</Button></div>
          </form>
        </Card>
      </div>

      <div className="md:col-span-4 flex flex-col gap-6">
        <TemplateSettingsPanel
          templates={templates}
          loading={templatesLoading}
          saving={updateTemplate.isPending}
          onSave={(status, data) => updateTemplate.mutateAsync({ status, data })}
        />
        <LatestMessagesPanel messages={recentNotifications} />
      </div>
    </div>
  </div>;
}

function LatestMessagesPanel({ messages = [] }) {
  const visibleMessages = messages.slice(0, 10);

  return (
    <Card className="w-full min-w-0 border border-sky-100 bg-white p-5 text-xs shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h4 className="flex min-w-0 items-center gap-2 font-bold uppercase text-slate-900">
          <Radio className="h-4 w-4 shrink-0 text-sky-600" />
          <span className="truncate">Latest Messages</span>
        </h4>
        {messages.length > 10 && <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-700">10 latest</span>}
      </div>
      <div className="mt-3 grid max-h-[620px] gap-2 overflow-y-auto pr-1">
        {visibleMessages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-sky-100 bg-sky-50/50 p-4 text-text-secondary">No messages queued yet.</p>
        ) : visibleMessages.map((item) => (
          <div key={item._id} className="min-w-0 rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 truncate font-bold text-slate-900">{item.customerName || item.customerMobile}</span>
              <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase text-sky-600">{item.status}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-slate-500">{item.message}</p>
            {item.meta?.whatsappActionUrl && <a className="mt-2 inline-block text-xs font-bold text-sky-700 hover:underline" href={item.meta.whatsappActionUrl} target="_blank" rel="noreferrer">Open WhatsApp</a>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TemplateSettingsPanel({ templates, loading, saving, onSave }) {
  const [editingStatus, setEditingStatus] = useState('');
  const [draft, setDraft] = useState({ title: '', message: '' });

  const editTemplate = (template) => {
    setEditingStatus(template.status);
    setDraft({ title: template.title || '', message: template.message || '' });
  };

  const save = async () => {
    if (!editingStatus) return;
    try {
      await onSave(editingStatus, draft);
      toast.success('Template updated');
      setEditingStatus('');
    } catch (error) {
      toast.error(error.message || 'Could not update template');
    }
  };

  return (
    <Card className="border border-sky-100 bg-white p-5 shadow-sm text-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 font-bold text-slate-900 uppercase mb-2"><MessageSquare className="h-4 w-4 text-sky-600" /> Notification Templates</h4>
          <p className="text-slate-500">Edit any status template anytime. Use placeholders like {'{{customerName}}'}, {'{{bookingId}}'}, {'{{trackingUrl}}'}, {'{{feedbackUrl}}'}.</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="rounded-xl border border-dashed border-sky-100 p-4 text-center font-semibold text-slate-400">Loading templates...</p>
        ) : templates.map((template) => (
          <div key={template.status} className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            {editingStatus === template.status ? (
              <div className="space-y-2">
                <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="admin-field bg-white" placeholder="Template title" />
                <textarea value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} rows={4} className="admin-field resize-y bg-white" placeholder="Template message" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingStatus('')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-bold text-slate-600">Cancel</button>
                  <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 font-bold text-white disabled:opacity-50"><Save className="h-3.5 w-3.5" />Update</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-black uppercase text-sky-700">{template.status?.replaceAll('_', ' ')}</p>
                  <p className="mt-1 truncate font-bold text-slate-900">{template.title}</p>
                  <p className="mt-1 line-clamp-2 text-slate-500">{template.message}</p>
                </div>
                <button type="button" onClick={() => editTemplate(template)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-sky-100 bg-white px-3 py-2 font-bold text-sky-700"><Edit3 className="h-3.5 w-3.5" />Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecipientMobilePicker({ mobile, name, onMobileChange, onPick }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const search = showAll ? '' : String(mobile || '').trim();
  const { data: users = [], isLoading } = useAdminUsers({ search, limit: showAll ? 300 : 8 });
  const visibleUsers = useMemo(() => {
    const query = String(mobile || '').trim().toLowerCase();
    const list = Array.isArray(users) ? users : [];
    if (showAll || !query) return list;
    return list.filter((user) => [user.mobile, user.name, user.email].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [mobile, showAll, users]);

  const chooseUser = (user) => {
    onPick(user);
    setOpen(false);
    setShowAll(false);
  };

  const handleChange = (event) => {
    onMobileChange(event.target.value.replace(/\D/g, '').slice(0, 10));
    setShowAll(false);
    setOpen(true);
  };

  return (
    <Field label="Recipient Mobile">
      <div className="relative" onBlur={() => window.setTimeout(() => setOpen(false), 120)}>
        <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
        <input
          value={mobile}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          inputMode="numeric"
          maxLength={10}
          required
          placeholder="Search or type 10 digit mobile"
          className="admin-field pl-10 pr-12 font-mono"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setShowAll((value) => !value);
            setOpen(true);
          }}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
          aria-label="Show customer list"
        >
          <ChevronDown className={`h-4 w-4 transition ${open && showAll ? 'rotate-180' : ''}`} />
        </button>

        {open && (showAll || mobile) && (
          <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
            {isLoading ? (
              <div className="rounded-xl px-3 py-5 text-center text-xs font-semibold text-slate-400">Loading customers...</div>
            ) : visibleUsers.length ? (
              visibleUsers.map((user) => (
                <button
                  key={user.mobile || user._id || `${user.name}-${user.email}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseUser(user)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-sky-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-black text-slate-900">{user.name || name || 'Customer'}</strong>
                    <span className="mt-0.5 block truncate font-mono text-xs font-bold text-slate-500">{user.mobile || '-'}</span>
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-xl px-3 py-5 text-center text-xs font-semibold text-slate-400">
                No matching customer found.
              </div>
            )}
          </div>
        )}
      </div>
    </Field>
  );
}

function InAppNotificationCard({ item, onRead, busy }) {
  const router = useRouter();
  const booking = item.bookingId;
  const bookingId = booking?.bookingid || item.meta?.bookingNumber;
  const contactId = item.meta?.contactId;
  const contactHref = item.meta?.path || (contactId ? `/contacts?highlight=${encodeURIComponent(contactId)}` : '/contacts');
  const feedbackHref = item.meta?.path || '/testimonials?status=inactive&source=feedback';
  const scheduledAt = booking?.scheduledate || item.meta?.scheduledAt;
  const scheduledLabel = scheduledAt ? new Date(scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Schedule not set';
  const handleMarkRead = async () => {
    await onRead?.();
    if (item.type === 'testimonial_feedback') router.push(feedbackHref);
  };

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
            <span>Customer: {booking?.customer?.name || item.meta?.customerName || (item.type === 'contact_query' ? 'Website visitor' : 'Customer')}</span>
            <span>Status: {booking?.status?.replaceAll('_', ' ') || 'Not linked'}</span>
            <span>Service: {booking?.serviceType?.replaceAll('_', ' ') || item.meta?.serviceType?.replaceAll('_', ' ') || item.meta?.source?.replaceAll('_', ' ') || '-'}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {item.type === 'contact_query' && (
            <Link href={contactHref} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-50">
              View query
            </Link>
          )}
          {item.type === 'testimonial_feedback' && (
            <Link href={feedbackHref} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-50">
              Review feedback
            </Link>
          )}
          {bookingId && (
            <Link href={`/bookings/${encodeURIComponent(bookingId)}`} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100">
              View booking
            </Link>
          )}
          <button type="button" onClick={handleMarkRead} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-700 disabled:opacity-50">
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
