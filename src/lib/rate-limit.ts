/**
 * Sliding window rate limiter using Redis.
 *
 * Uses a sorted set per key: each request adds a timestamp entry,
 * old entries outside the window are trimmed, then we count what's left.
 * This is more accurate than fixed-window counters (no burst-at-boundary issue).
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!

async function redisPost(body: unknown[]): Promise<unknown> {
  try {
    const res = await fetch(REDIS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.result
  } catch (err) {
    console.error('[rate-limit] redis error:', err)
    return null
  }
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  limit: number
  resetMs: number
}

/**
 * Check + record a request against a sliding window rate limit.
 *
 * @param key       unique identifier (e.g. `ratelimit:redirect:1.2.3.4`)
 * @param limit      max requests allowed in the window
 * @param windowMs   window size in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - windowMs

  // Pipeline: remove old entries, add current request, count remaining, set expiry
  // Using a sorted set (ZSET) where score = timestamp, member = unique request id
  const member = `${now}-${Math.random().toString(36).slice(2, 8)}`

  await redisPost(['ZREMRANGEBYSCORE', key, '0', String(windowStart)])
  await redisPost(['ZADD', key, String(now), member])
  const count = await redisPost(['ZCARD', key])
  await redisPost(['EXPIRE', key, String(Math.ceil(windowMs / 1000))])

  const requestCount = typeof count === 'number' ? count : 0

  return {
    allowed: requestCount <= limit,
    remaining: Math.max(0, limit - requestCount),
    limit,
    resetMs: windowMs,
  }
}

/** Extract a client identifier from the request for rate limiting. */
export function getClientIp(request: Request): string {
  const headers = request.headers
  return (
    headers.get('x-vercel-forwarded-for') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
