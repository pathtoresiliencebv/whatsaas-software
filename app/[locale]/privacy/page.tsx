import { getBranding } from '@/lib/db/queries/branding';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getLocale } from 'next-intl/server';

export const metadata = {
  title: 'Privacybeleid',
  description: 'Hoe Kyrn met je gegevens omgaat.',
};

export default async function PrivacyPage() {
  const branding = await getBranding();
  const locale = await getLocale();
  const siteName = branding?.name || 'Kyrn';
  const isEnglish = locale === 'en';

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> {isEnglish ? 'Back to home' : 'Terug naar home'}
          </Button>
        </Link>

        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
          {isEnglish ? 'Privacy Policy' : 'Privacybeleid'}
        </h1>
        <p className="mb-10 text-muted-foreground">
          {isEnglish ? 'Last updated' : 'Laatst bijgewerkt'}: {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'nl-NL')}
        </p>

        <div className="space-y-8 leading-relaxed text-foreground/90">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{isEnglish ? '1. Who We Are' : '1. Wie wij zijn'}</h2>
            <p>
              {isEnglish
                ? `${siteName} is a WhatsApp Business management platform. For customer data, we usually act as a processor on behalf of your workspace.`
                : `${siteName} is een WhatsApp Business-platform. Voor klantgegevens treden wij meestal op als verwerker namens jouw workspace.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '2. Data We Collect' : '2. Welke gegevens wij verzamelen'}
            </h2>
            <p>{isEnglish ? 'We collect the data needed to provide the service:' : 'We verzamelen gegevens die nodig zijn om de dienst te leveren:'}</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>{isEnglish ? 'Account data:' : 'Accountgegevens:'}</strong> {isEnglish ? 'name, email address, hashed password.' : 'naam, e-mailadres en gehashte wachtwoorden.'}</li>
              <li><strong>{isEnglish ? 'Billing data:' : 'Facturatiegegevens:'}</strong> {isEnglish ? 'subscription plan and payment history through Stripe.' : 'abonnement, betaalstatus en betaalhistorie via Stripe.'}</li>
              <li><strong>{isEnglish ? 'Team data:' : 'Teamgegevens:'}</strong> {isEnglish ? 'members, roles, invitations, and permissions.' : 'leden, rollen, uitnodigingen en rechten.'}</li>
              <li><strong>{isEnglish ? 'Contact data:' : 'Contactgegevens:'}</strong> {isEnglish ? 'names, phone numbers, chat history, tags, notes, and funnel stages.' : 'namen, telefoonnummers, chatgeschiedenis, tags, notities en funnel-fases.'}</li>
              <li><strong>{isEnglish ? 'Usage data:' : 'Gebruiksgegevens:'}</strong> {isEnglish ? 'logins, feature usage, API calls, and audit logs.' : 'logins, functiegebruik, API-verzoeken en auditlogs.'}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '3. How We Use Data' : '3. Hoe wij gegevens gebruiken'}
            </h2>
            <p>
              {isEnglish
                ? `We use data only to provide, secure, support, and improve ${siteName}. We do not sell your data and do not use conversation content to train AI models.`
                : `We gebruiken gegevens alleen om ${siteName} te leveren, te beveiligen, ondersteuning te bieden en te verbeteren. We verkopen je gegevens niet en gebruiken gespreksinhoud niet om AI-modellen te trainen.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '4. AI and External Processors' : '4. AI en externe verwerkers'}
            </h2>
            <p>
              {isEnglish
                ? 'For AI-powered features such as automated replies, lead qualification, and voice agents, conversation data may be processed by selected AI providers under data processing agreements.'
                : 'Voor AI-functies zoals automatische antwoorden, leadkwalificatie en voice agents kunnen gespreksgegevens worden verwerkt door geselecteerde AI-providers onder verwerkersovereenkomsten.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '5. Storage and Security' : '5. Opslag en beveiliging'}
            </h2>
            <p>
              {isEnglish
                ? 'We use encryption in transit, restricted access, audit logs, and operational controls to protect your data.'
                : 'We gebruiken versleuteling tijdens transport, beperkte toegang, auditlogs en operationele controles om je gegevens te beschermen.'}
            </p>
            <p className="mt-4">
              {isEnglish
                ? `${siteName} processes WhatsApp messages on its servers to provide inbox, automation, and reporting features.`
                : `${siteName} verwerkt WhatsApp-berichten op servers om inbox-, automatiserings- en rapportagefuncties mogelijk te maken.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '6. Retention' : '6. Bewaartermijnen'}
            </h2>
            <p>
              {isEnglish
                ? 'We keep data while your subscription is active and for a limited period after closure so you can export it, unless longer retention is legally required.'
                : 'We bewaren gegevens zolang je abonnement actief is en nog beperkt na sluiting zodat je kunt exporteren, tenzij wettelijke verplichtingen langere bewaring vereisen.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '7. Your GDPR Rights' : '7. Jouw AVG-rechten'}
            </h2>
            <p>{isEnglish ? 'Under the GDPR, you can request:' : 'Onder de AVG kun je verzoeken om:'}</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>{isEnglish ? 'access to your personal data;' : 'inzage in je persoonsgegevens;'}</li>
              <li>{isEnglish ? 'correction of inaccurate data;' : 'correctie van onjuiste gegevens;'}</li>
              <li>{isEnglish ? 'deletion of your account and related data;' : 'verwijdering van je account en bijbehorende gegevens;'}</li>
              <li>{isEnglish ? 'export of your data in a machine-readable format;' : 'export van je gegevens in een machineleesbaar formaat;'}</li>
              <li>{isEnglish ? 'restriction or objection to certain processing.' : 'beperking van of bezwaar tegen bepaalde verwerkingen.'}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{isEnglish ? '8. Data Export' : '8. Gegevens exporteren'}</h2>
            <p>
              {isEnglish
                ? 'You can export workspace data from your account where available, including contacts, messages, notes, tags, activity, and automation data.'
                : 'Je kunt workspacegegevens exporteren waar beschikbaar, waaronder contacten, berichten, notities, tags, activiteiten en automatiseringsdata.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{isEnglish ? '9. Cookies' : '9. Cookies'}</h2>
            <p>
              {isEnglish
                ? 'We use essential cookies for login sessions and functional cookies for preferences such as language and theme. We do not use advertising cookies.'
                : 'We gebruiken essentiële cookies voor sessies en functionele cookies voor voorkeuren zoals taal en thema. We gebruiken geen advertentiecookies.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{isEnglish ? '10. Contact' : '10. Contact'}</h2>
            <p>
              {isEnglish ? 'For privacy questions or requests, contact us at ' : 'Voor privacyvragen of verzoeken kun je contact opnemen via '}
              hello@{siteName.toLowerCase().replace(/\s+/g, '')}.nl
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
