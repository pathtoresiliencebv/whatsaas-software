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
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Manage your billing details and payment method.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-name">Billing Name</Label>
              <Input id="billing-name" placeholder="Company Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Billing Email</Label>
              <Input id="billing-email" type="email" placeholder="billing@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT Number (Optional)</Label>
              <Input id="vat" placeholder="NL123456789B01" />
            </div>
          </div>
          <Button>Update Billing Info</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Your current payment method on file.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No payment method on file.</p>
          <Button variant="outline" className="mt-4">
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
