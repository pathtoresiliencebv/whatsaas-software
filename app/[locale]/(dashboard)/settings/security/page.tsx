'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Trash2, Loader2, Shield, Copy, Check, Download } from 'lucide-react';
import { useActionState } from 'react';
import { updatePassword, deleteAccount } from '@/app/[locale]/(login)/actions';
import { useTranslations } from 'next-intl';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

type Setup2FAState = {
  secret?: string;
  backupCodes?: string[];
  error?: string;
  success?: boolean;
};

export default function SecurityPage() {
  const t = useTranslations('Settings');
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  const [userEmail, setUserEmail] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setUserEmail(data.email);
          setIs2FAEnabled(data.twoFactorEnabled || false);
        }
      })
      .catch(console.error);
  }, []);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<Setup2FAState | null>(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [disableError, setDisableError] = useState('');

  const handleSetup2FA = async () => {
    setIsSettingUp(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setSetupData({
          secret: data.secret,
          backupCodes: data.backupCodes,
          success: true
        });
      } else {
        setSetupData({ error: data.error || 'Failed to set up 2FA' });
      }
    } catch {
      setSetupData({ error: 'Something went wrong' });
    }
    setIsSettingUp(false);
  };

  const handleVerifyAndEnable = async () => {
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken }),
      });
      const data = await response.json();
      if (response.ok) {
        setIs2FAEnabled(true);
        setShowSetup(false);
        setSetupData(null);
        setVerifyToken('');
      } else {
        setSetupData((prev) => prev ? { ...prev, error: data.error } : null);
      }
    } catch {
      setSetupData((prev) => prev ? { ...prev, error: 'Verification failed' } : null);
    }
  };

  const handleDisable2FA = async () => {
    setDisableError('');
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword, token: disableToken }),
      });
      const data = await response.json();
      if (response.ok) {
        setIs2FAEnabled(false);
        setDisablePassword('');
        setDisableToken('');
      } else {
        setDisableError(data.error || 'Failed to disable 2FA');
      }
    } catch {
      setDisableError('Something went wrong');
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    if (setupData?.backupCodes) {
      const content = setupData.backupCodes.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold mb-6">
        {t('security_settings_title')}
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {is2FAEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">2FA is enabled</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your account is protected with two-factor authentication.
              </p>
              {!showSetup && (
                <Button variant="outline" onClick={() => setShowSetup(true)}>
                  Disable 2FA
                </Button>
              )}
              {showSetup && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm font-medium">Disable Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    To disable 2FA, enter your password and a verification code from your authenticator app.
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Verificatiecode"
                      value={disableToken}
                      onChange={(e) => setDisableToken(e.target.value)}
                    />
                  </div>
                  {disableError && (
                    <p className="text-red-500 text-sm">{disableError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleDisable2FA}>2FA uitschakelen</Button>
                    <Button variant="ghost" onClick={() => setShowSetup(false)}>Annuleren</Button>
                  </div>
                </div>
              )}
            </div>
          ) : setupData?.success && setupData.backupCodes ? (
            <div className="space-y-4">
              <p className="font-medium">Scan deze QR-code met je authenticator-app:</p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/Kyrn:${userEmail}?secret=${setupData.secret}&issuer=Kyrn`)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Or enter this secret key manually:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-1 rounded font-mono text-sm flex-1">
                    {setupData.secret}
                  </code>
                  <Button size="sm" variant="outline" onClick={copySecret}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Bewaar je herstelcodes:</p>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  {setupData.backupCodes.map((code, i) => (
                    <code key={i} className="font-mono text-sm">{code}</code>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                  <Download className="h-4 w-4 mr-2" />
                  Herstelcodes downloaden
                </Button>
                <p className="text-xs text-muted-foreground">
                  Bewaar deze codes veilig. Elke code kan maar een keer worden gebruikt.
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Enter the 6-digit code from your app to verify:</p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    className="w-32 text-center tracking-widest"
                  />
                  <Button onClick={handleVerifyAndEnable}>Enable 2FA</Button>
                </div>
                {setupData.error && (
                  <p className="text-red-500 text-sm">{setupData.error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              {setupData?.error && (
                <p className="text-red-500 text-sm">{setupData.error}</p>
              )}
              <Button onClick={handleSetup2FA} disabled={isSettingUp}>
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('password_card_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={passwordAction}>
            <div>
              <Label htmlFor="current-password" className="mb-2">
                {t('current_password_label')}
              </Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.currentPassword}
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="mb-2">
                {t('new_password_label')}
              </Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.newPassword}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="mb-2">
                {t('confirm_new_password_label')}
              </Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.confirmPassword}
              />
            </div>
            {passwordState.error && (
              <p className="text-red-500 text-sm">{passwordState.error}</p>
            )}
            {passwordState.success && (
              <p className="text-green-500 text-sm">{passwordState.success}</p>
            )}
            <Button
              type="submit"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('updating_btn')}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {t('update_password_btn')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('delete_account_card_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            {t('delete_account_desc')}
          </p>
          <form action={deleteAction} className="space-y-4">
            <div>
              <Label htmlFor="delete-password" className="mb-2">
                {t('confirm_password_label')}
              </Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={deleteState.password}
              />
            </div>
            {deleteState.error && (
              <p className="text-red-500 text-sm">{deleteState.error}</p>
            )}
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting_btn')}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('delete_account_btn')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
