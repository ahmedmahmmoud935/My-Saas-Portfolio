import { getPayload } from 'payload'
import config from '@payload-config'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'

// Dev-only seed for a demo tenant so the public portfolio has something to show.
// Guarded by ?key=seed-viralpx. Idempotent: no-op if the tenant already exists.

async function solid(
  w: number,
  h: number,
  rgb: [number, number, number],
  label?: string,
): Promise<Buffer> {
  const svgLabel = label
    ? `<svg width="${w}" height="${h}"><rect width="100%" height="100%" fill="rgb(${rgb.join(
        ',',
      )})"/><text x="50%" y="50%" font-family="sans-serif" font-size="${Math.round(
        w / 12,
      )}" fill="rgba(255,255,255,0.85)" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
    : `<svg width="${w}" height="${h}"><rect width="100%" height="100%" fill="rgb(${rgb.join(
        ',',
      )})"/></svg>`
  return sharp(Buffer.from(svgLabel)).webp({ quality: 80 }).toBuffer()
}

export async function GET(req: Request) {
  // Off by default — set ENABLE_SEED_ROUTES=true to expose this while seeding,
  // then unset it before real launch. Returns 404 so the route is invisible.
  if (process.env.ENABLE_SEED_ROUTES !== 'true') {
    return Response.json({ error: 'not found' }, { status: 404 })
  }
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'seed-viralpx') {
    return Response.json({ error: 'bad key' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const reset = url.searchParams.get('reset') === '1'
  const existing = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'ahmed' } },
    limit: 1,
  })
  if (existing.docs[0]) {
    if (!reset) {
      return Response.json({ ok: true, note: 'already seeded', tenant: existing.docs[0].id })
    }
    const tid = existing.docs[0].id
    // Delete referencing docs before media, then the tenant.
    for (const coll of [
      'projects',
      'achievements',
      'logos',
      'testimonials',
      'site-settings',
      'media',
    ] as const) {
      await payload.delete({ collection: coll, where: { tenant: { equals: tid } } })
    }
    await payload.delete({
      collection: 'users',
      where: { email: { equals: 'ahmed@viralpx.test' } },
    })
    await payload.delete({ collection: 'tenants', id: tid })
  }

  const tenant = await payload.create({
    collection: 'tenants',
    data: { name: 'Ahmed Mahmoud', slug: 'ahmed', storageLimitMb: 1024 },
  })
  const t = tenant.id

  // A client user who owns this tenant (for the dashboard login).
  await payload.create({
    collection: 'users',
    data: {
      email: 'ahmed@viralpx.test',
      password: 'password123',
      name: 'Ahmed',
      isOwner: true, // demo account: owner + client (so all tabs are testable)
      tenants: [{ tenant: t }],
    },
  })

  const upload = async (buf: Buffer, name: string) =>
    (
      await payload.create({
        collection: 'media',
        data: { alt: name, tenant: t },
        file: { data: buf, mimetype: 'image/webp', name: `${name}.webp`, size: buf.length },
      })
    ).id

  const heroImg = await upload(await solid(1600, 900, [24, 20, 34]), 'hero')
  const aboutImg = await upload(await solid(600, 600, [40, 34, 58], 'Ahmed'), 'about')

  const palette: [number, number, number][] = [
    [139, 92, 246],
    [236, 72, 153],
    [59, 130, 246],
    [234, 179, 8],
    [16, 185, 129],
    [244, 114, 22],
    [99, 102, 241],
  ]
  const cats = [
    'Social Media',
    'Brand Identity',
    'Logo Design',
    'Print Design',
    'Packaging',
    'Posters',
    'UI/UX',
  ]

  // Project 0 = "free" (module page-builder) to showcase the blocks.
  {
    const color = palette[0]
    const cover = await upload(await solid(900, 675, color, 'Maaloom'), 'proj-free')
    const big = await upload(await solid(1400, 800, [30, 26, 44], 'Hero shot'), 'free-big')
    await payload.create({
      collection: 'projects',
      data: {
        tenant: t,
        title: 'Brand Identity — Maaloom',
        category: 'Brand Identity',
        description: 'A complete visual identity for a modern learning platform.',
        mediaType: 'image',
        projectType: 'free',
        cover,
        sortOrder: 0,
        modules: [
          { blockType: 'text', textType: 'h1', value: 'Maaloom' },
          {
            blockType: 'text',
            textType: 'p',
            value:
              'A full brand identity — logo, palette, and system — for an education startup that wanted to feel warm, credible, and modern.',
          },
          { blockType: 'image', src: big },
          { blockType: 'separator', spacing: 'normal' },
        ],
      },
    })
  }

  // Projects 1..3 = grid covers (kept light so the seed finishes fast).
  for (let i = 1; i < 4; i++) {
    const color = palette[i % palette.length]
    const cover = await upload(await solid(900, 675, color, `Project ${i + 1}`), `proj-${i}`)
    await payload.create({
      collection: 'projects',
      data: {
        tenant: t,
        title: `Project ${i + 1}`,
        category: cats[i % cats.length],
        description: 'A sample project showcasing the grid detail layout.',
        mediaType: 'image',
        projectType: 'grid',
        cover,
        sortOrder: i,
      },
    })
  }

  // Achievements
  const ach = [
    ['Completed Projects', '50+'],
    ['Happy Clients', '30+'],
    ['Years Experience', '5+'],
    ['Satisfaction Rate', '99%'],
  ]
  for (let i = 0; i < ach.length; i++) {
    await payload.create({
      collection: 'achievements',
      data: { tenant: t, title: ach[i][0], value: ach[i][1], sortOrder: i },
    })
  }

  // A client logo
  const logoImg = await upload(await solid(300, 160, [255, 255, 255], 'Sanadak'), 'logo-sanadak')
  await payload.create({
    collection: 'logos',
    data: {
      tenant: t,
      name: 'Sanadak',
      logo: logoImg,
      websiteUrl: 'https://sanadak.gov.ae/en/',
      sortOrder: 0,
    },
  })

  // Testimonial
  const avatar = await upload(await solid(120, 120, [139, 92, 246], 'S'), 'avatar')
  await payload.create({
    collection: 'testimonials',
    data: {
      tenant: t,
      name: 'Sara K.',
      role: 'Marketing Lead',
      company: 'Sanadak',
      content:
        'Ahmed delivered an outstanding brand identity — fast, thoughtful, and exactly what we needed.',
      avatar,
      rating: 5,
      approved: true,
      sortOrder: 0,
    },
  })

  // Site settings (purple accent, matching the live tenant look)
  await payload.create({
    collection: 'site-settings',
    data: {
      tenant: t,
      siteName: 'Ahmed Mahmoud',
      colors: {
        accent: '#8B5CF6',
        bg: '#0A0A0A',
        bg2: '#111111',
        text: '#FFFFFF',
        subtext: '#999999',
      },
      brand: { heroCover: heroImg, photo: aboutImg },
      heroCover: { overlay: 55, height: 82, posX: 50, posY: 50, size: 'cover' },
      categories: {
        image: cats.map((name) => ({ name })),
        video: [{ name: 'Reels' }, { name: 'Video Editing' }],
      },
      navbarLinks: [
        { linkId: 'about', label: 'About', visible: true },
        { linkId: 'projects', label: 'Projects', visible: true },
        { linkId: 'achievements', label: 'Experience', visible: true },
        { linkId: 'contact', label: 'Contact', visible: true },
      ],
      content: {
        hero: {
          name: 'Ahmed Mahmoud',
          title: 'Multimedia Designer',
          btn1: 'View Work',
          btn2: 'Get In Touch',
        },
        about: {
          text: 'Creative multimedia designer with 5+ years of experience in branding, graphic design, and motion graphics. I help brands tell their story through clean, effective visual work.',
          tags: 'Branding, Social Media, Print Design, Packaging, Motion',
        },
        projects: {
          title: 'Selected Work',
          subtitle: 'A collection of projects I’m proud of',
        },
        expertise: {
          title: 'Key Expertise',
          items: [
            { title: 'Graphic Design', description: 'Brand identities, social media, print & packaging.' },
            { title: 'Motion Graphics', description: 'Animated brand assets and explainer motion.' },
            { title: 'Video Editing', description: 'Reels, promos, and short-form storytelling.' },
            { title: 'AI-Powered Content', description: 'AI-assisted visuals and rapid iteration.' },
            { title: 'UI/UX Design', description: 'Clean, usable interfaces for web and mobile.' },
          ],
        },
        experience: {
          items: [
            { company: 'Kingdom Institute, UAE', role: 'Senior Multimedia Designer', period: '2023 — Now' },
            { company: 'Sanadak (Gulf Central Bank), UAE', role: 'Multimedia Designer', period: '2021 — 2023' },
            { company: 'SAS for Chemical Industries, Egypt', role: 'Graphic Designer', period: '2019 — 2021' },
          ],
        },
        tools: {
          items: [
            { name: 'Photoshop' },
            { name: 'After Effects' },
            { name: 'Premiere' },
            { name: 'Illustrator' },
            { name: 'Figma' },
          ],
        },
        education: {
          items: [
            { title: 'Bachelor of Fine Arts', org: 'Zagazig University', period: '2015 — 2019' },
          ],
        },
        skills: {
          items: 'Creative Thinking, Communication, Teamwork, Attention to Detail, Time Management, Adaptability',
        },
        contact: {
          title: "Let's Work Together",
          subtitle: 'Have a project in mind? Let’s make it happen.',
          email: 'ahmedmahmmoud935@gmail.com',
          phone: '+971 55 871 0190',
        },
      },
    },
  })

  return Response.json({ ok: true, tenant: t, url: '/ahmed' })
}
