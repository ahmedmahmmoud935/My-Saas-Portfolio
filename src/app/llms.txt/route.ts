import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// Machine-readable site summary for LLM crawlers (https://llmstxt.org).
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const lines: string[] = [
    '# ViralPX',
    '',
    '> Multi-tenant portfolio-builder SaaS. Each creator gets a hosted portfolio',
    '> at /<username> (or their own custom domain) with projects, reels, articles,',
    '> testimonials and a contact form.',
    '',
    '## Portfolios',
  ]
  try {
    const payload = await getPayload({ config })
    const tenants = await payload.find({ collection: 'tenants', limit: 1000, depth: 0 })
    for (const t of tenants.docs) {
      lines.push(`- [${t.name}](${base}/${t.slug}): portfolio, articles at ${base}/${t.slug}/articles`)
    }
  } catch {
    // DB unavailable — still return the header.
  }
  lines.push('', '## Optional', `- [Sitemap](${base}/sitemap.xml)`, '')

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
