'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CheckCircle2, ImagePlus, MessageSquareQuote, Send, Star, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '@tithi/ui/Spinner';
import { getFeedbackContext, submitFeedback } from '@tithi/lib/testimonialApi';

const MAX_IMAGE_BYTES = 1200 * 1024;

const readImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Could not read image.'));
  reader.readAsDataURL(file);
});

export default function FeedbackPage() {
  const { token } = useParams();
  const [context, setContext] = useState(null);
  const [form, setForm] = useState({ rating: 5, content: '', imageUrl: '', name: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getFeedbackContext(token)
      .then((data) => {
        if (!active) return;
        setContext(data);
        setForm((current) => ({
          ...current,
          name: data.customerName || '',
          location: data.location || '',
        }));
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'This feedback link is invalid or already used.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);

  const chooseImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.');
    if (file.size > MAX_IMAGE_BYTES) return toast.error('Image must be smaller than 1.2 MB.');
    try {
      const imageUrl = await readImage(file);
      setForm((current) => ({ ...current, imageUrl }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      rating: Number(form.rating),
      content: form.content.trim(),
      imageUrl: form.imageUrl,
      name: form.name.trim(),
      location: form.location.trim(),
    };
    if (!payload.rating) return toast.error('Please select a star rating.');
    if (!payload.content) return toast.error('Please write your feedback.');
    if (!payload.name) return toast.error('Please enter your name.');
    if (!payload.location) return toast.error('Please enter your location.');
    try {
      setSubmitting(true);
      await submitFeedback(token, payload);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-bg-page px-4"><Spinner size="lg" /></main>;
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg-page px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-6 text-center shadow-card">
          <MessageSquareQuote className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-xl font-black text-text-primary">Feedback link unavailable</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">{error}</p>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg-page px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-black text-text-primary">Thank you</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">Your feedback has been submitted and will be reviewed by our team.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-page px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-card">
        <header className="bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-6 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/18">
            <Truck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-black">Share your moving experience</h1>
          <p className="mt-1 text-sm font-semibold text-sky-50">Booking {context?.bookingId}</p>
        </header>

        <form onSubmit={submit} className="space-y-5 p-5">
          <Field label="Star rating *">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setForm({ ...form, rating })}
                  className={`grid h-12 place-items-center rounded-2xl border transition ${Number(form.rating) >= rating ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-sky-100 text-slate-300'}`}
                  aria-label={`${rating} star`}
                >
                  <Star className={`h-5 w-5 ${Number(form.rating) >= rating ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>
          </Field>

          <Field label="Your words *">
            <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={5} required className="booking-input resize-none" placeholder="Tell us how your move went..." />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="booking-input" />
            </Field>
            <Field label="Location *">
              <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required className="booking-input" />
            </Field>
          </div>

          <Field label="Image optional">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-4 text-sm font-black text-primary">
              <ImagePlus className="h-4 w-4" />
              Choose one image
              <input type="file" accept="image/*" onChange={chooseImage} className="sr-only" />
            </label>
            {form.imageUrl && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-sky-100">
                <Image unoptimized src={form.imageUrl} alt="Selected feedback" width={600} height={340} className="h-44 w-full object-cover" />
              </div>
            )}
          </Field>

          <button disabled={submitting} className="btn-sky flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black disabled:opacity-60">
            {submitting ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
            Submit feedback
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-text-tertiary">{label}</span>{children}</label>;
}
