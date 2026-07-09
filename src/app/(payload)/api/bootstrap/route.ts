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

  // small helper: solid-colour webp
  const img = (w: number, h: number, rgb: [number, number, number]) =>
    sharp({ create: { width: w, height: h, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } })
      .webp({ quality: 78 })
      .toBuffer()
  const up = async (buf: Buffer, name: string) =>
    (
      await payload.create({
        collection: 'media',
        data: { alt: name, tenant: t },
        file: { data: buf, mimetype: 'image/webp', name: `${name}.webp`, size: buf.length },
      })
    ).id

  const cnt = async (collection: 'projects' | 'achievements' | 'logos' | 'testimonials') =>
    (await payload.count({ collection, where: { tenant: { equals: t } } })).totalDocs

  // INCREMENTAL: each call adds at most ONE image-upload, so requests stay fast.
  // Call it repeatedly (e.g. 5×) until everything exists.
  let step = 'noop'
  try {
    const palette: [number, number, number][] = [
      [139, 92, 246],
      [236, 72, 153],
      [59, 130, 246],
      [16, 185, 129],
    ]
    const cats = ['Brand Identity', 'Social Media', 'Logo Design', 'UI/UX']

    if ((await cnt('achievements')) === 0) {
      // no uploads — instant
      const ach: [string, string][] = [
        ['Completed Projects', '50+'],
        ['Happy Clients', '30+'],
        ['Years Experience', '5+'],
        ['Satisfaction Rate', '99%'],
      ]
      for (let i = 0; i < ach.length; i++) {
        await payload.create({
          collection: 'achievements',
          data: { tenant: t, title: ach[i][0], value: ach[i][1], sortOrder: i } as never,
        })
      }
      step = 'achievements'
    } else {
      const pc = await cnt('projects')
      if (pc < 4) {
        const cover = await up(await img(600, 450, palette[pc]), `proj-${pc}`)
        await payload.create({
          collection: 'projects',
          data: {
            tenant: t,
            title: `Project ${pc + 1}`,
            category: cats[pc],
            description: 'A sample project.',
            mediaType: 'image',
            projectType: 'grid',
            cover,
            sortOrder: pc,
          } as never,
        })
        step = `project ${pc + 1}`
      } else if ((await cnt('logos')) === 0) {
        const logo = await up(await img(300, 160, [255, 255, 255]), 'logo')
        await payload.create({
          collection: 'logos',
          data: { tenant: t, name: 'Sanadak', logo, websiteUrl: 'https://sanadak.gov.ae/en/', sortOrder: 0 } as never,
        })
        step = 'logo'
      } else if ((await cnt('testimonials')) === 0) {
        await payload.create({
          collection: 'testimonials',
          data: {
            tenant: t,
            name: 'Sara K.',
            role: 'Marketing Lead',
            company: 'Sanadak',
            content: 'Ahmed delivered outstanding work — fast and exactly what we needed.',
            rating: 5,
            approved: true,
            sortOrder: 0,
          } as never,
        })
        step = 'testimonial'
      } else {
        step = 'complete'
      }
    }
  } catch (e) {
    step = `FAILED: ${(e as Error).message}`
  }

  return Response.json({
    ok: true,
    tenant: t,
    login: 'ahmed@viralpx.test / password123',
    step,
    counts: {
      projects: await cnt('projects'),
      achievements: await cnt('achievements'),
      logos: await cnt('logos'),
      testimonials: await cnt('testimonials'),
    },
  })
}
