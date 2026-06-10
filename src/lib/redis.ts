/**
 * Upstash Redis client using the REST API.
 * Works in both Edge (middleware) and Node.js (API routes) runtimes.
 *
 * Cache schema:
 *   short:{code}  →  JSON { id: string, original_url: string }  TTL: 24h
 *
 * Why REST and not @upstash/redis SDK?
 * The SDK uses fetch internally anyway, and importing it in middleware
 * adds bundle size. Direct REST calls are lighter for the Edge runtime.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!

type CachedLink = {
  id: string
  original_url: string
}

async function redisCommand<T>(...args: (string | number)[]): Promise<T | null> {
  try {
    const res = await fetch(`${REDIS_URL}/${args.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      // Don't cache the Redis call itself at the CDN layer
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.result as T
  } catch {
    // Redis is a cache — never let it break the critical redirect path
    return null
  }
}

/** Get a cached link by short code. Returns null on miss or error. */
export async function getCachedLink(code: string): Promise<CachedLink | null> {
  const raw = await redisCommand<string>('GET', `short:${code}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CachedLink
  } catch {
    return null
  }
}

/** Cache a link for 24 hours. Fire-and-forget safe (swallows errors). */
export async function setCachedLink(code: string, link: CachedLink): Promise<void> {
  // SET key value EX seconds
  await redisCommand('SET', `short:${code}`, JSON.stringify(link), 'EX', 86400)
}

/** Delete a cached link (call when a link is deleted from Supabase). */
export async function deleteCachedLink(code: string): Promise<void> {
  await redisCommand('DEL', `short:${code}`)
}