'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';

export function Hero() {
  const isEnglish = useLocale() === 'en';

  return (
    <section className="py-20 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          {isEnglish ? 'WhatsApp Sales & Support' : 'WhatsApp Sales & Support'}
          <br />
          <span className="text-primary">{isEnglish ? 'Supercharged with AI' : 'Versneld met AI'}</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {isEnglish
            ? 'Build chatbots, automate responses, and manage WhatsApp conversations at scale. Perfect for sales teams and customer support.'
            : 'Bouw chatbots, automatiseer antwoorden en beheer WhatsApp-gesprekken op schaal. Perfect voor salesteams en klantenservice.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/sign-up">
              {isEnglish ? 'Get Started Free' : 'Start gratis'} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">
              <MessageSquare className="mr-2 h-5 w-5" /> {isEnglish ? 'Request Demo' : 'Demo aanvragen'}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
