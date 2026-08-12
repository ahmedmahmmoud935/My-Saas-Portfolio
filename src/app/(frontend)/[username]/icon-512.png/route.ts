import { readFile } from 'fs/promises'
import path from 'path'
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

/**
 * The public origin of this request. Behind the reverse proxy `req.url` is the
 * container's own bind address (https://0.0.0.0:3000), which is not fetchable —
 * so trust the forwarded headers first.
 */
function publicOrigin(req: Request): string {
  const h = req.headers
  const host = h.get('x-forwarded-host') || h.get('host')
  if (host) return `${h.get('x-forwarded-proto') || 'https'}://${host}`
  return process.env.NEXT_PUBLIC_SERVER_URL || new URL(req.url).origin
}

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const data = await getPortfolio(username)
  if (!data) return new Response('Not found', { status: 404 })

  const bg = data.settings?.colors?.bg || '#0A0A0A'
  const brand = data.settings?.brand
  const logoSrc = mediaUrl(brand?.brandLogo) || mediaUrl(brand?.avatar)
  // A logo gets padded onto the brand colour; a photo is cropped to fill the
  // tile instead, which reads far better than a letterboxed portrait.
  const src = logoSrc || mediaUrl(brand?.photo, 'card')

  try {
    if (!src) throw new Error('no logo')
    const res = await fetch(new URL(src, publicOrigin(req)))
    if (!res.ok) throw new Error(`logo ${res.status}`)
    const input = Buffer.from(await res.arrayBuffer())

    const png = logoSrc
      ? await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: bg } })
          .composite([
            {
              input: await sharp(input)
                .resize(INNER_W, INNER_H, { fit: 'inside' })
                .png()
                .toBuffer(),
              gravity: 'centre',
            },
          ])
          .png()
          .toBuffer()
      : await sharp(input).resize(SIZE, SIZE, { fit: 'cover', position: 'top' }).png().toBuffer()

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    // No usable logo — serve the ViralPX mark straight off disk. (A redirect
    // would have to name a host, and behind the proxy we'd guess it wrong.)
    try {
      const fallback = await readFile(path.join(process.cwd(), 'public', 'icon-512.png'))
      return new Response(new Uint8Array(fallback), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
      })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  }
}
