import MyBookingsClient from './MyBookingsClient';

export const metadata = {
  title: 'Track Booking with Packers and Movers in Surat',
  description: 'Track your Tithi Packers & Movers booking in Surat and check live shifting updates from No. 1 Packers and Movers.',
  alternates: { canonical: '/my-bookings' },
};

export default function MyBookingsPage() {
  return <MyBookingsClient />;
}
