'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, AlertCircle } from 'lucide-react';

export function EvolutionSetup() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleConnect = async () => {
    setIsConnecting(true);
    setStatus('idle');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (apiUrl && apiKey) {
      setStatus('success');
    } else {
      setStatus('error');
    }
    setIsConnecting(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Evolution API</CardTitle>
            <CardDescription>
              Connect your Evolution API instance for WhatsApp integration.
            </CardDescription>
          </div>
          {status === 'success' && (
            <Badge variant="default" className="gap-1">
              <Check className="h-3 w-3" /> Verbonden
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="evolution-url">API URL</Label>
          <Input
            id="evolution-url"
            placeholder="https://evolution-api.example.com"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your Evolution API server URL. Use self-hosted or cloud.learn more
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evolution-key">API Key</Label>
          <Input
            id="evolution-key"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            Connection failed. Please check your credentials.
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Test & Save'}
          </Button>
          <Button variant="outline" asChild>
            <a href="https://doc.evolution-api.com" target="_blank" rel="noopener">
              <ExternalLink className="h-4 w-4 mr-2" />
              Documentation
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
