'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface OAuthButtonProps {
  provider: 'google' | 'github';
  redirect?: string;
  mode?: 'signin' | 'signup';
}

export function OAuthButton({ provider, redirect, mode = 'signin' }: OAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    const state = redirect ? encodeURIComponent(redirect) : '';
    window.location.href = `/api/auth/oauth/${provider}${state ? `?state=${state}` : ''}`;
  };

  const providerLabel = provider === 'google' ? 'Google' : 'GitHub';
  const actionLabel = mode === 'signin' ? 'Sign in' : 'Sign up';

  return (
    <Button
      type="button"
      variant="outline"
      className="relative h-11 w-full rounded-xl border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 shadow-none transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <span className="absolute left-4 flex h-5 w-5 items-center justify-center">
            {provider === 'google' ? <GoogleIcon /> : <GitHubIcon />}
          </span>
          <span>{actionLabel} with {providerLabel}</span>
        </>
      )}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-zinc-950 dark:text-zinc-50" aria-hidden="true">
      <path d="M12 1.5C6.2 1.5 1.5 6.3 1.5 12.2c0 4.7 3 8.6 7.2 10 .5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.3-3.5-1.3-.5-1.2-1.1-1.5-1.1-1.5-1-.7.1-.7.1-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3 .9.1-.7.4-1.1.7-1.4-2.3-.3-4.8-1.2-4.8-5.3 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1.9-.2 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.7 1.1 2.9 0 4.1-2.5 5-4.8 5.3.4.3.7 1 .7 2v2.9c0 .3.2.6.7.5 4.2-1.4 7.2-5.4 7.2-10C22.5 6.3 17.8 1.5 12 1.5Z" />
    </svg>
  );
}
