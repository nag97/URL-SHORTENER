const QSTASH_URL = process.env.QSTASH_URL!
const QSTASH_TOKEN = process.env.QSTASH_TOKEN!

export type ClickEvent = {
  link_id: string
  country: string
  city: string
  device: string
  referrer: string
}

export async function publishClickEvent(
  origin: string,
  event: ClickEvent
): Promise<void> {
  console.log('[qstash] QSTASH_URL defined=', !!QSTASH_URL)
  console.log('[qstash] QSTASH_TOKEN defined=', !!QSTASH_TOKEN)

  if (!QSTASH_URL || !QSTASH_TOKEN) {
    console.error('[qstash] env vars missing')
    return
  }

  const targetUrl = `${origin}/api/track`
  const publishUrl = `${QSTASH_URL}/v2/publish/${targetUrl}`
  console.log('[qstash] publishing to:', publishUrl)

  try {
    const res = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${QSTASH_TOKEN}`,
        'Content-Type': 'application/json',
        'Upstash-Retries': '3',
      },
      body: JSON.stringify(event),
    })

    const text = await res.text()
    console.log('[qstash] response status:', res.status)
    console.log('[qstash] response body:', text)
  } catch (err) {
    console.error('[qstash] fetch failed:', err)
  }
}