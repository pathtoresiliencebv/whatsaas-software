'use client';

import React, { useEffect, useState } from 'react';
import KanbanBoard from './KanbanBoard';
import { OnboardingBanner } from '@/components/dashboard/OnboardingBanner';

type OnboardingStatus = {
  hasInstance: boolean;
  hasContacts: boolean;
  hasAutomations: boolean;
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
    <div className="flex flex-col h-full bg-muted p-6 gap-4">
      {status && (
        <OnboardingBanner
          hasInstance={status.hasInstance}
          hasContacts={status.hasContacts}
          hasAutomations={status.hasAutomations}
        />
      )}
      <KanbanBoard />
    </div>
  );
}