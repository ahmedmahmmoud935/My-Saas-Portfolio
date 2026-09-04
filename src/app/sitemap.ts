import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/** The date a search engine should use to decide whether to come back. */
const when = (v: unknown): Date | undefined => {
  const d = typeof v === 'string' ? new Date(v) : null
  return d && !Number.isNaN(d.getTime()) ? d : undefined
}

/**
 * Every public address on the platform.
 *
 * Project pages were missing entirely — thirteen of them on one portfolio
 * alone, all linked from the page and none of them listed here. So were
 * `lastmod` (which is how a crawler decides what is worth revisiting) and the
 * language alternates, which Next emits as xhtml:link when `alternates` is set.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  if (!base) return []

  const langs = (url: string) => ({
    languages: { ar: `${url}?lang=ar`, en: `${url}?lang=en` },
  })

  const urls: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1, alternates: langs(base) },
  ]

  try {
    const payload = await getPayload({ config })

    // The platform's own writing.
    const index = `${base}/blog`
    urls.push({ url: index, changeFrequency: 'weekly', priority: 0.7, alternates: langs(index) })
    const posts = await payload.find({
      collection: 'posts',
      where: { published: { equals: true } },
      limit: 500,
      depth: 0,
    })
    for (const p of posts.docs) {
      const url = `${base}/blog/${p.slug}`
      urls.push({
        url,
        changeFrequency: 'monthly',
        priority: 0.7,
        lastModified: when(p.updatedAt),
        alternates: langs(url),
      })
    }

    const tenants = await payload.find({ collection: 'tenants', limit: 1000, depth: 0 })

    for (const t of tenants.docs) {
      // A suspended client's site 404s; listing it would only earn crawl errors.
      if ((t as { suspended?: boolean }).suspended) continue

      const home = `${base}/${t.slug}`
      urls.push({
        url: home,
        changeFrequency: 'weekly',
        priority: 0.9,
        lastModified: when(t.updatedAt),
        alternates: langs(home),
      })

      const index = `${home}/articles`
      urls.push({ url: index, changeFrequency: 'weekly', priority: 0.5, alternates: langs(index) })

      const [articles, projects] = await Promise.all([
        payload.find({
          collection: 'articles',
          where: { and: [{ tenant: { equals: t.id } }, { published: { equals: true } }] },
          limit: 500,
          depth: 0,
        }),
        payload.find({
          collection: 'projects',
          where: { tenant: { equals: t.id } },
          limit: 500,
          depth: 0,
        }),
      ])

      for (const a of articles.docs) {
        const url = `${home}/articles/${a.slug}`
        urls.push({
          url,
          changeFrequency: 'monthly',
          priority: 0.6,
          lastModified: when(a.updatedAt),
          alternates: langs(url),
        })
      }

      for (const p of projects.docs) {
        const url = `${home}/project/${p.id}`
        urls.push({
          url,
          changeFrequency: 'monthly',
          priority: 0.8,
          lastModified: when(p.updatedAt),
          alternates: langs(url),
        })
      }
    }
  } catch {
    // DB unavailable (e.g. at build) — return whatever we have.
  }
  return urls
}
