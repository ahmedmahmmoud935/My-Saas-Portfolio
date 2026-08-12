import type { MetadataRoute } from 'next'

/**
 * App-wide manifest — used by the marketing landing and the dashboard.
 * Each portfolio serves its own manifest at `/<username>/manifest.webmanifest`
 * so a visitor installs the *creator's* app (their name + logo), not ViralPX.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ViralPX — بورتفوليو احترافي',
    short_name: 'ViralPX',
    description: 'ابنِ بورتفوليو احترافي في دقائق',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ar',
    dir: 'rtl',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
