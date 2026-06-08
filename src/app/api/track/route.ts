import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { UAParser } from "ua-parser-js"

export async function POST(request: NextRequest) {
  try {
    const { link_id, country, city, device, referrer } = await request.json()
    const parser = new UAParser(device)
    const result = parser.getResult()
    const supabase = await createClient()
    await supabase.from("click_events").insert({
      link_id,
      country,
      city,
      device: result.device.type || "desktop",
      browser: result.browser.name || "unknown",
      referrer
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Track error:", err)
    return NextResponse.json({ success: false })
  }
}
