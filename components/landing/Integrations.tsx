'use client';

import { useTranslations } from 'next-intl';

const integrations = [
  { name: 'WhatsApp', color: 'bg-green-500', initial: 'W' },
  { name: 'Evolution API', color: 'bg-blue-500', initial: 'E' },
  { name: 'Stripe', color: 'bg-purple-500', initial: 'S' },
  { name: 'OpenAI', color: 'bg-teal-500', initial: 'O' },
  { name: 'Twilio', color: 'bg-red-500', initial: 'T' },
  { name: 'Google AI', color: 'bg-yellow-500', initial: 'G' },
];

export function Integrations() {
  const t = useTranslations('LandingPage.integrations');
  const items = t.raw('items') as Array<{ name: string; description: string }>;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {items.map((item, index) => {
            const integration = integrations[index];
            return (
              <div
                key={index}
                className="group flex flex-col items-center text-center p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className={`h-14 w-14 rounded-xl ${integration.color} flex items-center justify-center mb-4 text-white font-bold text-xl shadow-lg`}>
                  {integration.initial}
                </div>
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
