import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const MAX_MODULES = 80
const MAX_BYTES = 45 * 1024 * 1024 // 45 MB total payload
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

// Receives the scraped Behance payload from the bookmarklet (cross-origin) and
// stages it under a random token. The dashboard finalizes it into a project.
export async function POST(req: Request) {
  try {
    const raw = await req.text()
    if (raw.length > MAX_BYTES) {
      return Response.json({ error: 'payload too large' }, { status: 413, headers: CORS })
    }
    const body = JSON.parse(raw) as {
      title?: string
      description?: string
      cover?: string
      modules?: unknown[]
      source_url?: string
    }

    const modulesIn = Array.isArray(body.modules) ? body.modules.slice(0, MAX_MODULES) : []
    const modules: unknown[] = []
    for (const m of modulesIn as Record<string, unknown>[]) {
      switch (m.type) {
        case 'image':
          if (typeof m.src === 'string') modules.push({ type: 'image', src: m.src })
          break
        case 'image_row': {
          const imgs = (Array.isArray(m.images) ? m.images : []).filter((s) => typeof s === 'string').slice(0, 6)
          if (imgs.length >= 2) modules.push({ type: 'image_row', images: imgs })
          else if (imgs.length === 1) modules.push({ type: 'image', src: imgs[0] })
          break
        }
        case 'embed':
          if (typeof m.url === 'string') modules.push({ type: 'embed', url: str(m.url, 1000) })
          break
        case 'video':
          if (typeof m.src === 'string') modules.push({ type: 'video', src: str(m.src, 1000) })
          break
        case 'text':
          if (typeof m.content === 'string' && m.content.trim()) modules.push({ type: 'text', content: str(m.content, 5000) })
          break
      }
    }

    if (modules.length === 0) {
      return Response.json({ error: 'no content found' }, { status: 400, headers: CORS })
    }

    const token = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    const data = {
      title: str(body.title, 200),
      description: str(body.description, 5000),
      cover: str(body.cover, 1000),
      sourceUrl: str(body.source_url, 1000),
      modules,
    }

    const payload = await getPayload({ config })
    await payload.create({
      collection: 'imports',
      data: { token, data, expiresAt: Date.now() + 60 * 60 * 1000 }, // 1 hour
      overrideAccess: true,
    })

    const count = modules.reduce((n: number, m) => {
      const mm = m as { type: string; images?: unknown[] }
      return n + (mm.type === 'image_row' ? (mm.images?.length ?? 0) : 1)
    }, 0)

    return Response.json({ import_id: token, count }, { headers: CORS })
  } catch (e) {
    console.error('[bookmarklet/submit]', e)
    return Response.json({ error: 'server error' }, { status: 500, headers: CORS })
  }
}
