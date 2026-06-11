/**
 * QStash publisher - sends click events as async messages.
 *
 * Instead of calling /api/track directly (synchronous, adds latency),
 * we publish to QStash which delivers to /api/track asynchronously.
 * The redirect completes immediately, click tracking happens in the background.
 */

const QSTASH_URL = process.env.QSTASH_URL!
const QSTASH_TOKEN = process.env.QSTASH_TOKEN!

export type ClickEvent = {
  link_id: string
  country: string
  city: string
  device: string
  referrer: string
}

/**
 * Publish a click event to QStash.
 * QStash will call /api/track with the event payload.
 * Fire-and-forget safe — never throws, swallows errors.
 */
export async function publishClickEvent(
  origin: string,
  event: ClickEvent
): Promise<void> {
  if (!QSTASH_URL || !QSTASH_TOKEN) {
    console.error('[qstash] env vars missing')
    return
  }

  try {
    const targetUrl = `${origin}/api/track`

    await fetch(`${QSTASH_URL}/v2/publish/${targetUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${QSTASH_TOKEN}`,
        'Content-Type': 'application/json',
        // Retry up to 3 times if /api/track fails
        'Upstash-Retries': '3',
      },
      body: JSON.stringify(event),
    })
  } catch (err) {
    console.error('[qstash] publish failed:', err)
  }
}