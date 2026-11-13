import { pageBackground, dimOpacity } from '@/lib/background'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { liveWhere } from '@/lib/publish'
import type { StudioData } from '@/lib/studio-data'
import StudioHeader, { Monogram } from './StudioHeader'
import { Icon } from './icons'
import MotionFx from '@/components/portfolio/MotionFx'
import '@/app/(frontend)/studio.css'

/** The same navigation and surface on every client page. */
export default async function StudioShell({ d, langHref, base, children, hasArticles: knownArticles }: {
  d: StudioData
  langHref: string
  base: string
  children: React.ReactNode
  hasArticles?: boolean
}) {
  const ui = d.ui
  const isEn = d.lang === 'en'
  const hasArticles = knownArticles ?? (await (await getPayload({ config })).count({
    collection: 'articles',
    where: { and: [{ tenant: { equals: d.tenantId } }, liveWhere()] },
  })).totalDocs > 0
  /* Which sections are on the page: a link, a button or a card arrow only
     points at a section that is there. */
  const present = new Set<string>(
    [
      d.order.includes('hero') && 'hero',
      d.about && 'about',
      d.work && 'projects',
      d.digital && 'products',
      d.services && 'expertise',
      d.reviews && 'testimonials',
      d.team && 'team',
      d.clients?.logos.length && 'logos',
      d.clients && d.clients.stats.length > 0 && 'achievements',
      d.experience && 'experience',
      d.tools && 'tools',
      d.education && 'education',
      d.skills && 'skills',
      d.contact && 'contact',
    ].filter((x): x is string => !!x),
  )
  const hasContact = present.has('contact')
  const defaultLinks = [
    d.work && { id: 'projects', label: ui.nav.work },
    d.about && { id: 'about', label: ui.nav.about },
    d.services && { id: 'expertise', label: ui.nav.services },
    d.experience && { id: 'experience', label: ui.nav.experience },
    d.contact && { id: 'contact', label: ui.nav.contact },
  ].filter((l): l is { id: string; label: string } => !!l)
  // The bar editor's own links and labels, when the client has set them.
  const links = d.nav ? d.nav.filter((l) => present.has(l.id)) : defaultLinks

  return (
    <div id="top" className={`st-root st-portfolio st-lang-${d.lang}`} data-mobile-bar={d.mobileBar.length ? 'on' : undefined} style={d.vars as React.CSSProperties} dir={d.dir} lang={d.lang} {...d.attrs}>
      {(['light', 'dark'] as const).map((theme) => {
        const bg = d.background[theme]
        const look = pageBackground(bg)
        return <div key={theme} className={`st-page-bg st-bg-${theme}${look?.scrolls ? ' st-scrolls' : ''}`} aria-hidden="true">
          <div className={`st-page-paint${look?.animated ? ' st-animated' : ''}`} style={look?.style} />
          {bg?.type === 'image' && look && <span className="st-page-dim" style={{ opacity: dimOpacity(bg) }} />}
        </div>
      })}
      {/* A client site opens light unless the visitor chose dark. Saying so on
          <html> matters beyond studio's own rules: a project's own HTML design
          and the section backdrops read the attribute, and without it they
          fell back to their dark colours on a light page.
          eslint-disable-next-line react/no-danger */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(!localStorage.getItem('pf-theme'))document.documentElement.setAttribute('data-theme','light')}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`,
        }}
      />
      <a className="st-skip-link" href={base === '' && d.work ? '#projects' : '#main'}>
        {ui.seeWork}
      </a>
      <StudioHeader
        ui={ui}
        name={d.name}
        monogram={d.monogram}
        links={links}
        digital={!d.nav && !!d.digital}
        // A configured bar that leaves contact out drops the "let's talk" button too.
        contact={hasContact && (!d.nav || d.nav.some((l) => l.id === 'contact'))}
        langHref={langHref}
        isEn={isEn}
        ltr={d.dir === 'ltr'}
        base={base}
        articlesHref={hasArticles ? d.articlesHref : undefined}
      />

      <main id="main">{children}</main>

      <footer className="st-site-footer">
        <div className="st-shell">
          <div className="st-footer-main">
            <Monogram monogram={d.monogram} as="a" href="#top" />
            {d.footer && <p>{d.footer}</p>}
            <a href="#top">
              {ui.top}
              <Icon name="arrow-up-right" size={16} />
            </a>
          </div>
          <div className="st-footer-bottom">
            <span>
              © {new Date().getFullYear()} {d.name}
            </span>
          </div>
        </div>
      </footer>

      {/* The custom cursor, on every page: the root hides the native one. */}
      <MotionFx cursor={(d.attrs as Record<string, string>)['data-cursor']} />

      {d.mobileBar.length > 0 && (
        <>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
          <nav className="st-mobile-bar" aria-label={ui.navLabel}>
            {d.mobileBar.map((b, i) => <a key={i} href={b.href} data-pos={b.pos}>
              <i aria-hidden="true" className={/\s/.test(b.icon) ? b.icon : `${b.icon.replace(/^fa-/, '') === 'whatsapp' ? 'fa-brands' : 'fa-solid'} fa-${b.icon.replace(/^fa-/, '') || 'link'}`} />
              <span>{b.label}</span>
            </a>)}
          </nav>
        </>
      )}
      {d.call && (
        <a className="st-floating-call" href={d.call} aria-label={`${ui.call} ${d.name}`}>
          <Icon name="phone" size={20} />
        </a>
      )}
    </div>
  )
}
