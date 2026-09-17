'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { ContentForm } from './content-types'
import { writeContent } from './content-write'

export async function saveContent(form: ContentForm) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)
  await writeContent(ctx.payload, settings.id, form)
  return { ok: true }
}
