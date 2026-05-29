'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { signIn, signUp, verify2FA } from '@/app/[locale]/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import Logo from '@/components/interface/Logo';
import { useBranding } from '@/providers/branding-provider';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { OAuthButton } from '@/components/ui/oauth-button';

interface LoginState extends ActionState {
  needs2FA?: boolean;
  userId?: number;
}

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const t = useTranslations('Auth');

  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const oauthError = searchParams.get('error');
  const authSwitchHref = (() => {
    const params = new URLSearchParams();
    if (redirect) params.set('redirect', redirect);
    if (priceId) params.set('priceId', priceId);
    if (inviteId) params.set('inviteId', inviteId);

    const query = params.toString();
    const path = mode === 'signin' ? '/sign-up' : '/sign-in';
    return query ? `${path}?${query}` : path;
  })();
  const [loginState, loginAction, loginPending] = useActionState<LoginState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const [show2FA, setShow2FA] = useState(false);
  const [pending2FA, setPending2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');

  const { branding } = useBranding();
  const siteName = branding?.name || 'Kyrn';

  const handle2FAVerify = async (formData: FormData) => {
    setPending2FA(true);
    setTwoFAError('');

    const userId = loginState.userId;
    const email = loginState.email;
    const token = formData.get('token') as string;

    try {
      const response = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          token,
          email,
          redirect: redirect || ''
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.location.href = redirect || '/dashboard';
      } else {
        setTwoFAError(result.error || t('invalid_verification_code'));
      }
    } catch {
      setTwoFAError(t('generic_error'));
    } finally {
      setPending2FA(false);
    }
  };

  if (loginState.needs2FA && !show2FA) {
    setShow2FA(true);
  }

  return (
    <main className="min-h-screen bg-white px-5 py-6 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="grid grid-cols-3 items-center">
          <Link href="/" className="justify-self-start">
            <Button variant="ghost" size="sm" className="-ml-3 h-9 rounded-xl px-3 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">{t('back_to_home')}</span>
            </Button>
          </Link>
          <Link href="/" className="justify-self-center" aria-label={siteName}>
            <Logo className="h-8" />
          </Link>
          <div className="justify-self-end">
            <LanguageSwitcher />
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-7 text-center">
              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.01em] text-zinc-950 dark:text-zinc-50">
                {show2FA ? t('two_step_verification') : mode === 'signin' ? t('welcome_back') : t('create_account')}
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {show2FA ? t('two_step_desc') : mode === 'signin' ? t('signin_desc') : t('signup_desc')}
              </p>
            </div>

            {!show2FA && (
              <>
                <div className="space-y-2.5">
                  <OAuthButton provider="google" redirect={redirect || undefined} mode={mode} />
                  <OAuthButton provider="github" redirect={redirect || undefined} mode={mode} />
                </div>

                {mode === 'signup' && (
                  <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {t('agree_prefix')}
                    <Link href="/terms" className="font-medium text-zinc-800 underline underline-offset-2 dark:text-zinc-200">
                      {t('terms_link')}
                    </Link>{' '}
                    {t('agree_middle')}
                    <Link href="/privacy" className="font-medium text-zinc-800 underline underline-offset-2 dark:text-zinc-200">
                      {t('privacy_link')}
                    </Link>
                    .
                  </p>
                )}

                <div className="my-6 h-px bg-zinc-200 dark:bg-zinc-800" />
              </>
            )}

            {!show2FA ? (
              <form className="space-y-4" action={loginAction}>
                <input type="hidden" name="redirect" value={redirect || ''} />
                <input type="hidden" name="priceId" value={priceId || ''} />
                <input type="hidden" name="inviteId" value={inviteId || ''} />

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">
                    {t('email_label')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={50}
                    className="h-12 rounded-xl border-zinc-200 bg-white px-4 text-[15px] shadow-none outline-none transition-colors placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-white/15"
                    placeholder="name@example.com"
                    defaultValue={loginState.email}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">
                      {t('password_label')}
                    </Label>
                    {mode === 'signin' && (
                      <Link href="/forgot-password" className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50">
                        {t('forgot_password')}
                      </Link>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    minLength={8}
                    maxLength={100}
                    className="h-12 rounded-xl border-zinc-200 bg-white px-4 text-[15px] shadow-none outline-none transition-colors placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-white/15"
                    placeholder="••••••••"
                    defaultValue={loginState.password}
                  />
                </div>

                {loginState?.error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                    {loginState.error}
                  </div>
                )}

                {oauthError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                    {oauthError === 'oauth_not_configured'
                      ? 'OAuth not configured. Contact support.'
                      : oauthError === 'oauth_failed'
                      ? 'OAuth login failed. Try again.'
                      : oauthError === 'oauth_no_code'
                      ? 'OAuth was cancelled.'
                      : `OAuth error: ${oauthError}`}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-zinc-950 text-[15px] font-semibold text-white shadow-none transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  disabled={loginPending}
                >
                  {loginPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'signin' ? t('signing_in') : t('creating_account')}
                    </>
                  ) : mode === 'signin' ? t('sign_in') : t('sign_up')}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" action={handle2FAVerify}>
                <input type="hidden" name="redirect" value={redirect || ''} />

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">
                    Verification Code
                  </Label>
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    className="h-12 rounded-xl border-zinc-200 bg-white text-center text-2xl tracking-widest shadow-none focus-visible:ring-2 focus-visible:ring-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-white/15"
                    placeholder="000000"
                  />
                </div>

                {twoFAError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-center text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                    {twoFAError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-zinc-950 text-[15px] font-semibold text-white shadow-none transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  disabled={pending2FA}
                >
                  {pending2FA ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : 'Verify'}
                </Button>

                <button
                  type="button"
                  onClick={() => setShow2FA(false)}
                  className="w-full rounded-xl py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Back to sign in
                </button>
              </form>
            )}

            {!show2FA && (
              <div className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
                {mode === 'signin' ? t('no_account') : t('has_account')}{' '}
                <Link href={authSwitchHref} className="font-semibold text-zinc-950 underline underline-offset-4 dark:text-zinc-50">
                  {mode === 'signin' ? t('sign_up') : t('sign_in')}
                </Link>
              </div>
            )}
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} {siteName}. {t('rights_reserved')}
        </footer>
      </div>
    </main>
  );
}
