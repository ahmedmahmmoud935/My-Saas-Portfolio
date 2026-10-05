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
      /* Only the picture this page owns. Writing the whole brand group back,
         as read when the page loaded, put back an old logo or About picture
         that the Design page had changed in another tab. Fields not sent are
         left as they are. */
      brand: { avatar: form.avatarId },
    } as never,
  })
  return { ok: true }
}
