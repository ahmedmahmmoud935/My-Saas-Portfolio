import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext, getTenantSettings } from '@/lib/dashboard'
import { mediaUrl } from '@/lib/portfolio'
import SocialEditor from '@/components/dashboard/SocialEditor'

export default async function SocialPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const settings = await getTenantSettings(ctx)
  const s = (settings.social ?? {}) as Record<string, unknown>
  const brand = (settings.brand ?? {}) as Record<string, unknown>

  return (
    <SocialEditor
      initial={{
        whatsapp: (s.whatsapp as string) || '',
        behance: (s.behance as string) || '',
        instagram: (s.instagram as string) || '',
        linkedin: (s.linkedin as string) || '',
        facebook: (s.facebook as string) || '',
        vimeo: (s.vimeo as string) || '',
        visible: (s.visible as string[]) || ['whatsapp', 'behance', 'instagram', 'linkedin', 'vimeo'],
        avatarId:
          (brand.avatar && typeof brand.avatar === 'object'
            ? (brand.avatar as { id: number }).id
            : (brand.avatar as number)) ?? null,
      }}
      avatarUrl={mediaUrl((brand.avatar as never) ?? null, 'thumb')}
    />
  )
}
