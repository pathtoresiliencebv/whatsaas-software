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
        <CardTitle>Current Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="default">{subscription?.plan || 'Free'}</Badge>
            <Badge variant="secondary">{subscription?.status || 'active'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Current period ends: {subscription?.currentPeriodEnd || 'N/A'}
          </p>
          <Button variant="outline" className="w-full">
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
