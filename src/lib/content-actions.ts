'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { ContentForm } from './content-types'
import { writeContent } from './content-write'
import { refusalFrom, type SaveRefusal } from './action-error'

export async function saveContent(form: ContentForm): Promise<{ ok: true } | SaveRefusal> {
  const ctx = await getDashboardContext()
  if (!ctx) return { ok: false, code: 'unauthorized' }
  try {
    const settings = await getTenantSettings(ctx)
    await writeContent(ctx.payload, settings.id, form)
  } catch (e) {
    return refusalFrom(e)
  }
  return { ok: true }
}
