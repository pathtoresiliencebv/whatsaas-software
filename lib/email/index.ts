import { Resend } from 'resend';
import { getBranding } from '@/lib/db/queries/branding';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function getAppBaseUrl() {
  const configuredUrl = process.env.BASE_URL;
  if (configuredUrl && !configuredUrl.includes('yourdomain.com')) {
    return configuredUrl.replace(/\/$/, '');
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export async function sendInvitationEmail(email: string, teamName: string, inviteId: number) {
  const resend = getResendClient();
  const inviteLink = `${getAppBaseUrl()}/sign-up?inviteId=${inviteId}`;
  const branding = await getBranding();
  const appName = branding?.name || 'Kyrn';

  try {
    await resend.emails.send({
      from: `${appName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: email,
      subject: `Invitation to join ${teamName} on ${appName}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <h2>You've been invited!</h2>
          <p>You have been invited to join the team <strong>${teamName}</strong> on ${appName}.</p>
          <p>Click the link below to accept the invitation and set up your account:</p>
          <p>
            <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #44A64D; color: white; text-decoration: none; border-radius: 5px;">
              Accept Invitation
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">
            Or copy this link: <br />
            <a href="${inviteLink}">${inviteLink}</a>
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send invitation email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resend = getResendClient();
  const resetLink = `${getAppBaseUrl()}/reset-password?token=${token}`;
  const branding = await getBranding();
  const appName = branding?.name || 'Kyrn';

  try {
    await resend.emails.send({
      from: `${appName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: email,
      subject: `Reset your password - ${appName}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset for your ${appName} account.</p>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <p style="margin: 24px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #44A64D; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">
            Or copy this link: <br />
            <a href="${resetLink}">${resetLink}</a>
          </p>
          <p style="font-size: 13px; color: #999; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const resend = getResendClient();
  const verifyLink = `${getAppBaseUrl()}/api/auth/verify-email?token=${token}`;
  const branding = await getBranding();
  const appName = branding?.name || 'Kyrn';

  try {
    await resend.emails.send({
      from: `${appName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: email,
      subject: `Verify your email - ${appName}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${appName}!</h2>
          <p>Please verify your email address to get started.</p>
          <p>Click the button below to verify your email. This link expires in 24 hours.</p>
          <p style="margin: 24px 0;">
            <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background-color: #44A64D; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">
            Or copy this link: <br />
            <a href="${verifyLink}">${verifyLink}</a>
          </p>
          <p style="font-size: 13px; color: #999; margin-top: 24px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}
