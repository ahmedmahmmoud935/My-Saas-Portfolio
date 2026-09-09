import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'

/**
 * The platform's own writing, and which language a reader gets.
 *
 * `published` is per language, like the title and the slug — the two versions
 * of a piece are often not the same piece. But the editor writes Arabic, so
 * only the Arabic row was ever marked published, and every query that asked a
 * single locale for `published: true` came back empty. /blog answered in
 * English by default, so the address in the nav and in the sitemap showed
 * nothing at all while the post sat there published.
 *
 * A post is live once it is published in ANY language. A reader gets the
 * language they asked for when that one is published, and the other one when
 * it is not — a piece that exists in Arabic is better read in Arabic than not
 * found.
 */
export type LivePost = {
  id: number
  /** The language actually being shown, which is not always the one asked for. */
  locale: 'ar' | 'en'
  title: string
  slug: string
  excerpt: string | null
  contentHtml: string | null
  cover: number | Media | null
  createdAt: string
  updatedAt: string
  seo: {
    keyphrase?: string | null
    title?: string | null
    description?: string | null
    noindex?: boolean | null
    nofollow?: boolean | null
  }
}

type PerLocale<T> = { ar?: T | null; en?: T | null }
type RawPost = Record<string, unknown> & {
  id: number
  published?: PerLocale<boolean>
  createdAt: string
  updatedAt: string
}

/** The value for a locale, falling back to the other one. */
const pick = <T,>(v: unknown, loc: 'ar' | 'en'): T | null => {
  if (v === null || v === undefined) return null
  if (typeof v !== 'object') return v as T
  const per = v as PerLocale<T>
  if (!('ar' in per) && !('en' in per)) return v as T
  return (per[loc] ?? per[loc === 'ar' ? 'en' : 'ar'] ?? null) as T | null
}

/** Which language of this post to show someone who asked for `want`. */
function shownLocale(p: RawPost, want: 'ar' | 'en'): 'ar' | 'en' | null {
  const pub = p.published ?? {}
  if (pub[want] === true) return want
  const other = want === 'ar' ? 'en' : 'ar'
  if (pub[other] === true) return other
  return null
}

function shape(p: RawPost, loc: 'ar' | 'en'): LivePost | null {
  const slug = pick<string>(p.slug, loc)
  const title = pick<string>(p.title, loc)
  if (!slug || !title) return null
  const seo = (p.seo ?? {}) as Record<string, unknown>
  return {
    id: p.id,
    locale: loc,
    title,
    slug,
    excerpt: pick<string>(p.excerpt, loc),
    contentHtml: pick<string>(p.contentHtml, loc),
    cover: (p.cover ?? null) as number | Media | null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    seo: {
      keyphrase: pick<string>(seo.keyphrase, loc),
      title: pick<string>(seo.title, loc),
      description: pick<string>(seo.description, loc),
      noindex: (seo.noindex as boolean) ?? false,
      nofollow: (seo.nofollow as boolean) ?? false,
    },
  }
}

/** Everything live, newest first, in the language this reader should get. */
export async function livePosts(want: 'ar' | 'en'): Promise<LivePost[]> {
  try {
    const payload = await getPayload({ config })
    // Every language at once: whether a post is live is a question about all of
    // them, and asking one locale is what hid them in the first place.
    const res = await payload.find({
      collection: 'posts',
      sort: '-createdAt',
      limit: 200,
      depth: 1,
      locale: 'all',
    })
    const out: LivePost[] = []
    for (const doc of res.docs as unknown as RawPost[]) {
      const loc = shownLocale(doc, want)
      if (!loc) continue
      const post = shape(doc, loc)
      if (post) out.push(post)
    }
    return out
  } catch {
    return []
  }
}

/** One post by slug, matched in either language. */
export async function livePost(slug: string, want: 'ar' | 'en'): Promise<LivePost | null> {
  const all = await livePosts(want)
  const hit = all.find((p) => p.slug === slug)
  if (hit) return hit
  // The address may be the slug of the language the reader did not ask for.
  const other = await livePosts(want === 'ar' ? 'en' : 'ar')
  return other.find((p) => p.slug === slug) ?? null
}
