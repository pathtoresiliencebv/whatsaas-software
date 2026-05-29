'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Factuurgegevens</CardTitle>
          <CardDescription>Beheer je factuurgegevens en betaalmethode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-name">Factuurnaam</Label>
              <Input id="billing-name" placeholder="Bedrijfsnaam" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Factuur-e-mail</Label>
              <Input id="billing-email" type="email" placeholder="billing@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">Btw-nummer (optioneel)</Label>
              <Input id="vat" placeholder="NL123456789B01" />
            </div>
          </div>
          <Button>Factuurgegevens bijwerken</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Betaalmethode</CardTitle>
          <CardDescription>Je huidige opgeslagen betaalmethode.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Er is nog geen betaalmethode opgeslagen.</p>
          <Button variant="outline" className="mt-4">
            Betaalmethode toevoegen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
