'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Brain, CheckCircle2, Globe2, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type BrainSnapshot = {
  websiteUrl: string;
  title?: string;
  description?: string;
  headings: string[];
  highlights: string[];
  suggestedAudience: string[];
  suggestedChannels: string[];
  suggestedTone: string;
  centralPrompt: string;
};

type BrainResponse = {
  brain: {
    id: number;
    status: string;
    websiteUrl: string | null;
    summary: string | null;
    snapshot: BrainSnapshot | null;
  } | null;
  shouldShow: boolean;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const goals = [
  {
    id: 'support',
    label: 'Support sneller beantwoorden',
    description: 'Veelgestelde vragen, opvolging en duidelijke overdracht.',
  },
  {
    id: 'sales',
    label: 'Meer leads opvolgen',
    description: 'Nieuwe aanvragen kwalificeren en automatisch doorzetten.',
  },
  {
    id: 'automation',
    label: 'Alles automatiseren',
    description: 'WhatsApp, voice agents en workflows met één centraal brein.',
  },
];

export function CentralBrainOnboarding() {
  const { data, mutate } = useSWR<BrainResponse>('/api/onboarding/brain', fetcher);
  const [open, setOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [goal, setGoal] = useState('automation');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<BrainResponse['brain'] | null>(null);

  useEffect(() => {
    if (data?.shouldShow) {
      setOpen(true);
    }
  }, [data?.shouldShow]);

  const snapshot = result?.snapshot || data?.brain?.snapshot || null;
  const summary = result?.summary || data?.brain?.summary || snapshot?.description || '';

  const selectedGoal = useMemo(() => goals.find((item) => item.id === goal) || goals[0], [goal]);

  async function scanWebsite() {
    if (!websiteUrl.trim()) {
      toast.error('Vul eerst je website-url in.');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('/api/onboarding/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl,
          goal: selectedGoal.label,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Website scannen is mislukt.');
      }

      setResult(payload.brain);
      await mutate();
      toast.success('Je centrale brein is gevuld.');
    } catch (error: any) {
      toast.error(error.message || 'Website scannen is mislukt.');
    } finally {
      setIsScanning(false);
    }
  }

  async function skipOnboarding() {
    await fetch('/api/onboarding/brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'skip' }),
    });
    await mutate();
    setOpen(false);
  }

  function closeAfterSuccess() {
    setOpen(false);
    mutate();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-emerald-50 p-6 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50">
            <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm dark:bg-emerald-900">
              <Brain className="h-5 w-5" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welkom bij Kyrn</DialogTitle>
              <DialogDescription className="text-emerald-900/70 dark:text-emerald-100/80">
                We vullen eerst je centrale brein. Daarmee snappen je WhatsApp-agents, voice agents en workflows meteen wie je bent, wat je verkoopt en hoe klanten geholpen moeten worden.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3 text-sm">
              {[
                'Website scannen en kerncontext ophalen',
                'Tone of voice en doelgroep klaarzetten',
                'Startprompt maken voor agents en automatisering',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-end">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={skipOnboarding}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!snapshot ? (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="website-url">Wat is je website?</Label>
                  <div className="relative mt-2">
                    <Globe2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website-url"
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                      placeholder="https://jouwbedrijf.nl"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label>Wat brengt je vooral naar Kyrn?</Label>
                  <RadioGroup value={goal} onValueChange={setGoal} className="mt-2 space-y-2">
                    {goals.map((item) => (
                      <label key={item.id} className="flex cursor-pointer gap-3 rounded-lg border p-3 hover:bg-muted/60">
                        <RadioGroupItem value={item.id} className="mt-1" />
                        <span>
                          <span className="block text-sm font-medium">{item.label}</span>
                          <span className="block text-xs text-muted-foreground">{item.description}</span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button variant="ghost" onClick={skipOnboarding}>
                    Later doen
                  </Button>
                  <Button onClick={scanWebsite} disabled={isScanning}>
                    {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Website scannen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <Badge className="mb-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Centraal brein actief
                  </Badge>
                  <h3 className="text-xl font-semibold">{snapshot.title || 'Je workspace is klaar'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Kanalen</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {snapshot.suggestedChannels.map((channel) => (
                        <Badge key={channel} variant="secondary">{channel}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Tone of voice</p>
                    <p className="mt-2 text-sm">{snapshot.suggestedTone}</p>
                  </div>
                </div>

                {snapshot.highlights.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Wat Kyrn heeft gevonden</p>
                    <ul className="mt-2 space-y-2 text-sm">
                      {snapshot.highlights.slice(0, 4).map((highlight) => (
                        <li key={highlight} className="line-clamp-2">{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={closeAfterSuccess}>
                    Naar mijn dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
