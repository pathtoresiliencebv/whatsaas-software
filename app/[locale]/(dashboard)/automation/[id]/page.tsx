import { redirect } from 'next/navigation';

export default function AutomationDetailPage({ params }: { params: { id: string } }) {
  redirect('/automation');
}
