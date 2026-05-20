import { getBranding } from '@/lib/db/queries/branding';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Terms of Service',
  description: 'Read our terms and conditions.',
};

export default async function TermsPage() {
  const branding = await getBranding();
  const siteName = branding?.name || 'Kyrn';

  return (
    <main className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using {siteName}, you accept and agree to be bound by these terms. If you do not agree with any part of these terms, do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Service Description</h2>
            <p>
              {siteName} provides a WhatsApp Business management platform that enables teams to automate conversations, manage contacts, and run campaigns. We reserve the right to modify, suspend, or discontinue any part of the service with 30 days notice, except in urgent circumstances affecting security or compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Your Data</h2>
            <p>
              You retain full ownership of all data you submit to {siteName}. We process your data solely to provide, secure, and improve the service in accordance with our Data Processing Agreement. We do not use your conversation content to train AI models or share it with third parties, except as required to deliver the service (e.g., AI provider for automated responses).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Proprietary Rights</h2>
            <p>
              {siteName} and its original content, features, and functionality are owned by the company and are protected by intellectual property laws. You may not copy, modify, or distribute our proprietary content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Acceptable Use</h2>
            <p>
              You agree not to use {siteName} to send unsolicited messages, spam, or any content that violates WhatsApp Business policies or applicable law. You are responsible for obtaining proper consent before contacting recipients via WhatsApp. {siteName} reserves the right to suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Billing and Subscription</h2>
            <p>
              Paid subscriptions are billed according to your selected plan. You may cancel your subscription at any time from your account settings. Access to paid features ends at the current billing period. No refunds are provided for partial periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Termination</h2>
            <p>
              You may terminate your account at any time through your account settings. Upon termination, you may export your data within 30 days. We will delete your data within 60 days of account closure, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Disclaimer of Warranties</h2>
            <p>
              {siteName} is provided "as is" and "as available." We do not warrant that the service will be uninterrupted, secure, or error-free. You use the service at your own discretion and risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {siteName} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you in the 12 months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Contact</h2>
            <p>
              For questions about these terms, contact us at hello@{siteName.toLowerCase().replace(/\s+/g, '')}.nl
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
