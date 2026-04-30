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
        <CardTitle>Usage Preferences</CardTitle>
        <CardDescription>Configure how your account uses resources.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-refresh Dashboard</Label>
            <p className="text-sm text-muted-foreground">Automatically update dashboard data</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Browser Notifications</Label>
            <p className="text-sm text-muted-foreground">Show desktop notifications for new messages</p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}
