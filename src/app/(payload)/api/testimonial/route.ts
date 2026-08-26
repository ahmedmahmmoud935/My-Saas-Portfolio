import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/** A client's photo, if they attached one. Kept small on purpose: this endpoint
 *  takes uploads from anyone with the link, so the ceiling is what a phone
 *  photo needs and nothing more. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])

// Public testimonial submission → created with source='public', approved=false
// so it stays hidden until the owner approves it in the dashboard/admin.
export async function POST(req: Request) {
  try {
    // The form sends multipart when a photo is attached and JSON when it isn't.
    const isForm = (req.headers.get('content-type') || '').includes('multipart/form-data')
    let fields: Record<string, string | undefined> = {}
    let photo: File | null = null

    if (isForm) {
      const fd = await req.formData()
      for (const k of ['username', 'name', 'role', 'company', 'content', 'rating']) {
        const v = fd.get(k)
        if (typeof v === 'string') fields[k] = v
      }
      const f = fd.get('photo')
      if (f && typeof f !== 'string') photo = f
    } else {
      const body = (await req.json()) as Record<string, unknown>
      fields = Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, v == null ? undefined : String(v)]),
      )
    }

    const { username, name, role, company, content, rating } = fields
    if (!username || !name || !content) {
      return Response.json({ ok: false, error: 'missing fields' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const tenant = (
      await payload.find({
        collection: 'tenants',
        where: { slug: { equals: username } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]
    if (!tenant) return Response.json({ ok: false, error: 'unknown tenant' }, { status: 404 })

    const r = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)))

    // The photo is optional, and a bad one must never cost the testimonial:
    // whatever happens here, the words still get through.
    let avatar: number | undefined
    if (photo && photo.size > 0 && photo.size <= MAX_PHOTO_BYTES && PHOTO_TYPES.has(photo.type)) {
      try {
        const buf = Buffer.from(await photo.arrayBuffer())
        const media = await payload.create({
          collection: 'media',
          data: { tenant: tenant.id, alt: String(name).slice(0, 120) },
          file: {
            data: buf as Buffer<ArrayBuffer>,
            mimetype: photo.type,
            name: photo.name || 'photo.jpg',
            size: buf.length,
          },
        })
        avatar = media.id
      } catch {
        /* keep the testimonial, drop the photo */
      }
    }

    await payload.create({
      collection: 'testimonials',
      data: {
        tenant: tenant.id,
        name: String(name).slice(0, 120),
        role: role ? String(role).slice(0, 120) : undefined,
        company: company ? String(company).slice(0, 120) : undefined,
        content: String(content).slice(0, 2000),
        rating: r,
        ...(avatar ? { avatar } : {}),
        source: 'public',
        approved: false,
      },
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
