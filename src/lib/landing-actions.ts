'use server'

import { getDashboardContext } from './dashboard'
import { LANDING_COPY } from './landing-copy'
import { mediaUrl } from './portfolio'

type Copy = (typeof LANDING_COPY)['ar']

/** Look + imagery, shared by both locales. */
export type LandingTheme = {
  accent: string
  bg: string
  bg2: string
  text: string
  subtext: string
}
export type LandingImages = {
  logoId: number | null
  logoUrl: string | null
  heroId: number | null
  heroUrl: string | null
  heroDim: number
  ogId: number | null
  ogUrl: string | null
}

// Not exported: a 'use server' module may only export async functions.
/** Falls back to the colours the page ships with. */
const DEFAULT_LANDING_THEME: LandingTheme = {
  accent: '#F97316',
  bg: '#0A0A0A',
  bg2: '#111111',
  text: '#FFFFFF',
  subtext: '#9AA0AA',
}


/** Saved colours, minus the blanks — a null column must not beat the default. */
function setOnly<T extends object>(o: unknown): Partial<T> {
  if (!o || typeof o !== 'object') return {}
  return Object.fromEntries(
    Object.entries(o as Record<string, unknown>).filter(([, v]) => v !== null && v !== ''),
  ) as Partial<T>
}

async function ownerCtx() {
  const ctx = await getDashboardContext()
  if (!ctx || !ctx.user.isOwner) throw new Error('forbidden')
  return ctx
}

/** Current landing copy for both locales (saved values merged over defaults). */
export async function getLandingForm(): Promise<{
  ar: Copy
  en: Copy
  theme: LandingTheme
  images: LandingImages
}> {
  const ctx = await ownerCtx()
  const g = (await ctx.payload.findGlobal({ slug: 'landing', locale: 'all', depth: 1 })) as {
    content?: { ar?: Partial<Copy>; en?: Partial<Copy> }
    theme?: Partial<LandingTheme>
    images?: Record<string, unknown>
  }
  const im = g.images ?? {}
  const rel = (v: unknown) =>
    v && typeof v === 'object' ? ((v as { id?: number }).id ?? null) : ((v as number) ?? null)

  return {
    ar: { ...LANDING_COPY.ar, ...(g.content?.ar ?? {}) },
    en: { ...LANDING_COPY.en, ...(g.content?.en ?? {}) },
    theme: { ...DEFAULT_LANDING_THEME, ...setOnly<LandingTheme>(g.theme) },
    images: {
      logoId: rel(im.logo),
      logoUrl: mediaUrl((im.logo as never) ?? null, 'thumb'),
      heroId: rel(im.hero),
      heroUrl: mediaUrl((im.hero as never) ?? null, 'card'),
      heroDim: (im.heroDim as number) ?? 40,
      ogId: rel(im.ogImage),
      ogUrl: mediaUrl((im.ogImage as never) ?? null, 'card'),
    },
  }
}

/** Save both locales of the landing copy (owner only). */
export async function saveLanding(
  ar: Copy,
  en: Copy,
  theme?: LandingTheme,
  images?: LandingImages,
) {
  const ctx = await ownerCtx()
  // Locale-specific copy first, then the shared look in one non-localized pass.
  await ctx.payload.updateGlobal({ slug: 'landing', data: { content: ar } as never, locale: 'ar' })
  await ctx.payload.updateGlobal({ slug: 'landing', data: { content: en } as never, locale: 'en' })
  if (theme || images) {
    await ctx.payload.updateGlobal({
      slug: 'landing',
      data: {
        ...(theme ? { theme } : {}),
        ...(images
          ? {
              images: {
                logo: images.logoId ?? null,
                hero: images.heroId ?? null,
                heroDim: images.heroDim,
                ogImage: images.ogId ?? null,
              },
            }
          : {}),
      } as never,
    })
  }
  return { ok: true }
}
