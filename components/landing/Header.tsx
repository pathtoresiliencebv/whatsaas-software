'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo from '@/components/interface/Logo';
import { useTranslations } from 'next-intl';

export function LandingHeader() {
  const t = useTranslations('LandingPage.header');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: t('nav_features') },
    { href: '#how-it-works', label: t('nav_how') },
    { href: '#pricing', label: t('nav_pricing') },
    { href: '#faq', label: t('nav_faq') },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border/60 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <Logo className="h-7" />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="rounded-full h-9 px-4 text-sm font-medium">
                {t('login')}
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                className="rounded-full h-9 px-4 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {t('cta')} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-border/60">
              <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full rounded-full h-10 text-sm font-medium">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-full h-10 text-sm font-semibold">{t('cta')}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
