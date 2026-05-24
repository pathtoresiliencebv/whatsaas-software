import { useTranslations } from 'next-intl';
import { BillingClient } from './BillingClient';

export default function BillingPage() {
  const t = useTranslations('Billing');

  return (
    <section className="min-h-full bg-[#f8f8f7] px-6 py-8 text-zinc-950 dark:bg-[#17191b] dark:text-white">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Review your current plan, open the billing portal, and download invoices.
          </p>
        </div>
        <BillingClient />
      </div>
    </section>
  );
}
