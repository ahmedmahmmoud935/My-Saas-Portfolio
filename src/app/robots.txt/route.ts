export const dynamic = 'force-dynamic'

/**
 * robots.txt, written by hand rather than through Next's metadata helper so it
 * can carry a `Content-Signal` line — the helper only emits the classic
 * directives.
 *
 * The signals say what may be done with the work published here
 * (https://contentsignals.org):
 *
 *   search=yes    — index it and link to it. This is how clients find the work.
 *   ai-input=yes  — an assistant may read a page to answer someone asking about
 *                   this designer right now. Same purpose as search.
 *   ai-train=no   — do NOT use it as training data. The pages are other
 *                   people's design work, published to be seen and hired for,
 *                   not to be absorbed into a model.
 *
 * It is a stated preference, not an enforcement mechanism: crawlers that ignore
 * robots.txt will ignore this too.
 */
export function GET() {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const body = [
    '# Content preferences — https://contentsignals.org',
    'User-Agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /dashboard',
    'Disallow: /api',
    '',
    ...(base ? [`Sitemap: ${base}/sitemap.xml`, ''] : []),
  ].join('\n')

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
