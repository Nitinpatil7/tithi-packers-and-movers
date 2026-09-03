import FeedbackClient from './FeedbackClient';

export const metadata = {
  title: 'Customer Feedback for Packers and Movers in Surat',
  description: 'Share your experience with Tithi Packers & Movers, the No. 1 Packers and Movers in Surat for local and intercity shifting.',
  alternates: { canonical: '/feedback' },
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
