'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Bot,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  MessageSquare,
  Mic2,
  Phone,
  Send,
  Settings,
  Users,
  X,
  Zap,
} from 'lucide-react';

interface OnboardingBannerProps {
  teamName?: string;
  hasInstance: boolean;
  hasContacts: boolean;
  hasAutomations: boolean;
  hasVoiceAgent?: boolean;
  hasVoiceModel?: boolean;
  hasVoiceTelephony?: boolean;
  hasVoicePhoneNumber?: boolean;
  hasTeamMembers?: boolean;
}

export function OnboardingBanner({
  teamName,
  hasInstance,
  hasContacts,
  hasAutomations,
  hasVoiceAgent = false,
  hasVoiceModel = false,
  hasVoiceTelephony = false,
  hasVoicePhoneNumber = false,
  hasTeamMembers = false,
}: OnboardingBannerProps) {
  const t = useTranslations('OnboardingBanner');
  const [isGrowthOpen, setIsGrowthOpen] = useState(false);
  const [isGrowthDismissed, setIsGrowthDismissed] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  useEffect(() => {
    setIsGrowthDismissed(window.localStorage.getItem('kyrn:onboarding:growth-dismissed') === 'true');
    setIsBannerDismissed(window.localStorage.getItem('kyrn:onboarding:banner-dismissed') === 'true');
  }, []);

  const coreSteps = [
    {
      id: 'connect',
      label: t('steps.connect.label'),
      description: t('steps.connect.description'),
      done: hasInstance,
      href: '/settings/connect',
      icon: MessageSquare,
    },
    {
      id: 'contacts',
      label: t('steps.contacts.label'),
      description: t('steps.contacts.description'),
      done: hasContacts,
      href: '/contacts',
      icon: Users,
    },
    {
      id: 'automate',
      label: t('steps.automate.label'),
      description: t('steps.automate.description'),
      done: hasAutomations,
      href: '/automation',
      icon: Zap,
    },
  ];

  const growthSteps = [
    {
      id: 'voice-model',
      label: t('steps.voiceModel.label'),
      description: t('steps.voiceModel.description'),
      done: hasVoiceModel,
      href: '/voice/models',
      icon: Settings,
    },
    {
      id: 'voice-agent',
      label: t('steps.voiceAgent.label'),
      description: t('steps.voiceAgent.description'),
      done: hasVoiceAgent,
      href: '/voice',
      icon: Mic2,
    },
    {
      id: 'telephony',
      label: t('steps.telephony.label'),
      description: t('steps.telephony.description'),
      done: hasVoiceTelephony || hasVoicePhoneNumber,
      href: '/voice/telephony',
      icon: Phone,
    },
    {
      id: 'team',
      label: t('steps.team.label'),
      description: t('steps.team.description'),
      done: hasTeamMembers,
      href: '/settings',
      icon: Send,
    },
  ];

  const completedCoreCount = coreSteps.filter((step) => step.done).length;
  const completedGrowthCount = growthSteps.filter((step) => step.done).length;
  const totalSteps = coreSteps.length + growthSteps.length;
  const completedCount = completedCoreCount + completedGrowthCount;
  const allDone = completedCount === totalSteps;
  const nextStep = [...coreSteps, ...growthSteps].find((step) => !step.done);
  const progress = Math.round((completedCount / totalSteps) * 100);

  if (allDone || isBannerDismissed) return null;

  return (
    <section className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-[#303630] dark:bg-[#151816]">
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem('kyrn:onboarding:banner-dismissed', 'true');
          setIsBannerDismissed(true);
        }}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-500 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900 dark:border-[#303630] dark:bg-[#171b18]/95 dark:text-zinc-400 dark:hover:text-white"
        aria-label={t('dismissSetup')}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-5 pr-12 sm:p-6 sm:pr-14">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f9ed] text-[#14933a] dark:bg-[#14331f] dark:text-[#35c45f]">
                <Bot className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {t('title', { teamName: teamName || t('workspaceFallback') })}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {t('description')}
              </p>
            </div>
            {nextStep && (
              <Button asChild className="h-10 shrink-0 rounded-lg bg-[#35c45f] px-4 text-sm font-semibold text-white hover:bg-[#2fb154]">
                <Link href={nextStep.href}>
                  {t('continueSetup')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span>{t('progress', { completed: completedCount, total: totalSteps })}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-[#242a26]">
              <div className="h-full rounded-full bg-[#35c45f] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {coreSteps.map((step) => (
              <OnboardingStep key={step.id} {...step} />
            ))}
          </div>
        </div>

        {!isGrowthDismissed && (
          <aside className="border-t border-zinc-200 bg-zinc-50 dark:border-[#303630] dark:bg-[#101312] xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between gap-3 p-4 xl:p-5">
              <button
                type="button"
                onClick={() => setIsGrowthOpen((current) => !current)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg text-left"
                aria-expanded={isGrowthOpen}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                    {t('nextLevel')}
                  </span>
                  <span className="mt-1 block truncate text-sm text-zinc-600 dark:text-zinc-300">
                    {nextStep ? nextStep.label : t('growthComplete')}
                  </span>
                </span>
                {isGrowthOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.localStorage.setItem('kyrn:onboarding:growth-dismissed', 'true');
                  setIsGrowthDismissed(true);
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white hover:text-zinc-700 dark:hover:bg-[#171b18] dark:hover:text-zinc-200"
                aria-label={t('dismissNextLevel')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {isGrowthOpen && (
              <div className="space-y-2.5 px-4 pb-4 xl:px-5 xl:pb-5">
                {growthSteps.map((step) => (
                  <CompactStep key={step.id} {...step} />
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}

function OnboardingStep({
  label,
  description,
  done,
  href,
  icon: Icon,
}: {
  label: string;
  description: string;
  done: boolean;
  href: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={`group min-h-[142px] rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
        done
          ? 'border-[#b7edc5] bg-[#f2fbf4] dark:border-[#245f34] dark:bg-[#102018]'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-[#303630] dark:bg-[#171b18] dark:hover:border-[#3b443d]'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${done ? 'bg-white text-[#14933a] dark:bg-[#173421] dark:text-[#35c45f]' : 'bg-zinc-100 text-zinc-500 dark:bg-[#202620] dark:text-zinc-300'}`}>
          {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </span>
        {!done && <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-300" />}
      </div>
      <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">{label}</h3>
      <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>
    </Link>
  );
}

function CompactStep({
  label,
  description,
  done,
  href,
  icon: Icon,
}: {
  label: string;
  description: string;
  done: boolean;
  href: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-white dark:hover:bg-[#171b18]"
    >
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#e8f9ed] text-[#14933a] dark:bg-[#14331f] dark:text-[#35c45f]' : 'bg-white text-zinc-400 dark:bg-[#202620] dark:text-zinc-400'}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white">
          {!done && <Icon className="h-3.5 w-3.5 text-zinc-400" />}
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-4 text-zinc-500 dark:text-zinc-400">{description}</span>
      </span>
    </Link>
  );
}
