'use server'

import { getDashboardContext } from './dashboard'
import { LANDING_COPY } from './landing-copy'
import { mediaUrl } from './portfolio'
import type { SectionBgForm } from './design-types'

type Copy = (typeof LANDING_COPY)['ar']

/** Look + imagery, shared by both locales. */
export type LandingTheme = {
  accent: string
  bg: string
  bg2: string
  text: string
  subtext: string
  accentLight: string
  bgLight: string
  bg2Light: string
  textLight: string
  subtextLight: string
}
/** How the page draws its cards. */
export type LandingStyle = {
  /** portrait | plate | row | cover */
  showcase: string
  /** solid | outline | glass | elevated */
  card: string
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
  accentLight: '#F97316',
  bgLight: '#FFFFFF',
  bg2Light: '#F3F5F8',
  textLight: '#0C0F16',
  subtextLight: '#495265',
}


/** Saved colours, minus the blanks — a null column must not beat the default. */
function setOnly<T extends object>(o: unknown): Partial<T> {
  if (!o || typeof o !== 'object') return {}
  return Object.fromEntries(
    Object.entries(o as Record<string, unknown>).filter(([, v]) => v !== null && v !== ''),
  ) as Partial<T>
}

const DEFAULT_LANDING_STYLE: LandingStyle = { showcase: 'portrait', card: 'solid' }

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
  style: LandingStyle
  sectionBg: SectionBgForm[]
}> {
  const ctx = await ownerCtx()
  const g = (await ctx.payload.findGlobal({ slug: 'landing', locale: 'all', depth: 1 })) as {
    content?: { ar?: Partial<Copy>; en?: Partial<Copy> }
    theme?: Partial<LandingTheme>
    images?: Record<string, unknown>
    style?: Partial<LandingStyle>
    sectionBg?: Record<string, unknown>[]
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
    style: { ...DEFAULT_LANDING_STYLE, ...setOnly<LandingStyle>(g.style) },
    sectionBg: (g.sectionBg ?? []).map((r) => ({
      // `theme` is carried by the shared row shape but unused on both sides:
      // one backdrop serves light and dark, and only the veil over it changes.
      theme: 'dark',
      section: (r.section as string) || 'hero',
      mode: (r.mode as string) || 'color',
      color: (r.color as string) || '',
      imageId: rel(r.image),
      imageUrl: mediaUrl((r.image as never) ?? null, 'card'),
      videoUrl: (r.videoUrl as string) || '',
      fixed: Boolean(r.fixed),
      dim: (r.dim as number) ?? 45,
      posX: (r.posX as number) ?? 50,
      posY: (r.posY as number) ?? 50,
    })),
  }
}

/** Save both locales of the landing copy (owner only). */
export async function saveLanding(
  ar: Copy,
  en: Copy,
  theme?: LandingTheme,
  images?: LandingImages,
  sectionBg?: SectionBgForm[],
  style?: LandingStyle,
) {
  const ctx = await ownerCtx()
  // Locale-specific copy first, then the shared look in one non-localized pass.
  await ctx.payload.updateGlobal({ slug: 'landing', data: { content: ar } as never, locale: 'ar' })
  await ctx.payload.updateGlobal({ slug: 'landing', data: { content: en } as never, locale: 'en' })
  if (theme || images || sectionBg || style) {
    await ctx.payload.updateGlobal({
      slug: 'landing',
      data: {
        ...(theme ? { theme } : {}),
        ...(style ? { style } : {}),
        ...(sectionBg
          ? {
              sectionBg: sectionBg.map((r) => ({
                section: r.section,
                mode: r.mode,
                color: r.color || null,
                image: r.imageId ?? null,
                videoUrl: r.videoUrl || null,
                fixed: r.fixed,
                dim: r.dim,
                posX: r.posX,
                posY: r.posY,
              })),
            }
          : {}),
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
