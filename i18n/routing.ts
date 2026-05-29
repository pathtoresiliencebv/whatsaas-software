import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['nl', 'en', 'pt', 'es'],
  defaultLocale: 'nl',
  localePrefix: 'as-needed'
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
