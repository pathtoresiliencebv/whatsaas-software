'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg mb-4">Kyrn</h3>
            <p className="text-sm text-muted-foreground">
              AI WhatsApp-platform voor sales en klantenservice. Jouw regels.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:underline">Functies</Link></li>
              <li><Link href="/pricing" className="hover:underline">Prijzen</Link></li>
              <li><Link href="/docs" className="hover:underline">Documentatie</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Bedrijf</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:underline">Over ons</Link></li>
              <li><Link href="/blog" className="hover:underline">Blog</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Juridisch</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:underline">Privacybeleid</Link></li>
              <li><Link href="/terms" className="hover:underline">Gebruiksvoorwaarden</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kyrn. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}
