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
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-6 overflow-hidden font-sans">
      {/* Background grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />

      {/* Header - mobile friendly */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-primary transition-colors -ml-2">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">{t('back_to_home')}</span>
          </Button>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Login Card */}
      <div className="w-full sm:max-w-sm md:max-w-md bg-card/80 backdrop-blur-md border border-border/50 shadow-2xl rounded-2xl p-5 sm:p-6 md:p-8 animate-in fade-in zoom-in duration-500 mt-12 sm:mt-0">

        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <Logo />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-center">
            {show2FA ? '2FA' : mode === 'signin' ? t('welcome_back') : t('create_account')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 text-center max-w-xs">
            {show2FA ? 'Enter your authenticator code' : mode === 'signin' ? t('signin_desc') : t('signup_desc')}
          </p>
        </div>

        {/* Sign In / Sign Up Form */}
        {!show2FA ? (
          <form className="space-y-4" action={loginAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">{t('email_label')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={50}
                className="h-10 sm:h-11 bg-background/50 border-border/60 focus:bg-background transition-all text-sm"
                placeholder="name@example.com"
                defaultValue={loginState.email}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">{t('password_label')}</Label>
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
                className="h-10 sm:h-11 bg-background/50 border-border/60 focus:bg-background transition-all text-sm"
                placeholder="••••••••"
                defaultValue={loginState.password}
              />
            </div>

            {/* Error Messages */}
            {loginState?.error && (
              <div className="p-2.5 sm:p-3 rounded-lg bg-destructive/10 text-destructive text-xs sm:text-sm text-center font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                {loginState.error}
              </div>
            )}

            {oauthError && (
              <div className="p-2.5 sm:p-3 rounded-lg bg-destructive/10 text-destructive text-xs sm:text-sm text-center font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-1">
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
              className="w-full h-10 sm:h-11 rounded-full text-sm sm:text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
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
          /* 2FA Form */
          <form className="space-y-4" action={handle2FAVerify}>
            <input type="hidden" name="redirect" value={redirect || ''} />

            <div className="space-y-1.5">
              <Label htmlFor="token" className="text-sm">Verification Code</Label>
              <Input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                required
                className="h-12 bg-background/50 border-border/60 focus:bg-background transition-all text-center text-xl sm:text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            {twoFAError && (
              <div className="p-2.5 sm:p-3 rounded-lg bg-destructive/10 text-destructive text-xs sm:text-sm text-center font-medium border border-destructive/20">
                {twoFAError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 sm:h-11 rounded-full text-sm sm:text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
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
              className="w-full text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Back to sign in
            </button>
          </form>
        )}

        {/* Sign up / sign in link */}
        <div className="mt-5 pt-4 border-t border-border/50 text-center">
          {!show2FA && (
            <span className="text-xs sm:text-sm text-muted-foreground">
              {mode === 'signin' ? t('no_account') : t('has_account')}{' '}
              <Link
                href={authSwitchHref}
                className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
              >
                {mode === 'signin' ? t('sign_up') : t('sign_in')}
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-[10px] sm:text-xs text-muted-foreground/60 px-4">
        <p>© {new Date().getFullYear()} {siteName}. {t('rights_reserved')}</p>
      </div>
    </main>
  );
}
