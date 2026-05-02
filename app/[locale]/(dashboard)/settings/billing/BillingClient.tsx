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
import { CreditCard, Download, ExternalLink } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <InvoicesList />
    </div>
  );
}
