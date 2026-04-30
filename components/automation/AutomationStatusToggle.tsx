'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function AutomationStatusToggle({
  enabled,
  onChange,
  id,
  initialActive,
}: {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  id?: number;
  initialActive?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="automation-status"
        checked={enabled}
        onCheckedChange={onChange}
      />
      <Label htmlFor="automation-status">
        {enabled ? 'Active' : 'Paused'}
      </Label>
    </div>
  );
}
