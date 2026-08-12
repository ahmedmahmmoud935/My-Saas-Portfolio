import sharp from 'sharp'
import { getPortfolio, mediaUrl } from '@/lib/portfolio'

/**
 * The tenant's home-screen icon, rendered as a real 512×512 PNG.
 *
 * Chrome decodes manifest icons and drops anything whose dimensions don't work,
 * so we can't just point the manifest at a raw logo upload (any size, often a
 * transparent PNG or a WebP). Instead we composite the logo onto the portfolio's
 * background colour at a fixed size. Falls back to the ViralPX mark.
 */
export const revalidate = 3600

const SIZE = 512
// Android's maskable safe zone is a circle of diameter 0.8×size. A wide logo can
// use more width than a square one and still fit, so cap the two axes separately
// (a square at 0.56 has a 406px diagonal — just inside the 410px circle).
const INNER_W = Math.round(SIZE * 0.76)
const INNER_H = Math.round(SIZE * 0.56)

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const data = await getPortfolio(username)
  if (!data) return new Response('Not found', { status: 404 })

  const bg = data.settings?.colors?.bg || '#0A0A0A'
  const src =
    mediaUrl(data.settings?.brand?.brandLogo) ||
    mediaUrl(data.settings?.brand?.avatar) ||
    mediaUrl(data.settings?.brand?.photo, 'thumb')

  try {
    if (!src) throw new Error('no logo')
    // Resolve against the incoming request so this works on any host/port.
    const res = await fetch(new URL(src, req.url))
    if (!res.ok) throw new Error(`logo ${res.status}`)

    const logo = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(INNER_W, INNER_H, { fit: 'inside', withoutEnlargement: false })
      .png()
      .toBuffer()

    const png = await sharp({
      create: { width: SIZE, height: SIZE, channels: 4, background: bg },
    })
      .composite([{ input: logo, gravity: 'centre' }])
      .png()
      .toBuffer()

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    // No usable logo — fall back to the ViralPX mark.
    return Response.redirect(new URL('/icon-512.png', req.url), 307)
  }
}
