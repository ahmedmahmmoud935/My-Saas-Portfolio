'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'

/** Save the tenant's design + reel categories. */
export async function saveCategories(image: string[], video: string[]) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    data: {
      categories: {
        image: image.filter(Boolean).map((name) => ({ name })),
        video: video.filter(Boolean).map((name) => ({ name })),
      },
    },
  })
  return { ok: true }
}

/** Save section order + visibility (non-localized). */
export async function saveSections(
  items: { sectionId: string; visible: boolean }[],
) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    data: {
      sections: items.map((s, i) => ({
        sectionId: s.sectionId as never,
        visible: s.visible,
        order: i,
      })),
    },
  })
  return { ok: true }
}

/** Save navbar links with bilingual labels (two-pass: ar then en, matched by index). */
export async function saveNavbar(
  items: { linkId: string; labelAr: string; labelEn: string; visible: boolean }[],
) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)

  // Pass 1 — write structure + Arabic labels.
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    locale: 'ar',
    data: {
      navbarLinks: items.map((it) => ({
        linkId: it.linkId,
        visible: it.visible,
        label: it.labelAr,
      })),
    },
  })

  // Re-read to get the generated row ids (order preserved).
  const fresh = await ctx.payload.findByID({
    collection: 'site-settings',
    id: settings.id,
    locale: 'ar',
    depth: 0,
  })
  const rows = fresh.navbarLinks ?? []

  // Pass 2 — write English labels onto the same rows.
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    locale: 'en',
    data: {
      navbarLinks: rows.map((r, i) => ({
        id: r.id ?? undefined,
        linkId: items[i]?.linkId ?? r.linkId,
        visible: items[i]?.visible ?? r.visible,
        label: items[i]?.labelEn ?? '',
      })),
    },
  })
  return { ok: true }
}
