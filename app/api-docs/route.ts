import { ApiReference } from '@scalar/nextjs-api-reference';

export const GET = ApiReference({
  pageTitle: 'Kyrn API-documentatie',
  url: '/api/openapi',
  layout: 'modern',
  theme: 'default',
  darkMode: false,
  hideDarkModeToggle: false,
  persistAuth: true,
  metaData: {
    title: 'Kyrn API-documentatie',
    description: 'Interactieve documentatie voor de WhatsApp- en spraakagent-API van Kyrn.',
  },
  favicon: '/favicon.ico',
});
