'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  { name: 'Free', price: 0, features: ['5 messages/min', '1 instance', '100 contacts', 'Basic support'] },
  { name: 'Starter', price: 29, features: ['10 messages/min', '2 instances', '1000 contacts', 'Email support'] },
  { name: 'Pro', price: 79, features: ['40 messages/min', '5 instances', '10000 contacts', 'Priority support', 'AI features'] },
  { name: 'Enterprise', price: 199, features: ['200 messages/min', 'Unlimited instances', 'Unlimited contacts', 'Dedicated support'] },
];

export function Pricing() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <Card key={i} className={i === 2 ? 'border-primary' : ''}>
              <CardHeader>
                {i === 2 && <Badge className="w-fit mb-2">Most Popular</Badge>}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">€{plan.price}</span>/month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="text-sm flex items-center gap-2">
                      <span className="text-primary">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={i === 2 ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
