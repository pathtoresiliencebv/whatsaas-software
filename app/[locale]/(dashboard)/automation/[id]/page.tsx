import { notFound, redirect } from 'next/navigation';
import { WhatsAppAgentEditor } from '@/components/automation/WhatsAppAgentEditor';
import { getAutomation } from '../actions';

export default async function AutomationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const automationId = Number(id);
  if (!Number.isFinite(automationId)) redirect('/automation');

  const automation = await getAutomation(automationId);
  if (!automation) notFound();

  return (
    <WhatsAppAgentEditor
      automation={{
        id: automation.id,
        name: automation.name,
        triggerKeyword: automation.triggerKeyword,
        isActive: automation.isActive,
        instanceLabel: automation.instance?.integration || 'WhatsApp automation',
        nodes: automation.nodes,
        edges: automation.edges,
      }}
    />
  );
}
