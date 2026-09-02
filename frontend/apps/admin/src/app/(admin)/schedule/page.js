import { redirect } from 'next/navigation';

export default function AdminSchedulePage({ searchParams = {} }) {
  const filter = searchParams.filter || '';
  redirect(`/bookings${filter ? `?filter=${encodeURIComponent(filter)}&view=today-scheduled` : '?view=today-scheduled'}`);
}
