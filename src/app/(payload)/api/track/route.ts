import { getPayload } from 'payload'
import config from '@payload-config'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

function deviceFromUA(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile'
  return 'desktop'
}

// Public, fire-and-forget visit tracking. Body: { tenant, page, project? }
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { tenant?: number; page?: string; project?: number }
    if (!body.tenant) return Response.json({ ok: false }, { status: 400 })

    const ua = req.headers.get('user-agent') || ''
    const country =
      req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || null
    const referrer = req.headers.get('referer') || null

    // Stable visitor id via cookie.
    const cookie = req.headers.get('cookie') || ''
    let vid = /(?:^|;\s*)vid=([^;]+)/.exec(cookie)?.[1]
    let setCookie = false
    if (!vid) {
      vid = randomUUID()
      setCookie = true
    }

    const payload = await getPayload({ config })
    await payload.create({
      collection: 'visits',
      data: {
        tenant: body.tenant,
        page: body.page || 'home',
        project: body.project ?? null,
        device: deviceFromUA(ua),
        country: country && country !== 'XX' ? country : null,
        referrer,
        visitorId: vid,
      },
      overrideAccess: true,
    })

    const headers = new Headers({ 'content-type': 'application/json' })
    if (setCookie) {
      headers.append(
        'set-cookie',
        `vid=${vid}; Path=/; Max-Age=31536000; SameSite=Lax`,
      )
    }
    return new Response(JSON.stringify({ ok: true }), { headers })
  } catch {
    return Response.json({ ok: false }, { status: 200 })
  }
}
