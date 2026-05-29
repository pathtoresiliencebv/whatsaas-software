'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Headphones,
  MessageSquare,
  Mic2,
  Rocket,
  Send,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type WelcomeOnboardingDialogProps = {
  teamName?: string;
  hasInstance?: boolean;
  hasAutomations?: boolean;
  hasVoiceAgent?: boolean;
};

type AnswerState = {
  goal: string;
  teamSize: string;
  firstChannel: string;
};

export function WelcomeOnboardingDialog({
  teamName,
  hasInstance = false,
  hasAutomations = false,
  hasVoiceAgent = false,
}: WelcomeOnboardingDialogProps) {
  const t = useTranslations('WelcomeOnboarding');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({
    goal: '',
    teamSize: '',
    firstChannel: '',
  });

  const trigger = searchParams.get('onboarding') || searchParams.get('email_verified');
  const storageKey = useMemo(() => `kyrn:onboarding:v2:${teamName || 'workspace'}`, [teamName]);
  const isPaidStart = searchParams.get('onboarding') === 'paid';
  const goalOptions = useMemo(() => [
    { id: 'support', label: t('goals.support'), icon: Headphones },
    { id: 'sales', label: t('goals.sales'), icon: Send },
    { id: 'automation', label: t('goals.automation'), icon: Workflow },
    { id: 'voice', label: t('goals.voice'), icon: Mic2 },
  ], [t]);
  const teamOptions = useMemo(() => [
    t('teamSizes.solo'),
    t('teamSizes.small'),
    t('teamSizes.medium'),
    t('teamSizes.large'),
  ], [t]);
  const channelOptions = useMemo(() => [
    t('channels.inbox'),
    t('channels.whatsappAgents'),
    t('channels.voiceAgents'),
    t('channels.campaigns'),
  ], [t]);
  const productCards = useMemo(() => [
    {
      title: t('products.inbox.title'),
      description: t('products.inbox.description'),
      icon: MessageSquare,
    },
    {
      title: t('products.whatsappAgents.title'),
      description: t('products.whatsappAgents.description'),
      icon: Bot,
    },
    {
      title: t('products.voiceAgents.title'),
      description: t('products.voiceAgents.description'),
      icon: Mic2,
    },
    {
      title: t('products.campaigns.title'),
      description: t('products.campaigns.description'),
      icon: Rocket,
    },
  ], [t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const seen = window.localStorage.getItem(storageKey);
    if (trigger || (!seen && !hasInstance && !hasAutomations)) {
      setOpen(true);
      setStep(0);
    }
  }, [hasAutomations, hasInstance, storageKey, trigger]);

  function persistAndCleanUrl(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      window.localStorage.setItem(storageKey, JSON.stringify({ completedAt: new Date().toISOString(), answers }));
      router.replace('/dashboard', { scroll: false });
    }
  }

  function completeAndNavigate(href: string) {
    window.localStorage.setItem(storageKey, JSON.stringify({ completedAt: new Date().toISOString(), answers }));
    setOpen(false);
    router.push(href);
  }

  function updateAnswer(key: keyof AnswerState, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  const nextHref = !hasInstance
    ? '/settings/connect'
    : !hasAutomations
      ? '/automation'
      : !hasVoiceAgent
        ? '/voice'
        : '/dashboard/chat';

  return (
    <Dialog open={open} onOpenChange={persistAndCleanUrl}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-zinc-200 bg-white p-0 text-zinc-950 shadow-2xl sm:max-w-3xl dark:border-[#303630] dark:bg-[#111314] dark:text-white">
        <div className="grid lg:grid-cols-[260px_1fr]">
          <aside className="hidden border-r border-zinc-200 bg-zinc-50 p-5 dark:border-[#303630] dark:bg-[#0c0f0e] lg:block">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f9ed] text-[#14933a] dark:bg-[#14331f] dark:text-[#35c45f]">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">{t('sidebar.title')}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {t('sidebar.description')}
            </p>
            <div className="mt-8 space-y-3">
              {[t('steps.welcome'), t('steps.intake'), t('steps.product'), t('steps.action')].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                    step >= index ? 'bg-[#35c45f] text-white' : 'bg-white text-zinc-400 dark:bg-[#202620]'
                  )}>
                    {step > index ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className={cn('text-sm', step === index ? 'font-semibold text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400')}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          <div className="p-5 sm:p-7">
            {step === 0 && (
              <WelcomeStep
                teamName={teamName}
                isPaidStart={isPaidStart}
                t={t}
                onNext={() => setStep(1)}
                onSkip={() => persistAndCleanUrl(false)}
              />
            )}
            {step === 1 && (
              <QuestionStep
                answers={answers}
                goalOptions={goalOptions}
                teamOptions={teamOptions}
                channelOptions={channelOptions}
                t={t}
                onAnswer={updateAnswer}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <ProductStep
                cards={productCards}
                t={t}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <ActionStep
                answers={answers}
                goalOptions={goalOptions}
                t={t}
                onBack={() => setStep(2)}
                onDone={() => completeAndNavigate(nextHref)}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WelcomeStep({
  teamName,
  isPaidStart,
  t,
  onNext,
  onSkip,
}: {
  teamName?: string;
  isPaidStart: boolean;
  t: ReturnType<typeof useTranslations<'WelcomeOnboarding'>>;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <DialogHeader className="text-left">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9ed] text-[#14933a] dark:bg-[#14331f] dark:text-[#35c45f]">
          <Rocket className="h-6 w-6" />
        </div>
        <DialogTitle className="text-3xl font-semibold tracking-tight">
          {isPaidStart ? t('welcome.paidTitle') : t('welcome.title')}
        </DialogTitle>
        <DialogDescription className="pt-2 text-base leading-7 text-zinc-500 dark:text-zinc-400">
          {teamName ? t('welcome.descriptionWithTeam', { teamName }) : t('welcome.description')}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[
          ['1', t('welcome.card1')],
          ['2', t('welcome.card2')],
          ['3', t('welcome.card3')],
        ].map(([number, label]) => (
          <div key={number} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#303630] dark:bg-[#171b18]">
            <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#14933a] dark:bg-[#202620] dark:text-[#35c45f]">
              {number}
            </span>
            <p className="text-sm font-medium leading-5">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onSkip} className="rounded-lg text-zinc-500">
          {t('actions.skip')}
        </Button>
        <Button onClick={onNext} className="rounded-lg bg-[#35c45f] text-white hover:bg-[#2fb154]">
          {t('actions.begin')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

function QuestionStep({
  answers,
  goalOptions,
  teamOptions,
  channelOptions,
  t,
  onAnswer,
  onBack,
  onNext,
}: {
  answers: AnswerState;
  goalOptions: Array<{ id: string; label: string; icon: ComponentType<{ className?: string }> }>;
  teamOptions: string[];
  channelOptions: string[];
  t: ReturnType<typeof useTranslations<'WelcomeOnboarding'>>;
  onAnswer: (key: keyof AnswerState, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="text-2xl font-semibold tracking-tight">{t('questions.title')}</DialogTitle>
        <DialogDescription className="pt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {t('questions.description')}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-6">
        <OptionGroup
          title={t('questions.goalTitle')}
          options={goalOptions.map((option) => ({ ...option, value: option.id }))}
          value={answers.goal}
          onChange={(value) => onAnswer('goal', value)}
        />
        <SimplePillGroup
          title={t('questions.teamTitle')}
          options={teamOptions}
          value={answers.teamSize}
          onChange={(value) => onAnswer('teamSize', value)}
        />
        <SimplePillGroup
          title={t('questions.channelTitle')}
          options={channelOptions}
          value={answers.firstChannel}
          onChange={(value) => onAnswer('firstChannel', value)}
        />
      </div>

      <FooterActions
        onBack={onBack}
        onNext={onNext}
        backLabel={t('actions.back')}
        nextLabel={t('actions.next')}
      />
    </>
  );
}

function ProductStep({
  cards,
  t,
  onBack,
  onNext,
}: {
  cards: Array<{ title: string; description: string; icon: ComponentType<{ className?: string }> }>;
  t: ReturnType<typeof useTranslations<'WelcomeOnboarding'>>;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="text-2xl font-semibold tracking-tight">{t('product.title')}</DialogTitle>
        <DialogDescription className="pt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {t('product.description')}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-[#303630] dark:bg-[#171b18]">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f9ed] text-[#14933a] dark:bg-[#14331f] dark:text-[#35c45f]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">{card.title}</p>
              <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">{card.description}</p>
            </div>
          );
        })}
      </div>

      <FooterActions onBack={onBack} onNext={onNext} backLabel={t('actions.back')} nextLabel={t('actions.chooseFirstStep')} />
    </>
  );
}

function ActionStep({
  answers,
  goalOptions,
  t,
  onBack,
  onDone,
}: {
  answers: AnswerState;
  goalOptions: Array<{ id: string; label: string; icon: ComponentType<{ className?: string }> }>;
  t: ReturnType<typeof useTranslations<'WelcomeOnboarding'>>;
  onBack: () => void;
  onDone: () => void;
}) {
  const chosenGoal = goalOptions.find((option) => option.id === answers.goal)?.label;

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="text-2xl font-semibold tracking-tight">{t('action.title')}</DialogTitle>
        <DialogDescription className="pt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {chosenGoal
            ? t('action.descriptionWithGoal', { goal: chosenGoal.toLowerCase() })
            : t('action.description')}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 rounded-2xl border border-[#b7edc5] bg-[#f2fbf4] p-5 dark:border-[#245f34] dark:bg-[#102018]">
        <p className="text-sm font-semibold text-zinc-950 dark:text-white">{t('action.orderTitle')}</p>
        <ol className="mt-4 space-y-3">
          {[
            t('action.order1'),
            t('action.order2'),
            t('action.order3'),
            t('action.order4'),
          ].map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-5 text-zinc-700 dark:text-zinc-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#14933a] dark:bg-[#173421] dark:text-[#35c45f]">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onBack} className="rounded-lg text-zinc-500">
          {t('actions.back')}
        </Button>
        <Button onClick={onDone} className="rounded-lg bg-[#35c45f] text-white hover:bg-[#2fb154]">
          {t('actions.startFirstStep')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Array<{ value: string; label: string; icon: ComponentType<{ className?: string }> }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition',
                active
                  ? 'border-[#35c45f] bg-[#f2fbf4] text-zinc-950 dark:bg-[#102018] dark:text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-[#303630] dark:bg-[#171b18] dark:text-zinc-300'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-[#14933a] dark:text-[#35c45f]' : 'text-zinc-400')} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SimplePillGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                'rounded-full border px-3 py-2 text-sm transition',
                active
                  ? 'border-[#35c45f] bg-[#35c45f] text-white'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-[#303630] dark:bg-[#171b18] dark:text-zinc-300'
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FooterActions({
  onBack,
  onNext,
  backLabel,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <Button variant="ghost" onClick={onBack} className="rounded-lg text-zinc-500">
        {backLabel}
      </Button>
      <Button onClick={onNext} className="rounded-lg bg-[#35c45f] text-white hover:bg-[#2fb154]">
        {nextLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
