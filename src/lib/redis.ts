const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!

type CachedLink = {
  id: string
  original_url: string
}

async function redisPost(body: unknown[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    console.error('[redis] env vars missing: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set')
    return null
  }
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
    if (!res.ok) {
      console.error('[redis] HTTP error:', res.status, await res.text())
      return null
    }
    const json = await res.json()
    return json.result
  } catch (err) {
    console.error('[redis] fetch failed:', err)
    return null
  }
}

/** Get a cached link by short code. Returns null on miss or error. */
export async function getCachedLink(code: string): Promise<CachedLink | null> {
  const result = await redisPost(['GET', `short:${code}`])
  if (!result || typeof result !== 'string') return null
  try {
    return JSON.parse(result) as CachedLink
  } catch {
    return null
  }
}

/** Cache a link for 24 hours. */
export async function setCachedLink(code: string, link: CachedLink): Promise<void> {
  // Correct Upstash REST format: POST with array body ['SET', key, value, 'EX', ttl]
  await redisPost(['SET', `short:${code}`, JSON.stringify(link), 'EX', 86400])
}

/** Delete a cached link (call when a link is deleted from Supabase). */
export async function deleteCachedLink(code: string): Promise<void> {
  await redisPost(['DEL', `short:${code}`])
}