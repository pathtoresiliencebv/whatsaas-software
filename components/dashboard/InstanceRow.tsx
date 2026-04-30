'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, QrCode, Trash2, RefreshCw } from 'lucide-react';

type Instance = {
  id: number;
  instanceName: string;
  integration: string;
  status: 'connected' | 'disconnected' | 'pending';
  phoneNumber?: string;
};

export function InstanceRow({ instance }: { instance: Instance }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            {instance.status === 'connected' ? (
              <span className="text-2xl">📱</span>
            ) : instance.status === 'pending' ? (
              <span className="text-2xl">⏳</span>
            ) : (
              <span className="text-2xl">❌</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{instance.instanceName}</h3>
              <Badge
                variant={instance.status === 'connected' ? 'default' : instance.status === 'pending' ? 'secondary' : 'destructive'}
              >
                {instance.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {instance.integration}
              {instance.phoneNumber && ` • ${instance.phoneNumber}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Scan QR">
            <QrCode className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
