import BookingUpdateClient from './BookingUpdateClient';

export const metadata = {
  title: 'Update Moving Booking in Surat',
  description: 'Update items and add-on services for your Tithi Packers & Movers booking with No. 1 Packers and Movers in Surat.',
  alternates: { canonical: '/my-bookings' },
};

export default function BookingUpdatePage() {
  return <BookingUpdateClient />;
}
