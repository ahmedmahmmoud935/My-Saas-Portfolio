import { BOOKMARKLET_JS } from '@/lib/behance-bookmarklet'

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://viralpx.com'

// Served to the visitor's browser and injected on a Behance project page.
export function GET() {
  const js = BOOKMARKLET_JS.replaceAll('__API_BASE__', SITE)
  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}
