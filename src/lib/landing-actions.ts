'use server'

import { getDashboardContext } from './dashboard'
import { LANDING_COPY } from './landing-copy'

type Copy = (typeof LANDING_COPY)['ar']

async function ownerCtx() {
  const ctx = await getDashboardContext()
  if (!ctx || !ctx.user.isOwner) throw new Error('forbidden')
  return ctx
}

/** Current landing copy for both locales (saved values merged over defaults). */
export async function getLandingForm(): Promise<{ ar: Copy; en: Copy }> {
  const ctx = await ownerCtx()
  const g = (await ctx.payload.findGlobal({ slug: 'landing', locale: 'all', depth: 0 })) as {
    content?: { ar?: Partial<Copy>; en?: Partial<Copy> }
  }
  return {
    ar: { ...LANDING_COPY.ar, ...(g.content?.ar ?? {}) },
    en: { ...LANDING_COPY.en, ...(g.content?.en ?? {}) },
  }
}

/** Save both locales of the landing copy (owner only). */
export async function saveLanding(ar: Copy, en: Copy) {
  const ctx = await ownerCtx()
  await ctx.payload.updateGlobal({ slug: 'landing', data: { content: ar } as never, locale: 'ar' })
  await ctx.payload.updateGlobal({ slug: 'landing', data: { content: en } as never, locale: 'en' })
  return { ok: true }
}
