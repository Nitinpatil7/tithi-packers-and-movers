'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ImagePlus, LocateFixed, MessageSquareQuote, Send, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '@tithi/ui/Spinner';
import { submitSimpleFeedback } from '@tithi/lib/testimonialApi';

const MAX_IMAGE_BYTES = 1200 * 1024;
const COMPRESSED_IMAGE_MAX_WIDTH = 1400;
const COMPRESSED_IMAGE_QUALITY = 0.78;

const formatAddress = (place = {}) => {
  const address = place.formatted_address || place.name || '';
  return String(address).trim();
};

const compressImage = (file) => new Promise((resolve, reject) => {
  const image = new window.Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    const scale = Math.min(1, COMPRESSED_IMAGE_MAX_WIDTH / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not compress image.'));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSED_IMAGE_QUALITY);
    URL.revokeObjectURL(objectUrl);
    resolve(dataUrl);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Could not read image.'));
  };
  image.src = objectUrl;
});

export default function SimpleFeedbackPage() {
  const [form, setForm] = useState({ name: '', location: '', rating: 5, content: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(false);
  const locationInputRef = useRef(null);

  useEffect(() => {
    let autocomplete = null;
    let timer = null;
    let attempts = 0;
    const attachAutocomplete = () => {
      attempts += 1;
      if (!locationInputRef.current || !window.google?.maps?.places?.Autocomplete) {
        if (attempts < 40) timer = window.setTimeout(attachAutocomplete, 250);
        return;
      }
      autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        componentRestrictions: { country: 'IN' },
        fields: ['formatted_address', 'name'],
        types: ['geocode'],
      });
      autocomplete.addListener('place_changed', () => {
        const location = formatAddress(autocomplete.getPlace());
        if (location) setForm((current) => ({ ...current, location }));
      });
    };
    attachAutocomplete();
    return () => {
      if (timer) window.clearTimeout(timer);
      if (autocomplete) window.google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Location is not available in this browser.');
    if (!window.google?.maps?.Geocoder) return toast.error('Maps are still loading. Please type your location or try again.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: coords.latitude, lng: coords.longitude }, region: 'IN', language: 'en' }, (results, status) => {
          setLocating(false);
          if (status !== 'OK' || !results?.length) return toast.error('Could not detect a readable location.');
          setForm((current) => ({ ...current, location: results[0].formatted_address || current.location }));
        });
      },
      () => {
        setLocating(false);
        toast.error('Location permission denied. You can type your location manually.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const chooseImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.');
    try {
      const imageUrl = await compressImage(file);
      if (imageUrl.length > MAX_IMAGE_BYTES * 1.4) return toast.error('Compressed image is still too large. Please choose a smaller image.');
      setForm((current) => ({ ...current, imageUrl }));
    } catch (error) {
      toast.error(error.message || 'Could not read image.');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      rating: Number(form.rating),
      content: form.content.trim(),
      imageUrl: form.imageUrl,
    };
    if (!payload.name) return toast.error('Please enter your name.');
    if (!payload.location) return toast.error('Please enter your location.');
    if (!payload.rating) return toast.error('Please select a star rating.');
    if (!payload.content) return toast.error('Please write your feedback.');
    try {
      setSubmitting(true);
      await submitSimpleFeedback(payload);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg-page px-4 pb-10 pt-28 sm:pt-32">
        <section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-black text-text-primary">Thank you</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">Your feedback has been submitted and will be reviewed by our team.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-page px-4 pb-10 pt-28 sm:pt-32">
      <section className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-card">
        <header className="bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-6 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/18">
            <MessageSquareQuote className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-black">Share your moving experience</h1>
          <p className="mt-1 text-sm font-semibold text-sky-50">Your words help our team improve.</p>
        </header>

        <form onSubmit={submit} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="booking-input" placeholder="Your name" />
            </Field>
            <Field label="Location *">
              <div className="flex gap-2">
                <input ref={locationInputRef} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required className="booking-input min-w-0 flex-1" placeholder="Search or use current location" />
                <button type="button" onClick={useCurrentLocation} disabled={locating} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-sky-50 text-primary disabled:opacity-60" aria-label="Use current location">
                  {locating ? <Spinner size="sm" /> : <LocateFixed className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          <Field label="Star rating *">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setForm({ ...form, rating })}
                  className={`grid h-12 place-items-center rounded-2xl border transition ${Number(form.rating) >= rating ? 'border-sky-300 bg-sky-50 text-sky-600' : 'border-sky-100 text-slate-300'}`}
                  aria-label={`${rating} star`}
                >
                  <Star className={`h-5 w-5 ${Number(form.rating) >= rating ? 'fill-sky-500' : ''}`} />
                </button>
              ))}
            </div>
          </Field>

          <Field label="Your words *">
            <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={5} required className="booking-input resize-none" placeholder="Tell us how your move went..." />
          </Field>

          <Field label="Image optional">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-4 text-sm font-black text-primary">
              <ImagePlus className="h-4 w-4" />
              Choose one image
              <input type="file" accept="image/*" capture="environment" onChange={chooseImage} className="sr-only" />
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
