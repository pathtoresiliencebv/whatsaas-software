'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingBannerProps {
  hasInstance: boolean;
  hasContacts: boolean;
  hasAutomations: boolean;
}

export function OnboardingBanner({ hasInstance, hasContacts, hasAutomations }: OnboardingBannerProps) {
  const t = useTranslations('Onboarding');

  const steps = [
    {
      id: 'connect',
      label: 'Connect WhatsApp',
      description: 'Link your WhatsApp number to start sending messages',
      done: hasInstance,
      href: '/settings/connect',
      icon: MessageSquare,
    },
    {
      id: 'contacts',
      label: 'Add Contacts',
      description: 'Import or add contacts to your WhatsApp campaigns',
      done: hasContacts,
      href: '/contacts',
      icon: CheckCircle2,
    },
    {
      id: 'automate',
      label: 'Create Automation',
      description: 'Build a flow or AI agent to handle messages automatically',
      done: hasAutomations,
      href: '/automation',
      icon: Zap,
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null;

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">
              {allDone ? '🎉 You\'re all set!' : `Setup ${completedCount}/${steps.length} complete`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {allDone
                ? 'Your WhatsApp is connected and ready to go.'
                : 'Complete these steps to get started with WhatSaaS:'}
            </p>
            <div className="flex flex-wrap gap-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <Link key={step.id} href={step.href}>
                    <Button
                      variant={step.done ? 'outline' : 'default'}
                      size="sm"
                      className="gap-2"
                    >
                      {step.done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      {step.label}
                      {!step.done && <ArrowRight className="h-3 w-3" />}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
