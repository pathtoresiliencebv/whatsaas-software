import { redirect } from 'next/navigation';

export default function PlanNewPage() {
  redirect('/settings/billing');
}
