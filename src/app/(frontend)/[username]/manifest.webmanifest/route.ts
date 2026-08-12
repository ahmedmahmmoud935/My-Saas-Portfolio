import { getPortfolio, mediaUrl } from '@/lib/portfolio'

/**
 * Per-portfolio web app manifest. Installing `/<username>` to the home screen
 * gives the creator's own name, colours and logo — so each portfolio behaves
 * like its own mobile app rather than a ViralPX shortcut.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const data = await getPortfolio(username)
  if (!data || data.tenant.suspended) {
    return new Response('Not found', { status: 404 })
  }

  const settings = data.settings
  const name = settings?.content?.hero?.name || data.tenant.name || username
  const title = settings?.content?.hero?.title || 'Portfolio'
  const colors = settings?.colors
  // Always a real 512×512 PNG (see ./icon-512.png/route.ts) — raw uploads come
  // in arbitrary sizes/formats and Chrome silently rejects those.
  const icon = `/${username}/icon-512.png`

  const body = {
    name: `${name} — ${title}`,
    short_name: name,
    description: settings?.content?.about?.text?.slice(0, 180) || title,
    start_url: `/${username}`,
    scope: `/${username}`,
    id: `/${username}`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: colors?.bg || '#0A0A0A',
    theme_color: colors?.bg || '#0A0A0A',
    icons: [
      { src: icon, sizes: '512x512', type: 'image/png' },
      // Same square, flagged maskable: Android crops to a circle and the logo
      // already sits inside the safe zone.
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }

  return Response.json(body, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}
