'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Plan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
};

const plans: Plan[] = [
  { id: 'free', name: 'Free', price: 0, features: ['5 messages/min', '1 instance', '100 contacts'] },
  { id: 'starter', name: 'Starter', price: 29, features: ['10 messages/min', '2 instances', '1000 contacts', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 79, features: ['40 messages/min', '5 instances', '10000 contacts', 'Priority support', 'AI features'] },
  { id: 'enterprise', name: 'Enterprise', price: 199, features: ['200 messages/min', 'Unlimited instances', 'Unlimited contacts', 'Dedicated support', 'Custom integrations'] },
];

export function PlanSelector({ currentPlan }: { currentPlan?: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card key={plan.id} className={plan.highlighted ? 'border-primary shadow-lg' : ''}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">€{plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="text-primary">✓</span> {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={currentPlan === plan.id ? 'outline' : 'default'}
              disabled={currentPlan === plan.id}
            >
              {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
