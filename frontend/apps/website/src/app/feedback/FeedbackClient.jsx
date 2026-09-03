'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ImagePlus, LocateFixed, MessageSquareQuote, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '@tithi/ui/Spinner';
import StarRating from '@tithi/ui/StarRating';
import { submitSimpleFeedback } from '@tithi/lib/testimonialApi';

const MAX_IMAGE_BYTES = 950 * 1024;
const COMPRESSED_IMAGE_MAX_WIDTH = 1400;
const COMPRESSED_IMAGE_MIN_WIDTH = 720;
const COMPRESSED_IMAGE_START_QUALITY = 0.82;
const COMPRESSED_IMAGE_MIN_QUALITY = 0.56;
const GEOLOCATION_OPTIONS = { enableHighAccuracy: true, timeout: 18000, maximumAge: 0 };

const stripPlusCodePrefix = (value = '') => String(value || '').replace(/^\s*[A-Z0-9]{2,}\+[A-Z0-9]{2,}\s*,?\s*/i, '').trim();
const component = (place, type) => place.address_components?.find((entry) => entry.types.includes(type))?.long_name || '';
const toLatLng = (location) => location && (typeof location.lat === 'function' ? { lat: location.lat(), lng: location.lng() } : { lat: Number(location.lat), lng: Number(location.lng) });
const isCoordinateAddress = (value = '') => /^[-+]?\d{1,3}(?:\.\d+)?\s*[, ]\s*[-+]?\d{1,3}(?:\.\d+)?$/.test(String(value).trim());
const isHumanAddress = (value = '') => {
  const text = stripPlusCodePrefix(value);
  if (text.length < 8 || isCoordinateAddress(text) || /^[A-Z0-9+]{4,}\s*[A-Z0-9+]*$/i.test(text)) return false;
  return /[a-z]/i.test(text);
};
const formatHumanAddress = (place = {}) => {
  if (!place || (place.types || []).includes('plus_code')) return '';
  const formatted = stripPlusCodePrefix(place.formatted_address);
  if (isHumanAddress(formatted)) return formatted;
  const street = [component(place, 'street_number'), component(place, 'route')].filter(Boolean).join(' ');
  const composed = [
    component(place, 'premise'),
    component(place, 'subpremise'),
    component(place, 'establishment'),
    street,
    component(place, 'neighborhood'),
    component(place, 'sublocality_level_2'),
    component(place, 'sublocality_level_1'),
    component(place, 'locality') || component(place, 'administrative_area_level_3'),
    component(place, 'administrative_area_level_1'),
    component(place, 'postal_code'),
  ].map((part) => String(part || '').trim()).filter(Boolean);
  const deduped = composed.filter((part, index) => composed.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index).join(', ');
  return isHumanAddress(deduped) ? deduped : '';
};
const placeRank = (place = {}) => {
  const types = place.types || [];
  if (types.includes('street_address') || types.includes('premise') || types.includes('subpremise')) return 1;
  if (types.includes('route') || types.includes('establishment')) return 2;
  if (types.includes('neighborhood') || types.includes('sublocality') || types.includes('sublocality_level_1')) return 3;
  if (types.includes('locality') || types.includes('postal_code')) return 4;
  if (types.includes('plus_code')) return 99;
  return 5;
};
const distanceMeters = (left, right) => {
  if (!left || !right) return Number.POSITIVE_INFINITY;
  const [lat1, lng1, lat2, lng2] = [left.lat, left.lng, right.lat, right.lng].map(Number);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Number.POSITIVE_INFINITY;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const chooseHumanAddressPlace = (results = [], origin = null) => [...results]
  .filter((place) => formatHumanAddress(place))
  .sort((a, b) => {
    const distanceA = origin ? distanceMeters(origin, toLatLng(a.geometry?.location)) : 0;
    const distanceB = origin ? distanceMeters(origin, toLatLng(b.geometry?.location)) : 0;
    if (Math.abs(distanceA - distanceB) > 75) return distanceA - distanceB;
    return placeRank(a) - placeRank(b);
  })[0] || null;

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
    let width = canvas.width;
    let height = canvas.height;
    let quality = COMPRESSED_IMAGE_START_QUALITY;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length > MAX_IMAGE_BYTES * 1.34 && (quality > COMPRESSED_IMAGE_MIN_QUALITY || Math.max(width, height) > COMPRESSED_IMAGE_MIN_WIDTH)) {
      quality = Math.max(COMPRESSED_IMAGE_MIN_QUALITY, quality - 0.08);
      if (quality <= COMPRESSED_IMAGE_MIN_QUALITY && Math.max(width, height) > COMPRESSED_IMAGE_MIN_WIDTH) {
        const ratio = Math.max(COMPRESSED_IMAGE_MIN_WIDTH / Math.max(width, height), 0.86);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
      }
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }
    URL.revokeObjectURL(objectUrl);
    if (dataUrl.length > MAX_IMAGE_BYTES * 1.34) reject(new Error('Compressed image is still too large. Please choose a smaller image.'));
    else resolve(dataUrl);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Could not read image.'));
  };
  image.src = objectUrl;
});

export default function SimpleFeedbackPage() {
  const [form, setForm] = useState({ name: '', location: '', rating: 0, content: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const locationInputRef = useRef(null);
  const autoLocatedRef = useRef(false);

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
      setMapsReady(true);
      autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        componentRestrictions: { country: 'IN' },
        fields: ['formatted_address', 'name'],
        types: ['geocode'],
      });
      autocomplete.addListener('place_changed', () => {
        const location = formatHumanAddress(autocomplete.getPlace());
        if (location) setForm((current) => ({ ...current, location }));
      });
    };
    attachAutocomplete();
    return () => {
      if (timer) window.clearTimeout(timer);
      if (autocomplete) window.google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, []);

  const fetchCurrentLocation = useCallback((silent = false) => {
    if (!navigator.geolocation) return toast.error('Location is not available in this browser.');
    if (!window.google?.maps?.Geocoder) {
      if (!silent) toast.error('Maps are still loading. Please type your location or try again.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const geocoder = new window.google.maps.Geocoder();
        const origin = { lat: coords.latitude, lng: coords.longitude };
        geocoder.geocode({ location: origin, region: 'IN', language: 'en' }, (results, status) => {
          setLocating(false);
          const place = status === 'OK' ? chooseHumanAddressPlace(results, origin) : null;
          const location = formatHumanAddress(place);
          if (!location) {
            if (!silent) toast.error('Could not detect a proper street address. Please search it manually.');
            return;
          }
          setForm((current) => ({ ...current, location }));
        });
      },
      () => {
        setLocating(false);
        if (!silent) toast.error('Location permission denied. You can type your location manually.');
      },
      GEOLOCATION_OPTIONS,
    );
  }, []);

  useEffect(() => {
    if (autoLocatedRef.current || form.location || !mapsReady || !window.google?.maps?.Geocoder) return;
    autoLocatedRef.current = true;
    fetchCurrentLocation(true);
  }, [form.location, mapsReady, fetchCurrentLocation]);

  const chooseImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.');
    try {
      const imageUrl = await compressImage(file);
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
                <button type="button" onClick={fetchCurrentLocation} disabled={locating} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-sky-50 text-primary disabled:opacity-60" aria-label="Use current location">
                  {locating ? <Spinner size="sm" /> : <LocateFixed className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          <Field label="Star rating *">
            <StarRating
              interactive
              rating={form.rating}
              size="md"
              onRate={(rating) => setForm({ ...form, rating })}
            />
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
