import { redirect } from 'next/navigation';

export default function LegacyPricingPage() {
  redirect('/admin/items');
}
