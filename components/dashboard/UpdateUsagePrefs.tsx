'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function UpdateUsagePrefs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gebruiksvoorkeuren</CardTitle>
        <CardDescription>Stel in hoe je account middelen gebruikt.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Dashboard automatisch verversen</Label>
            <p className="text-sm text-muted-foreground">Werk dashboardgegevens automatisch bij</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>E-mailmeldingen</Label>
            <p className="text-sm text-muted-foreground">Ontvang e-mailalerts voor belangrijke gebeurtenissen</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Browsermeldingen</Label>
            <p className="text-sm text-muted-foreground">Toon desktopmeldingen voor nieuwe berichten</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button>Voorkeuren opslaan</Button>
      </CardContent>
    </Card>
  );
}
