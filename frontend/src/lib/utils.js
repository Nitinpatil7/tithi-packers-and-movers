import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getBookingScheduledDate(booking = {}) {
  return booking.scheduledDate
    || booking.scheduledate
    || booking.scheduleDate
    || booking.movingDate
    || booking.moveDate
    || booking.date
    || booking.schedule?.date
    || booking.schedule?.scheduledDate
    || booking.quoteSnapshot?.scheduledDate
    || booking.quoteSnapshot?.scheduledate
    || booking.quoteSnapshot?.schedule?.date
    || '';
}

export function getBookingTimeSlot(booking = {}) {
  return booking.timeSlot
    || booking.timeslot
    || booking.slot
    || booking.time
    || booking.schedule?.timeSlot
    || booking.schedule?.timeslot
    || booking.schedule?.slot
    || booking.quoteSnapshot?.timeSlot
    || booking.quoteSnapshot?.timeslot
    || booking.quoteSnapshot?.schedule?.timeSlot
    || '';
}

export function formatBookingDate(booking, fallback = 'Not scheduled') {
  const value = getBookingScheduledDate(booking);
  return formatDate(value) || fallback;
}

export function formatBookingTimeSlot(booking, labels = {}, fallback = 'Slot not set') {
  const value = getBookingTimeSlot(booking);
  if (!value) return fallback;
  return labels[value] || String(value).replace(/[_-]/g, ' ');
}

export function getServiceLabel(serviceKey) {
  const labels = {
    local: 'Local Shifting',
    local_shifting: 'Local Shifting',
    intercity: 'Intercity Moving',
    intercity_moving: 'Intercity Moving',
    porter_labour_service: 'Porter & Labour Service',
    labour: 'Porter & Labour Service',
    'labour-service': 'Porter & Labour Service',
    packing: 'Packing Service',
    commercial: 'Commercial Relocation'
  };
  return labels[serviceKey] || serviceKey;
}

export function getStatusLabel(statusKey) {
  const labels = {
    pending: 'Pending',
    quote_sent: 'Quote Sent',
    confirmed: 'Confirmed',
    'in-progress': 'In Progress',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[statusKey] || statusKey;
}

export function getStatusColorClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    case 'quote_sent':
      return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
    case 'confirmed':
      return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    case 'in-progress':
    case 'in_progress':
      return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
    case 'completed':
      return 'bg-green-500/10 text-green-500 border border-green-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-500 border border-red-500/20';
    default:
      return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
  }
}
