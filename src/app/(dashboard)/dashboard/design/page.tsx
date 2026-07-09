import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import DesignEditor from '@/components/dashboard/DesignEditor'
import { emptyDesign, type DesignForm } from '@/lib/design-types'

export default async function DesignPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)

  const d = emptyDesign()
  const s = settings as unknown as Record<string, Record<string, unknown>>
  const merge = <T extends object>(base: T, o: unknown): T =>
    o && typeof o === 'object' ? { ...base, ...(o as object) } : base

  const form: DesignForm = {
    colors: merge(d.colors, s.colors),
    background: merge(d.background, s.background),
    style: merge(d.style, s.style),
    components: merge(d.components, (s.themeConfig as Record<string, unknown>)?.components),
    heroCover: merge(d.heroCover, s.heroCover),
    heroCoverId:
      (s.brand?.heroCover && typeof s.brand.heroCover === 'object'
        ? (s.brand.heroCover as { id: number }).id
        : (s.brand?.heroCover as number)) ?? null,
    heroCoverUrl: mediaUrl((s.brand?.heroCover as never) ?? null, 'thumb'),
  }

  return <DesignEditor initial={form} />
}
