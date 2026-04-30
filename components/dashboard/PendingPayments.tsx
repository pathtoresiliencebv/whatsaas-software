'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

type PendingPayment = {
  id: number;
  teamName: string;
  email: string;
  plan: string;
  amount: number;
  createdAt: string;
};

export function PendingPayments({ payments }: { payments?: PendingPayment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(payments || []).map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{payment.teamName}</p>
                <p className="text-sm text-muted-foreground">{payment.email}</p>
                <p className="text-sm mt-1">
                  {payment.plan} - €{payment.amount}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {(!payments || payments.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">No pending payments</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
