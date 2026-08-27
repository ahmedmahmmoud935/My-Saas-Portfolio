import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import DesignEditor from '@/components/dashboard/DesignEditor'
import { emptyDesign, type BgForm, type DesignForm } from '@/lib/design-types'

export default async function DesignPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)

  const d = emptyDesign()
  const s = settings as unknown as Record<string, Record<string, unknown>>
  const merge = <T extends object>(base: T, o: unknown): T =>
    o && typeof o === 'object' ? { ...base, ...(o as object) } : base

  const relId = (v: unknown): number | null =>
    v && typeof v === 'object' ? ((v as { id?: number }).id ?? null) : ((v as number) ?? null)

  // The stored group holds an `image` relation; the editor wants id + preview url.
  const readBg = (base: BgForm, o: unknown): BgForm => {
    const r = (o ?? {}) as Record<string, unknown>
    return {
      ...merge(base, o),
      imageId: relId(r.image),
      imageUrl: mediaUrl((r.image as never) ?? null, 'card'),
    }
  }

  const form: DesignForm = {
    colors: merge(d.colors, s.colors),
    background: readBg(d.background, s.background),
    backgroundLight: readBg(d.backgroundLight, s.backgroundLight),
    sectionBg: ((s.sectionBg as unknown as Record<string, unknown>[]) ?? []).map((r) => ({
      theme: String(r.theme ?? 'dark'),
      section: String(r.section ?? 'about'),
      mode: String(r.mode ?? 'color'),
      color: String(r.color ?? ''),
      imageId: relId(r.image),
      imageUrl: mediaUrl((r.image as never) ?? null, 'thumb'),
      videoUrl: String(r.videoUrl ?? ''),
      fixed: Boolean(r.fixed),
      dim: (r.dim as number) ?? 45,
    })),
    style: merge(d.style, s.style),
    components: merge(d.components, (s.themeConfig as Record<string, unknown>)?.components),
    heroCover: merge(d.heroCover, s.heroCover),
    heroCoverId:
      (s.brand?.heroCover && typeof s.brand.heroCover === 'object'
        ? (s.brand.heroCover as { id: number }).id
        : (s.brand?.heroCover as number)) ?? null,
    heroCoverUrl: mediaUrl((s.brand?.heroCover as never) ?? null, 'thumb'),
    brandLogoId:
      (s.brand?.brandLogo && typeof s.brand.brandLogo === 'object'
        ? (s.brand.brandLogo as { id: number }).id
        : (s.brand?.brandLogo as number)) ?? null,
    brandLogoUrl: mediaUrl((s.brand?.brandLogo as never) ?? null, 'thumb'),
  }

  return <DesignEditor initial={form} />
}
