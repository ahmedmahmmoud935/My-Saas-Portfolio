'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'

export type SocialForm = {
  whatsapp: string
  behance: string
  instagram: string
  linkedin: string
  facebook: string
  vimeo: string
  visible: string[]
  avatarId: number | null
}

export async function saveSocial(form: SocialForm) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)

  const b = (settings.brand ?? {}) as Record<string, unknown>
  const rel = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null))

  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    data: {
      social: {
        whatsapp: form.whatsapp,
        behance: form.behance,
        instagram: form.instagram,
        linkedin: form.linkedin,
        facebook: form.facebook,
        vimeo: form.vimeo,
        visible: form.visible as never,
      },
      brand: {
        photo: rel(b.photo),
        avatar: form.avatarId,
        heroCover: rel(b.heroCover),
        brandLogo: rel(b.brandLogo),
        favicon: rel(b.favicon),
        brandLogoScale: (b.brandLogoScale as number) ?? 1,
        brandLogoOffsetX: (b.brandLogoOffsetX as number) ?? 0,
        brandLogoOffsetY: (b.brandLogoOffsetY as number) ?? 0,
      },
    } as never,
  })
  return { ok: true }
}
