import { getBranding } from '@/lib/db/queries/branding';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getLocale } from 'next-intl/server';

export const metadata = {
  title: 'Gebruiksvoorwaarden',
  description: 'Lees de voorwaarden voor het gebruik van Kyrn.',
};

export default async function TermsPage() {
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
          {isEnglish ? 'Terms of Service' : 'Gebruiksvoorwaarden'}
        </h1>
        <p className="mb-10 text-muted-foreground">
          {isEnglish ? 'Last updated' : 'Laatst bijgewerkt'}: {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'nl-NL')}
        </p>

        <div className="space-y-8 leading-relaxed text-foreground/90">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '1. Acceptance of Terms' : '1. Akkoord met de voorwaarden'}
            </h2>
            <p>
              {isEnglish
                ? `By accessing and using ${siteName}, you agree to these terms. If you do not agree, do not use the platform.`
                : `Door ${siteName} te openen en te gebruiken ga je akkoord met deze voorwaarden. Ga je niet akkoord, gebruik het platform dan niet.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '2. Service Description' : '2. Beschrijving van de dienst'}
            </h2>
            <p>
              {isEnglish
                ? `${siteName} provides a WhatsApp Business platform for teams to automate conversations, manage contacts, run campaigns, and use voice agents.`
                : `${siteName} biedt een WhatsApp Business-platform waarmee teams gesprekken automatiseren, contacten beheren, campagnes draaien en voice agents gebruiken.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '3. Your Data' : '3. Jouw gegevens'}
            </h2>
            <p>
              {isEnglish
                ? `You remain the owner of the data you add to ${siteName}. We process it only to deliver, secure, and improve the service.`
                : `Jij blijft eigenaar van de gegevens die je toevoegt aan ${siteName}. Wij verwerken die gegevens alleen om de dienst te leveren, te beveiligen en te verbeteren.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '4. Intellectual Property' : '4. Intellectueel eigendom'}
            </h2>
            <p>
              {isEnglish
                ? `${siteName}, its design, features, and original content are protected by intellectual property laws.`
                : `${siteName}, het ontwerp, de functies en originele content zijn beschermd door intellectuele-eigendomsrechten.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '5. Acceptable Use' : '5. Toegestaan gebruik'}
            </h2>
            <p>
              {isEnglish
                ? `You may not use ${siteName} for spam, unsolicited messages, illegal activity, or content that violates WhatsApp Business policies.`
                : `Je mag ${siteName} niet gebruiken voor spam, ongevraagde berichten, illegale activiteiten of content die in strijd is met het WhatsApp Business-beleid.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '6. Billing and Subscription' : '6. Facturatie en abonnement'}
            </h2>
            <p>
              {isEnglish
                ? 'Paid subscriptions are billed based on the selected plan. You can cancel from your account settings. Access to paid features ends at the end of the current billing period.'
                : 'Betaalde abonnementen worden gefactureerd op basis van het gekozen plan. Je kunt opzeggen via je accountinstellingen. Toegang tot betaalde functies eindigt aan het einde van de lopende factuurperiode.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '7. Termination' : '7. Beëindiging'}
            </h2>
            <p>
              {isEnglish
                ? 'You can close your account at any time. After closure, we delete your data according to our retention policy unless legal obligations require longer retention.'
                : 'Je kunt je account op elk moment sluiten. Na sluiting verwijderen we je gegevens volgens ons bewaarbeleid, tenzij wettelijke verplichtingen langere bewaartermijnen vereisen.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '8. Availability' : '8. Beschikbaarheid'}
            </h2>
            <p>
              {isEnglish
                ? `${siteName} is provided as available. We work to keep the service stable and secure, but cannot guarantee uninterrupted access.`
                : `${siteName} wordt geleverd zoals beschikbaar. We werken aan een stabiele en veilige dienst, maar kunnen ononderbroken toegang niet garanderen.`}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEnglish ? '9. Liability' : '9. Aansprakelijkheid'}
            </h2>
            <p>
              {isEnglish
                ? 'To the extent permitted by law, our liability is limited to the amount paid by you in the 12 months before the claim.'
                : 'Voor zover wettelijk toegestaan is onze aansprakelijkheid beperkt tot het bedrag dat je in de 12 maanden voorafgaand aan de claim hebt betaald.'}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{isEnglish ? '10. Contact' : '10. Contact'}</h2>
            <p>
              {isEnglish ? 'Questions about these terms? Contact us at ' : 'Vragen over deze voorwaarden? Neem contact op via '}
              hello@{siteName.toLowerCase().replace(/\s+/g, '')}.nl
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
