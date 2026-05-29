'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Subscription = {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  features: string[];
};

export function SubscriptionCard({ subscription }: { subscription?: Subscription }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Huidig abonnement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="default">{subscription?.plan || 'Gratis'}</Badge>
            <Badge variant="secondary">{subscription?.status || 'actief'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Huidige periode eindigt: {subscription?.currentPeriodEnd || 'n.v.t.'}
          </p>
          <Button variant="outline" className="w-full">
            Abonnement beheren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
