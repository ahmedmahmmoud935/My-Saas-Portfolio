import { getPayload } from 'payload'
import config from '@payload-config'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

// Lightweight, reliable bootstrap: creates the demo tenant + owner user + text
// settings (NO media), so login works even if R2 is misbehaving. Also runs a
// single R2 upload probe (with a timeout) and reports the result for diagnosis.
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'viralpx-init') {
    return Response.json({ error: 'bad key' }, { status: 401 })
  }
  const payload = await getPayload({ config })

  // ── tenant + user (idempotent) ──
  let tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: 'ahmed' } }, limit: 1 })
  ).docs[0]
  if (!tenant) {
    tenant = await payload.create({
      collection: 'tenants',
      data: { name: 'Ahmed Mahmoud', slug: 'ahmed', storageLimitMb: 1024 },
    })
  }
  const t = tenant.id

  const existingUser = await payload.find({
    collection: 'users',
    where: { email: { equals: 'ahmed@viralpx.test' } },
    limit: 1,
  })
  if (!existingUser.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'ahmed@viralpx.test',
        password: 'password123',
        name: 'Ahmed',
        isOwner: true,
        tenants: [{ tenant: t }],
      },
    })
  }

  // ── minimal settings (text only) ──
  const hasSettings = await payload.count({
    collection: 'site-settings',
    where: { tenant: { equals: t } },
  })
  if (hasSettings.totalDocs === 0) {
    await payload.create({
      collection: 'site-settings',
      data: {
        tenant: t,
        siteName: 'Ahmed Mahmoud',
        colors: { accent: '#8B5CF6', bg: '#0A0A0A', bg2: '#111111', text: '#FFFFFF', subtext: '#999999' },
        content: {
          hero: { name: 'Ahmed Mahmoud', title: 'Multimedia Designer', btn1: 'View Work', btn2: 'Get In Touch' },
          about: { text: 'Creative multimedia designer with 5+ years of experience.', tags: 'Branding, Social Media, Print Design' },
          projects: { title: 'Selected Work', subtitle: 'A collection of projects I’m proud of' },
          contact: { title: "Let's Work Together", email: 'ahmedmahmmoud935@gmail.com', phone: '+971 55 871 0190' },
        },
      } as never,
    })
  }

  // ── R2 probe (timeout so we never hang) ──
  let r2: string
  try {
    const buf = await sharp({ create: { width: 200, height: 150, channels: 3, background: { r: 139, g: 92, b: 246 } } })
      .webp()
      .toBuffer()
    const created = (await Promise.race([
      payload.create({
        collection: 'media',
        data: { alt: 'probe', tenant: t },
        file: { data: buf, mimetype: 'image/webp', name: 'probe.webp', size: buf.length },
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('R2 upload timed out after 15s')), 15000)),
    ])) as { id: number; url?: string }
    r2 = `ok id=${created.id} url=${created.url}`
  } catch (e) {
    r2 = `FAILED: ${(e as Error).message}`
  }

  return Response.json({ ok: true, tenant: t, login: 'ahmed@viralpx.test / password123', r2 })
}
