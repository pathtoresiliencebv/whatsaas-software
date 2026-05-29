'use client';

import { useEffect, useState } from 'react';
import KanbanBoard from './KanbanBoard';
import { OnboardingBanner } from '@/components/dashboard/OnboardingBanner';
import { WelcomeOnboardingDialog } from '@/components/dashboard/WelcomeOnboardingDialog';

type OnboardingStatus = {
  teamName?: string;
  hasInstance: boolean;
  hasContacts: boolean;
  hasAutomations: boolean;
  hasVoiceAgent?: boolean;
  hasVoiceModel?: boolean;
  hasVoiceTelephony?: boolean;
  hasVoicePhoneNumber?: boolean;
  hasTeamMembers?: boolean;
};

export default function DashboardPage() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    fetch('/api/onboarding/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full bg-muted">
      <div className="flex flex-col flex-1 p-6 gap-4 overflow-y-auto">
        {status && (
          <>
            <WelcomeOnboardingDialog
              teamName={status.teamName}
              hasInstance={status.hasInstance}
              hasAutomations={status.hasAutomations}
              hasVoiceAgent={status.hasVoiceAgent}
            />
            <OnboardingBanner
              teamName={status.teamName}
              hasInstance={status.hasInstance}
              hasContacts={status.hasContacts}
              hasAutomations={status.hasAutomations}
              hasVoiceAgent={status.hasVoiceAgent}
              hasVoiceModel={status.hasVoiceModel}
              hasVoiceTelephony={status.hasVoiceTelephony}
              hasVoicePhoneNumber={status.hasVoicePhoneNumber}
              hasTeamMembers={status.hasTeamMembers}
            />
          </>
        )}
        <KanbanBoard />
      </div>
    </div>
  );
}
