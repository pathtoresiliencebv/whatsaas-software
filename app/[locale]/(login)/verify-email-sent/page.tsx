'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyEmailSentPage() {
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
        setMessage('Verification email sent! Check your inbox.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to resend email');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a verification link to your email address.
            Please click the link to verify your account.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try resending it.
          </p>
        </div>

        {email && status !== 'success' && (
          <Button
            onClick={handleResend}
            disabled={status === 'loading'}
            variant="outline"
            className="w-full"
          >
            {status === 'loading' ? 'Sending...' : 'Resend verification email'}
          </Button>
        )}

        {status === 'success' && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <div className="pt-4">
          <Link href="/sign-in">
            <Button variant="ghost">Back to sign in</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
