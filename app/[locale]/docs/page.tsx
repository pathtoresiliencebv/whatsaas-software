import { getBranding } from '@/lib/db/queries/branding';
import Link from 'next/link';
import { ArrowLeft, Book, Code, Zap, MessageSquare, Shield, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getLocale } from 'next-intl/server';

export const metadata = {
  title: 'Documentatie',
  description: 'Leer hoe je Kyrn gebruikt.',
};

export default async function DocsPage() {
  const branding = await getBranding();
  const locale = await getLocale();
  const isEnglish = locale === 'en';
  const siteName = branding?.name || 'Kyrn';

  const categories = isEnglish ? [
    {
      title: 'Getting started',
      description: 'Everything you need to get your workspace running.',
      icon: Zap,
      links: ['Account setup', 'Connect WhatsApp', 'Invite team members']
    },
    {
      title: 'Automation and flows',
      description: 'Build automations for messages, routing and follow-up.',
      icon: Code,
      links: ['Visual flow builder', 'Message types', 'Variables and logic']
    },
    {
      title: 'CRM and contacts',
      description: 'Manage leads and customers without losing context.',
      icon: UsersIcon,
      links: ['Import contacts', 'Tags and funnels', 'Filter leads']
    },
    {
      title: 'API and developers',
      description: 'Technical documentation for API endpoints and webhooks.',
      icon: Book,
      links: ['Authentication', 'Send messages', 'Webhooks']
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and how to resolve them.',
      icon: Shield,
      links: ['Connection issues', 'Message failures', 'Billing FAQ']
    },
    {
      title: 'Best practices',
      description: 'Avoid bans and improve customer engagement.',
      icon: MessageSquare,
      links: ['Anti-spam rules', 'Template guidelines', 'Broadcast strategy']
    }
  ] : [
    {
      title: 'Aan de slag',
      description: 'Alles om je werkruimte goed op te zetten.',
      icon: Zap,
      links: ['Account instellen', 'WhatsApp koppelen', 'Teamleden uitnodigen']
    },
    {
      title: 'Automatisering en flows',
      description: 'Bouw automatiseringen voor berichten, routering en opvolging.',
      icon: Code,
      links: ['Visuele flowbuilder', 'Berichttypen', 'Variabelen en logica']
    },
    {
      title: 'CRM en contacten',
      description: 'Beheer leads en klanten zonder context kwijt te raken.',
      icon: UsersIcon,
      links: ['Contacten importeren', 'Tags en funnels', 'Leads filteren']
    },
    {
      title: 'API en ontwikkelaars',
      description: 'Technische documentatie voor API-endpoints en webhooks.',
      icon: Book,
      links: ['Authenticatie', 'Berichten versturen', 'Webhooks']
    },
    {
      title: 'Problemen oplossen',
      description: 'Veelvoorkomende problemen en hoe je ze oplost.',
      icon: Shield,
      links: ['Verbindingsproblemen', 'Berichtfouten', 'Facturering FAQ']
    },
    {
      title: 'Best practices',
      description: 'Voorkom blokkades en verbeter je klantgesprekken.',
      icon: MessageSquare,
      links: ['Anti-spamregels', 'Template-richtlijnen', 'Broadcaststrategie']
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/">
            <Button variant="ghost" className="absolute top-6 left-6 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> {isEnglish ? 'Back' : 'Terug'}
            </Button>
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            {isEnglish ? `${siteName} Documentation` : `${siteName} documentatie`}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {isEnglish
              ? 'Find everything you need to automate WhatsApp support, sales and voice agents.'
              : 'Vind alles wat je nodig hebt om WhatsApp-support, sales en spraakagents te automatiseren.'}
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder={isEnglish ? 'Search articles, guides or API docs...' : 'Zoek artikelen, handleidingen of API-docs...'}
              className="pl-10 h-12 bg-background shadow-sm rounded-xl text-base"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, idx) => (
            <Card key={idx} className="hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription className="line-clamp-2">{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.links.map((link, i) => (
                    <li key={i} className="text-sm text-muted-foreground hover:text-primary flex items-center">
                      <ChevronRight className="h-3 w-3 mr-2 opacity-50" />
                      {link}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{isEnglish ? "Can't find what you're looking for?" : 'Kun je niet vinden wat je zoekt?'}</h3>
            <p className="text-muted-foreground">{isEnglish ? 'Our support team is here to help.' : 'Ons supportteam helpt je graag verder.'}</p>
          </div>
          <Link href="/contact">
            <Button size="lg">{isEnglish ? 'Contact support' : 'Neem contact op'}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
