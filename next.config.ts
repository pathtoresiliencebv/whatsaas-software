import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';
import createNextIntlPlugin from 'next-intl/plugin';

loadEnvConfig(process.cwd());

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://connect.facebook.net https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' wss://*.pusher.com https://*.pusher.com https://graph.facebook.com https://connect.facebook.net",
  "frame-src 'self' https://www.facebook.com https://web.facebook.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
];

const apiCorsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-API-Key, X-Requested-With, X-Webhook-Auth, X-Hook-Secret' },
  { key: 'Access-Control-Max-Age', value: '86400' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    const voiceApiBaseUrl = process.env.VOICE_API_BASE_URL?.replace(/\/$/, '');

    if (!voiceApiBaseUrl) {
      return [];
    }

    return {
      beforeFiles: [
        {
          source: '/api/voice/:path*',
          destination: `${voiceApiBaseUrl}/api/voice/:path*`,
        },
        {
          source: '/api/webhook/twilio',
          destination: `${voiceApiBaseUrl}/api/webhook/twilio`,
        },
        {
          source: '/api/webhook/twilio/:path*',
          destination: `${voiceApiBaseUrl}/api/webhook/twilio/:path*`,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // CORS for API routes — restrict to known origins in production
        source: '/api/:path*',
        headers: apiCorsHeaders,
      },
      {
        source: '/v1/:path*',
        headers: apiCorsHeaders,
      },
      {
        source: '/voice/:path*',
        headers: apiCorsHeaders,
      },
      {
        source: '/webhook/:path*',
        headers: apiCorsHeaders,
      },
      {
        source: '/webhooks/:path*',
        headers: apiCorsHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
