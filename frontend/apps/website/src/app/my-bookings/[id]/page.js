import BookingDetailClient from './BookingDetailClient';

export const metadata = {
  title: 'Booking Details for Packers and Movers in Surat',
  description: 'View your Tithi Packers & Movers booking details, quote and moving status with No. 1 Packers and Movers in Surat.',
  alternates: { canonical: '/my-bookings' },
};

export default function BookingDetailPage() {
  return <BookingDetailClient />;
}
