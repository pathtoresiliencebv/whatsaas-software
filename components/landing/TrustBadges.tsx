import { Shield, CreditCard, Lock, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

const badges = [
  { icon: Shield, titleKey: 'trust.gdpr', descKey: 'trust.gdpr_desc' },
  { icon: CreditCard, titleKey: 'trust.payments', descKey: 'trust.payments_desc' },
  { icon: Lock, titleKey: 'trust.encryption', descKey: 'trust.encryption_desc' },
  { icon: FileText, titleKey: 'trust.your_data', descKey: 'trust.your_data_desc' },
];

export function TrustBadges() {
  const t = useTranslations('LandingPage');

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
                <h3 className="font-semibold text-sm mb-1">{t(badge.titleKey)}</h3>
                <p className="text-xs text-muted-foreground">{t(badge.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
