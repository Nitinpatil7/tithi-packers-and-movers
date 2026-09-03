import ProfileClient from './ProfileClient';

export const metadata = {
  title: 'Customer Profile for Tithi Packers & Movers',
  description: 'Manage your customer profile and bookings with No. 1 Packers and Movers in Surat for local and intercity moves.',
  alternates: { canonical: '/profile' },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
