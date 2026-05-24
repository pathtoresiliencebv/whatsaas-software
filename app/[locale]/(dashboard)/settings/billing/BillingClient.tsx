'use client';

import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { TeamDataWithMembers } from '@/lib/db/schema';
import { customerPortalAction } from '@/lib/payments/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CreditCard, Download, ExternalLink, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StripeInvoice {
  id: string;
  number: string | null;
  amountPaid: number;
  currency: string;
  status: string;
  created: number;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
}

interface InvoicesResponse {
  invoices: StripeInvoice[];
}

function InvoicesSkeleton() {
  const t = useTranslations('Billing');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('invoices_title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InvoicesList() {
  const t = useTranslations('Billing');
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  const { data, error, isLoading } = useSWR<InvoicesResponse>(
    teamData?.stripeCustomerId ? '/api/invoices' : null,
    fetcher
  );

  if (!teamData?.stripeCustomerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('invoices_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('no_billing_info')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <InvoicesSkeleton />;
  }

  if (error || !data?.invoices) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('invoices_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('error_loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (data.invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('invoices_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('no_invoices')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('invoices_title')}</CardTitle>
        <form action={customerPortalAction}>
          <Button type="submit" variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            {t('billing_portal')}
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('col_date')}</TableHead>
              <TableHead>{t('col_number')}</TableHead>
              <TableHead>{t('col_amount')}</TableHead>
              <TableHead>{t('col_status')}</TableHead>
              <TableHead className="text-right">{t('col_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  {new Date(invoice.created * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {invoice.number || '-'}
                </TableCell>
                <TableCell>
                  {formatCurrency(invoice.amountPaid / 100, invoice.currency.toUpperCase())}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === 'paid'
                        ? 'default'
                        : invoice.status === 'open'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.invoicePdf && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={invoice.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t('download_pdf')}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {invoice.hostedInvoiceUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t('view_online')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function BillingClient() {
  const t = useTranslations('Billing');
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const currentPlan = teamData?.planName || 'Free';
  const status = teamData?.subscriptionStatus || 'free';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm dark:border-[#303630] dark:bg-[#111412]">
        <CardContent className="p-0">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f9ed] text-[#14933a]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Current plan</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{currentPlan}</h2>
                  <Badge className="rounded-full bg-[#e8f9ed] px-2.5 text-[#14933a] hover:bg-[#e8f9ed]">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {status}
                  </Badge>
                </div>
                <p className="mt-2 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
                  Your plan controls team seats, WhatsApp connections, campaigns, AI agents, and billing access.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="rounded-lg" asChild>
                <a href="/pricing">Change plan</a>
              </Button>
              {teamData?.stripeCustomerId && (
                <form action={customerPortalAction}>
                  <Button type="submit" className="w-full rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t('billing_portal')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <InvoicesList />
    </div>
  );
}
