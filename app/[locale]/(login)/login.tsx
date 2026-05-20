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

    const data = new FormData();
    data.append('userId', userId?.toString() || '');
    data.append('token', token);
    data.append('email', email || '');
    data.append('redirect', redirect || '');

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
        setTwoFAError(result.error || 'Invalid verification code');
      }
    } catch {
      setTwoFAError('Something went wrong. Please try again.');
    } finally {
      setPending2FA(false);
    }
  };

  if (loginState.needs2FA && !show2FA) {
    setShow2FA(true);
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden font-sans">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] -z-10 rounded-full" />

      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_home')}
          </Button>
        </Link>
      </div>

      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md bg-card/80 backdrop-blur-md border border-border/50 shadow-2xl rounded-2xl p-8 animate-in fade-in zoom-in duration-500">

        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 shadow-sm">
             <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-center">
            {show2FA ? 'Two-Factor Authentication' : mode === 'signin' ? t('welcome_back') : t('create_account')}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
            {show2FA ? 'Enter the code from your authenticator app' : mode === 'signin' ? t('signin_desc') : t('signup_desc')}
          </p>
        </div>

        {!show2FA ? (
          <form className="space-y-5" action={loginAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />

            <div className="space-y-2">
              <Label htmlFor="email">{t('email_label')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={50}
                className="h-11 bg-background/50 border-border/60 focus:bg-background transition-all"
                placeholder="name@example.com"
                defaultValue={loginState.email}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password_label')}</Label>
                {mode === 'signin' && (
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline opacity-80 hover:opacity-100">
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
                className="h-11 bg-background/50 border-border/60 focus:bg-background transition-all"
                placeholder="••••••••"
                defaultValue={loginState.password}
              />
            </div>

            {loginState?.error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                {loginState.error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-full text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={loginPending}
            >
              {loginPending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {mode === 'signin' ? t('signing_in') : t('creating_account')}
                </>
              ) : mode === 'signin' ? t('sign_in') : t('sign_up')}
            </Button>
          </form>
        ) : (
          <form className="space-y-5" action={handle2FAVerify}>
            <input type="hidden" name="redirect" value={redirect || ''} />

            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                required
                className="h-11 bg-background/50 border-border/60 focus:bg-background transition-all text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            {twoFAError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                {twoFAError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-full text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={pending2FA}
            >
              {pending2FA ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : 'Verify'}
            </Button>

            <button
              type="button"
              onClick={() => setShow2FA(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm">
          {!show2FA && (
            <>
              <span className="text-muted-foreground">
                {mode === 'signin' ? t('no_account') : t('has_account')}
              </span>
              <Link
                href={authSwitchHref}
                className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
              >
                {mode === 'signin' ? t('sign_up') : t('sign_in')}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground/60">
        <p>© {new Date().getFullYear()} {siteName}. {t('rights_reserved')}</p>
      </div>
    </main>
  );
}
