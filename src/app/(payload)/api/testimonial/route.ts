import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// Public testimonial submission → created with source='public', approved=false
// so it stays hidden until the owner approves it in the dashboard/admin.
export async function POST(req: Request) {
  try {
    const { username, name, role, company, content, rating } = (await req.json()) as {
      username?: string
      name?: string
      role?: string
      company?: string
      content?: string
      rating?: number
    }
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

    await payload.create({
      collection: 'testimonials',
      data: {
        tenant: tenant.id,
        name: String(name).slice(0, 120),
        role: role ? String(role).slice(0, 120) : undefined,
        company: company ? String(company).slice(0, 120) : undefined,
        content: String(content).slice(0, 2000),
        rating: r,
        source: 'public',
        approved: false,
      },
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
