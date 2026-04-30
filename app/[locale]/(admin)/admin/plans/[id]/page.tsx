import { redirect } from 'next/navigation';

export default function PlanEditPage({ params }: { params: { id: string } }) {
  redirect('/settings/billing');
}
