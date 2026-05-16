import { Shield, CreditCard, Lock, Zap } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'GDPR Compliant',
    description: 'Your data is protected',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Powered by Stripe',
  },
  {
    icon: Lock,
    title: 'End-to-End Encrypted',
    description: 'All conversations secured',
  },
  {
    icon: Zap,
    title: '99.9% Uptime',
    description: 'Always available',
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 border-y border-border bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
