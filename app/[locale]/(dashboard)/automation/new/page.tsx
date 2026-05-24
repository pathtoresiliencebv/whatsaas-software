import { redirect } from 'next/navigation';
import { WhatsAppAgentCreateFlow } from '@/components/automation/WhatsAppAgentCreateFlow';
import { getTeamForUser } from '@/lib/db/queries';
import { enforceFeature } from '@/lib/limits';

export default async function NewAutomationPage() {
  const team = await getTeamForUser();
  if (!team) redirect('/sign-in');

  try {
    await enforceFeature(team.id, 'isFlowBuilderEnabled');
  } catch {
    redirect('/dashboard');
  }

  return <WhatsAppAgentCreateFlow instances={team.evolutionInstances || []} />;
}
