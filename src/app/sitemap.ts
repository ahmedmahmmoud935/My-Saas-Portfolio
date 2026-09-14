import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { livePosts } from '@/lib/posts'
import { tenantUrl } from '@/lib/tenant-url'
import { settingsLang } from '@/lib/site-lang'

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

  /* Both languages of one page, addressed the way the pages themselves
     address them: the site's own language lives at the bare URL — the
     middleware sends `?lang=<that one>` there — and only the other carries a
     parameter. Offering the redirecting form here would have the sitemap and
     the page's own hreflang naming two different addresses for one language. */
  const langs = (url: string, site: 'ar' | 'en') => ({
    languages: {
      ar: site === 'ar' ? url : `${url}?lang=ar`,
      en: site === 'en' ? url : `${url}?lang=en`,
    },
  })

  // The platform's own pages are Arabic; a portfolio is asked below.
  const urls: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1, alternates: langs(base, 'ar') },
  ]

  try {
    const payload = await getPayload({ config })

    // The platform's own writing.
    const index = `${base}/blog`
    urls.push({ url: index, changeFrequency: 'weekly', priority: 0.7, alternates: langs(index, 'ar') })
    // Live in any language, not just the one this query happens to default to
    // — asking a single locale left every post out of the sitemap.
    const posts = await livePosts('ar')
    for (const p of posts) {
      const url = `${base}/blog/${p.slug}`
      urls.push({
        url,
        changeFrequency: 'monthly',
        priority: 0.7,
        lastModified: when(p.updatedAt),
        alternates: langs(url, 'ar'),
      })
    }

    const tenants = await payload.find({ collection: 'tenants', limit: 1000, depth: 0 })

    /* Which language each portfolio answers in at its bare address — the same
       question the middleware's map answers, asked here of the same setting. */
    const settings = await payload.find({ collection: 'site-settings', limit: 2000, depth: 0 })
    const langOf = new Map<number, 'ar' | 'en'>()
    for (const s of settings.docs) {
      const owner = s.tenant
      const id = typeof owner === 'object' ? (owner as { id?: number })?.id : owner
      const own = settingsLang(s as Parameters<typeof settingsLang>[0])
      if (typeof id === 'number' && own) langOf.set(id, own)
    }

    for (const t of tenants.docs) {
      // A suspended client's site 404s; listing it would only earn crawl errors.
      if ((t as { suspended?: boolean }).suspended) continue

      // Their own host — the subdomain, or the domain they bought.
      const home = tenantUrl(t.slug, (t as { domain?: string | null }).domain)
      const site = langOf.get(t.id) ?? 'en'
      urls.push({
        url: home,
        changeFrequency: 'weekly',
        priority: 0.9,
        lastModified: when(t.updatedAt),
        alternates: langs(home, site),
      })

      const index = `${home}/articles`
      urls.push({ url: index, changeFrequency: 'weekly', priority: 0.5, alternates: langs(index, site) })

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
          alternates: langs(url, site),
        })
      }

      for (const p of projects.docs) {
        const url = `${home}/project/${p.id}`
        urls.push({
          url,
          changeFrequency: 'monthly',
          priority: 0.8,
          lastModified: when(p.updatedAt),
          alternates: langs(url, site),
        })
      }
    }
  } catch {
    // DB unavailable (e.g. at build) — return whatever we have.
  }
  return urls
}
