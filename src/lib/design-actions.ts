'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { BgForm, DesignForm } from './design-types'
import { refusalFrom, type SaveRefusal } from './action-error'

/** The values `style.font` is allowed to hold in the database. */
const LEGACY_FONT_IDS = new Set(['default', 'modern', 'editorial', 'elegant', 'bold'])

const toBg = (b: BgForm) => ({
  type: b.type,
  color1: b.color1,
  color2: b.color2,
  color3: b.color3,
  image: b.imageId ?? null,
  imageFixed: b.imageFixed,
  dim: b.dim,
})

/** Save the whole Design tab (all non-localized: colors, layouts, fonts, cover). */
export async function saveDesign(form: DesignForm): Promise<{ ok: true } | SaveRefusal> {
  const ctx = await getDashboardContext()
  if (!ctx) return { ok: false, code: 'unauthorized' }
  try {
    const settings = await getTenantSettings(ctx)

    await ctx.payload.update({
      collection: 'site-settings',
      id: settings.id,
      data: {
        colors: form.colors,
        // The editor carries the resolved image URL for previewing; only the id
        // belongs in the document.
        background: toBg(form.background),
        backgroundLight: toBg(form.backgroundLight),
        sectionBg: form.sectionBg
          .filter((s) => s.section)
          .map((s) => ({
            theme: s.theme || 'dark',
            section: s.section,
            mode: s.mode,
            color: s.color,
            colorLight: s.colorLight || null,
            image: s.imageId ?? null,
            videoUrl: s.videoUrl,
            fixed: s.fixed,
            dim: s.dim,
            posX: s.posX,
            posY: s.posY,
          })),
        // `style.font` is a select whose options once drifted from the editor's
        // list; an unknown value made Payload reject the entire save. Only ever
        // send a value the schema knows, and let the two new fields carry the
        // real choice.
        style: {
          ...form.style,
          font: LEGACY_FONT_IDS.has(form.style.font) ? form.style.font : 'default',
        },
        themeConfig: { components: form.components },
        aboutPhoto: {
          size: form.aboutPhoto.size === 'contain' ? 'contain' : 'cover',
          posX: form.aboutPhoto.posX,
          posY: form.aboutPhoto.posY,
        },
        heroCover: {
          size: form.heroCover.size,
          posX: form.heroCover.posX,
          posY: form.heroCover.posY,
          overlay: form.heroCover.overlay,
          overlayLight: form.heroCover.overlayLight,
          height: form.heroCover.height,
          titleScale: form.heroCover.titleScale,
          descScale: form.heroCover.descScale,
          align: form.heroCover.align,
          valign: form.heroCover.valign,
          gradient: form.heroCover.gradient,
          gradientDark: form.heroCover.gradientDark || null,
        },
        // Only the pictures this page owns; the rest of the group is left as
        // it is, so a save here cannot undo a change made on another page.
        brand: {
          photo: form.aboutPhotoId,
          brandLogo: form.brandLogoId,
          heroCover: form.heroCoverId,
        },
      } as never,
    })
  } catch (e) {
    return refusalFrom(e)
  }
  return { ok: true }
}
