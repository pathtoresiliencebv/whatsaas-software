'use client';

import { useEffect, useState } from 'react';
import KanbanBoard from './KanbanBoard';
import { OnboardingBanner } from '@/components/dashboard/OnboardingBanner';
import Logo from '@/components/interface/Logo';

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
    <div className="flex flex-col h-full bg-muted">
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo className="h-8" />
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s an overview of your workspace.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-6 gap-4 overflow-y-auto">
        {status && (
          <OnboardingBanner
            hasInstance={status.hasInstance}
            hasContacts={status.hasContacts}
            hasAutomations={status.hasAutomations}
          />
        )}
        <KanbanBoard />
      </div>
    </div>
  );
}