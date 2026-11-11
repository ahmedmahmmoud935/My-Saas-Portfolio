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
      d.clients && 'logos',
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
    <div id="top" className={`st-root st-portfolio st-lang-${d.lang}`} style={d.vars as React.CSSProperties} dir={d.dir} lang={d.lang} {...d.attrs}>
      <a className="st-skip-link" href={base === '' && d.work ? '#projects' : '#main'}>
        {ui.seeWork}
      </a>
      <StudioHeader
        ui={ui}
        name={d.name}
        monogram={d.monogram}
        links={links}
        digital={!d.nav && !!d.digital}
        contact={hasContact}
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

      {d.call && (
        <a className="st-floating-call" href={d.call} aria-label={`${ui.call} ${d.name}`}>
          <Icon name="phone" size={20} />
        </a>
      )}
    </div>
  )
}
