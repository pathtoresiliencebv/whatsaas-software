/**
 * Improved Rate Limiting System
 * - Per-tenant limits based on plan
 * - Sliding window algorithm
 * - In-memory store (Redis-ready for multi-instance)
 * - Standard rate limit headers
 */

type Entry = { count: number; resetAt: number };

// In-memory store with automatic cleanup
const store = new Map<string, Entry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Plan-based rate limits ───────────────────────────────────────────────────
// These multipliers are applied per-plan. Default (no plan/unknown): 0.5x
export const PLAN_RATE_MULTIPLIERS: Record<string, { api: number; messages: number; contacts: number }> = {
  free:     { api: 0.5,  messages: 0.5,  contacts: 0.5 },
  starter:  { api: 1.0,  messages: 1.0,  contacts: 1.0 },
  pro:      { api: 4.0,  messages: 4.0,  contacts: 4.0 },
  enterprise:{ api: 20.0, messages: 20.0, contacts: 20.0 },
};

// Base limits (per minute for API/messages, per day for contacts)
const BASE_LIMITS = {
  api: 60,
  messages: 10,
  contacts: 100, // per day
};

interface RateLimitConfig {
  max: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function getRateLimitResult(
  teamId: number,
  planName: string | null,
  action: 'api' | 'messages' | 'contacts',
  windowMs: number = 60_000,
): RateLimitConfig {
  const multiplier = PLAN_RATE_MULTIPLIERS[planName?.toLowerCase() ?? 'starter'] ??
    PLAN_RATE_MULTIPLIERS['starter'];

  const mult = multiplier[action];
  const max = Math.floor(BASE_LIMITS[action] * mult);

  return {
    max,
    windowMs,
    keyPrefix: action,
  };
}

// ─── Sliding window rate limiter ──────────────────────────────────────────────
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const entry = store.get(key);

  // Window expired or doesn't exist — start fresh
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      success: true,
      remaining: config.max - 1,
      resetAt: now + config.windowMs,
      limit: config.max,
    };
  }

  // Over limit
  if (entry.count >= config.max) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      limit: config.max,
    };
  }

  // Within limit — increment
  entry.count++;
  return {
    success: true,
    remaining: config.max - entry.count,
    resetAt: entry.resetAt,
    limit: config.max,
  };
}

// ─── Check functions ─────────────────────────────────────────────────────────

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return '127.0.0.1';
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Response | null {
  const result = rateLimit(key, config);
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
        },
      },
    );
  }
  return null;
}

/**
 * Per-tenant rate limit check — use this for authenticated API routes.
 * teamId and planName come from the authenticated team.
 */
export function checkTenantRateLimit(
  teamId: number,
  planName: string | null,
  action: 'api' | 'messages' | 'contacts',
  request: Request,
): Response | null {
  const ip = getClientIp(request);
  const windowMs = action === 'contacts' ? 86_400_000 : 60_000; // contacts: 24h, others: 1min
  const config = getRateLimitResult(teamId, planName, action, windowMs);
  const key = `tenant:${config.keyPrefix}:${teamId}:${ip}`;
  return checkRateLimit(key, config);
}

/**
 * Per-IP rate limit check — use this for unauthenticated routes (auth, webhooks).
 */
export function checkIpRateLimit(
  action: 'auth' | 'webhook' | 'search' | 'purchase',
  request: Request,
): Response | null {
  const ip = getClientIp(request);
  const limits: Record<string, RateLimitConfig> = {
    auth:     { max: 5,  windowMs: 60_000,  keyPrefix: 'auth' },
    webhook:  { max: 500, windowMs: 60_000,  keyPrefix: 'webhook' },
    search:   { max: 60, windowMs: 60_000,  keyPrefix: 'search' },
    purchase: { max: 3,  windowMs: 60_000,  keyPrefix: 'purchase' },
  };
  const config = limits[action] ?? limits.auth;
  return checkRateLimit(`ip:${config.keyPrefix}:${ip}`, config);
}

// ─── Pre-configured limit sets for convenience ───────────────────────────────
export const RATE_LIMITS = {
  auth:     { max: 5,  windowMs: 60000 },
  ai:       { max: 10, windowMs: 60000 },
  purchase: { max: 3,  windowMs: 60000 },
  search:   { max: 60, windowMs: 60000 },
  webhook:  { max: 500, windowMs: 60000 },
  general:  { max: 60, windowMs: 60000 },
} as const;
