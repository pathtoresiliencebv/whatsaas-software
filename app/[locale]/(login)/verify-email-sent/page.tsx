'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Logo from '@/components/interface/Logo';
import { CheckCircle2, Mail, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

export default function VerifyEmailSentPage() {
  const t = useTranslations('VerifyEmailSent');
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t('resendSuccess'));
      } else {
        setStatus('error');
        setMessage(data.error || t('resendError'));
      }
    } catch {
      setStatus('error');
      setMessage(t('genericError'));
    }
  };

  return (
    <main className="min-h-screen bg-white px-5 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-center">
          <Link href="/" aria-label="Kyrn">
            <Logo className="h-8" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1fr)]">
          <div className="mx-auto w-full max-w-md text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9ed] text-[#14933a] dark:bg-[#14331f] dark:text-[#35c45f] lg:mx-0">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight">{t('title')}</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {email ? t('descriptionWithEmail', { email }) : t('description')}
            </p>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t('noEmailTitle')}</p>
              <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                {t('noEmailDescription')}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {email && status !== 'success' && (
                <Button
                  onClick={handleResend}
                  disabled={status === 'loading'}
                  variant="outline"
                  className="h-11 flex-1 rounded-xl"
                >
                  {status === 'loading' ? t('sending') : t('resend')}
                </Button>
              )}
              <Button asChild className="h-11 flex-1 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                <Link href="/sign-in">{t('continueSignIn')}</Link>
              </Button>
            </div>

            {status === 'success' && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/70 dark:bg-green-950/30 dark:text-green-300">
                {message}
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                {message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="mb-4 text-sm font-semibold text-zinc-950 dark:text-zinc-50">{t('afterTitle')}</p>
            <div className="space-y-3">
              <OnboardingPreviewStep
                icon={MessageSquare}
                title={t('steps.connect.title')}
                description={t('steps.connect.description')}
              />
              <OnboardingPreviewStep
                icon={Zap}
                title={t('steps.agent.title')}
                description={t('steps.agent.description')}
              />
              <OnboardingPreviewStep
                icon={ShieldCheck}
                title={t('steps.launch.title')}
                description={t('steps.launch.description')}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function OnboardingPreviewStep({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f9ed] text-[#14933a] dark:bg-[#14331f] dark:text-[#35c45f]">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {title}
          <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
        </span>
        <span className="mt-1 block text-sm leading-5 text-zinc-500 dark:text-zinc-400">{description}</span>
      </span>
    </div>
  );
}
