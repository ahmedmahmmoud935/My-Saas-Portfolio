'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'

export type MobileBtn = { pos: string; type: string; target: string; icon: string; label: string }
export type MobilebarForm = { enabled: boolean; buttons: MobileBtn[] }

export async function saveMobilebar(form: MobilebarForm) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    locale: 'ar',
    data: {
      mobileBar: {
        enabled: form.enabled,
        buttons: form.buttons.map((b) => ({
          pos: b.pos as never,
          type: b.type as never,
          target: b.target,
          icon: b.icon,
          label: b.label,
        })),
      },
    } as never,
  })
  return { ok: true }
}
