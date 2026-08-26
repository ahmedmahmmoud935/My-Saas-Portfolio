import React from 'react'
import { mediaUrl, tenantCssVars } from '@/lib/portfolio'
import { pageBackground, dimOpacity } from '@/lib/background'
import { LEGACY_FONT_PAIRS } from '@/lib/design-types'
import type { SiteSetting } from '@/payload-types'

/**
 * The tenant's page surface: palette, fonts, direction, component styles, and
 * the background they chose in the Design tab.
 *
 * It exists because every page except the portfolio was drawing a plain
 * `var(--bg)` and nothing else — open a project and the gradient, image or
 * animated background the site is built on simply wasn't there, and neither
 * were the font, card and navbar choices. Each page rebuilding this by hand is
 * how they drifted apart in the first place.
 */
export default function PageShell({
  settings,
  locale,
  className = '',
  children,
}: {
  settings: SiteSetting | null
  locale: 'ar' | 'en'
  className?: string
  children: React.ReactNode
}) {
  const st = (settings?.style ?? {}) as Record<string, string | undefined>
  const comp = (settings?.themeConfig?.components ?? {}) as Record<string, string | undefined>

  // A tenant can pin a direction in the Design tab; otherwise it follows the
  // language being read.
  const dir: 'ltr' | 'rtl' =
    st.direction === 'ltr' ? 'ltr' : st.direction === 'rtl' ? 'rtl' : locale === 'en' ? 'ltr' : 'rtl'

  // Both themes' backgrounds are rendered; CSS shows whichever is active,
  // because the light/dark switch happens in the browser after this is sent.
  type RawBg = NonNullable<typeof settings>['background']
  const toBg = (b: RawBg) => (b ? { ...b, imageUrl: mediaUrl(b.image, 'card') } : null)
  const bgDark = pageBackground(toBg(settings?.background))
  const bgLight = pageBackground(toBg(settings?.backgroundLight))
  const isImage = (b: RawBg) => b?.type === 'image' && Boolean(b?.image)

  const pair = LEGACY_FONT_PAIRS[st.font || 'default']

  return (
    <div
      className={`pf-root ${className}`.trim()}
      style={tenantCssVars(settings) as React.CSSProperties}
      dir={dir}
      lang={locale}
      data-font-ar={st.fontAr || pair?.ar || 'tajawal'}
      data-font-latin={st.fontLatin || pair?.latin || 'montserrat'}
      data-anim={st.anim || 'fade-up'}
      data-cursor={st.cursor || 'default'}
      data-card={comp.card || 'solid'}
      data-navbar={comp.navbar || 'blur'}
      data-btn={comp.button || 'rounded'}
    >
      {bgDark && (
        <div
          className={`pf-bg-layer for-dark${bgDark.animated ? ' animated' : ''}${bgDark.scrolls ? ' scrolls' : ''}`}
          style={bgDark.style}
        >
          {isImage(settings?.background) && (
            <span className="pf-bg-dim" style={{ opacity: dimOpacity(settings?.background) }} />
          )}
        </div>
      )}
      {bgLight && (
        <div
          className={`pf-bg-layer for-light${bgLight.animated ? ' animated' : ''}${bgLight.scrolls ? ' scrolls' : ''}`}
          style={bgLight.style}
        >
          {isImage(settings?.backgroundLight) && (
            <span className="pf-bg-dim light" style={{ opacity: dimOpacity(settings?.backgroundLight) }} />
          )}
        </div>
      )}
      {children}
    </div>
  )
}
