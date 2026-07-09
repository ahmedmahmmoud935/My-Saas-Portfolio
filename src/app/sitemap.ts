import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const urls: MetadataRoute.Sitemap = base ? [{ url: base, changeFrequency: 'weekly' }] : []
  try {
    const payload = await getPayload({ config })
    const tenants = await payload.find({ collection: 'tenants', limit: 1000, depth: 0 })
    for (const t of tenants.docs) {
      urls.push({ url: `${base}/${t.slug}`, changeFrequency: 'weekly' })
      urls.push({ url: `${base}/${t.slug}/articles`, changeFrequency: 'weekly' })
      const articles = await payload.find({
        collection: 'articles',
        where: { and: [{ tenant: { equals: t.id } }, { published: { equals: true } }] },
        limit: 500,
        depth: 0,
      })
      for (const a of articles.docs) {
        urls.push({ url: `${base}/${t.slug}/articles/${a.slug}`, changeFrequency: 'monthly' })
      }
    }
  } catch {
    // DB unavailable (e.g. at build) — return whatever we have.
  }
  return urls
}
