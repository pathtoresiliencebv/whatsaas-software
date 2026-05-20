import { getBranding } from '@/lib/db/queries/branding';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How we handle your data.',
};

export default async function PrivacyPage() {
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

        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Who We Are</h2>
            <p>
              {siteName} is a WhatsApp Business management platform. We act as a data processor for your customer data. Our company details and registration are available on request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. What Data We Collect</h2>
            <p>
              We collect the following data to provide our service:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account data:</strong> name, email address, password (hashed)</li>
              <li><strong>Billing data:</strong> subscription plan, payment history (via Stripe)</li>
              <li><strong>Team data:</strong> member names, roles, invitations</li>
              <li><strong>Contact data:</strong> names, phone numbers, chat history, tags, notes, funnel stages</li>
              <li><strong>Usage data:</strong> login timestamps, feature usage, API calls</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Data</h2>
            <p>
              We use your data solely to provide and improve the {siteName} service. This includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Delivering automated responses and AI agent functionality</li>
              <li>Routing and managing conversations</li>
              <li>Billing and account management</li>
              <li>Providing customer support</li>
              <li>Detecting and preventing abuse</li>
            </ul>
            <p className="mt-4">
              We do <strong>not</strong> use your conversation content to train machine learning models. We do not display ads based on your data. Your data is never sold.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. AI and External Processors</h2>
            <p>
              To provide AI-powered features (automated replies, lead qualification), your conversation data is processed by AI providers (OpenAI or Google AI). These providers process data under strict data processing agreements and are not permitted to use your data for model training. All AI processing occurs in data centers within the EU or in providers certified under the EU-U.S. Data Privacy Framework.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Storage and Security</h2>
            <p>
              Your data is stored on servers in the European Union. We use TLS 1.2+ encryption for data in transit and AES-256 encryption for data at rest. Access is restricted to authorized personnel only.
            </p>
            <p className="mt-4">
              Important: While WhatsApp provides end-to-end encryption for individual messages, {siteName} processes messages on our servers to deliver automation features. This means messages are decrypted briefly for processing and stored in our database.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Data Retention</h2>
            <p>
              Your data is retained for the duration of your subscription and for 30 days after account closure to allow data export. After this period, all personal data is deleted from our systems, except where retention is required by law (e.g., financial records).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Your Rights (GDPR)</h2>
            <p>
              Under GDPR, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Right of Access:</strong> Request a copy of all personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Correct any inaccurate personal data.</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your account and associated data.</li>
              <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format (JSON).</li>
              <li><strong>Right to Object:</strong> Object to certain processing of your personal data.</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at hello@{siteName.toLowerCase().replace(/\s+/g, '')}.nl or through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Data Export</h2>
            <p>
              You can export all your personal data at any time from your account settings. The export includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Profile information (name, email, role)</li>
              <li>Team memberships and permissions</li>
              <li>Contacts (names, phone numbers, tags, notes, custom fields)</li>
              <li>Full conversation history (all messages)</li>
              <li>Activity logs and automation flows</li>
              <li>Subscription information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Cookies</h2>
            <p>
              We use cookies solely to keep you logged in and to remember your preferences. We do not use advertising or tracking cookies.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Essential cookies:</strong> Required for authentication and session management. Cannot be disabled.</li>
              <li><strong>Functional cookies:</strong> Remember your language and UI preferences. Can be disabled without affecting functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Contact</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at hello@{siteName.toLowerCase().replace(/\s+/g, '')}.nl
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
