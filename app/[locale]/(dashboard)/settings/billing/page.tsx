import { useTranslations } from 'next-intl';
import { BillingClient } from './BillingClient';

export default function BillingPage() {
  const t = useTranslations('Billing');

  return (
    <div>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">{t('title')}</h1>
      <BillingClient />
    </div>
  );
}
