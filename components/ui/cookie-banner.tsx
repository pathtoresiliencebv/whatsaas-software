'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CookieBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export function CookieBanner({ onAccept, onDecline }: CookieBannerProps) {
  const t = useTranslations('CookieBanner');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
    onDecline?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <Card className="max-w-2xl mx-auto pointer-events-auto shadow-lg">
        <button
          onClick={handleDecline}
          className="absolute top-2 right-2 p-1 hover:bg-muted rounded-md transition-colors"
          aria-label={t('close')}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t('description')}
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{t('essentialTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('essentialDesc')}</p>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {t('alwaysActive')}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{t('analyticsTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('analyticsDesc')}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2 pt-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            {t('decline')}
          </Button>
          <Button size="sm" onClick={handleAccept}>
            {t('accept')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
