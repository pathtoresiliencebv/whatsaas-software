'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug, ExternalLink } from 'lucide-react';

type Integration = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon?: string;
};

const integrations: Integration[] = [
  { id: 'stripe', name: 'Stripe', description: 'Payment processing', connected: false },
  { id: 'razorpay', name: 'Razorpay', description: 'Payment processing (India)', connected: false },
  { id: 'pusher', name: 'Pusher', description: 'Real-time messaging', connected: true },
  { id: 'openai', name: 'OpenAI', description: 'AI chatbot integration', connected: false },
  { id: 'google', name: 'Google Gemini', description: 'AI chatbot integration', connected: false },
  { id: 'resend', name: 'Resend', description: 'Email notifications', connected: false },
];

export function IntegrationsList() {
  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Plug className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{integration.name}</h3>
                  {integration.connected && (
                    <Badge variant="default" className="text-xs">Connected</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
              {integration.connected ? 'Configure' : 'Connect'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
