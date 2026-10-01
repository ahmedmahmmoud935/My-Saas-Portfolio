'use client'

import React, { useEffect, useRef, useState } from 'react'
import LandingPreview from './LandingPreview'
import ContentEditor from './ContentEditor'
import LogosManager from './LogosManager'
import AchievementsManager from './AchievementsManager'
import TestimonialsManager from './TestimonialsManager'
import TeamManager from './TeamManager'
import { useDashLang } from './DashLang'
import type { ContentForm } from '@/lib/content-types'

type HubTab = 'content' | 'clients' | 'achievements' | 'testimonials' | 'team'

const TABS: { id: HubTab; ar: string; en: string }[] = [
  { id: 'content', ar: 'النصوص', en: 'Texts' },
  { id: 'clients', ar: 'العملاء', en: 'Clients' },
  { id: 'achievements', ar: 'الإنجازات', en: 'Achievements' },
  { id: 'testimonials', ar: 'آراء العملاء', en: 'Testimonials' },
  { id: 'team', ar: 'الفريق', en: 'The team' },
]

/** Where each part sits on the portfolio, for the preview to scroll to. */
const TEXT_SPOT: Record<keyof ContentForm, string> = {
  hero: 'hero',
  about: 'about',
  expertise: 'expertise',
  experience: 'experience',
  education: 'education',
  skills: 'skills',
  tools: 'tools',
  projects: 'projects',
  clients: 'logos',
  testimonials: 'testimonials',
  contact: 'contact',
}
const TAB_SPOT: Record<Exclude<HubTab, 'content'>, string> = {
  clients: 'logos',
  achievements: 'achievements',
  testimonials: 'testimonials',
  team: 'team',
}

/**
 * One home for everything that fills the site's sections: the per-section
 * texts plus the client logos, achievements and testimonials collections.
 * Each sub-tab renders its existing manager (which keeps its own header/save).
 */
export default function ContentHub({
  content,
  logos,
  achievements,
  testimonials,
  team,
  slug,
}: {
  content: ContentForm
  logos: React.ComponentProps<typeof LogosManager>['logos']
  achievements: React.ComponentProps<typeof AchievementsManager>['items']
  testimonials: React.ComponentProps<typeof TestimonialsManager>['items']
  team: React.ComponentProps<typeof TeamManager>['items']
  /** The tenant's slug — the public review page lives at /testimonial/<slug>. */
  slug: string
}) {
  const [tab, setTab] = useState<HubTab>('content')
  const [textSec, setTextSec] = useState<keyof ContentForm>('hero')
  const [showPreview, setShowPreview] = useState(false)
  const [version, setVersion] = useState(0)
  const { t } = useDashLang()

  // Open beside the fields where there is room for both; on a smaller screen
  // it is one click away and opens over the page.
  useEffect(() => {
    if (window.innerWidth >= 1300) setShowPreview(true)
  }, [])

  /* The lists save item by item and then refresh the page's data, which
     arrives here as new props — that is the moment the site has changed. */
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setVersion((v) => v + 1)
  }, [logos, achievements, testimonials, team])

  const spot = tab === 'content' ? TEXT_SPOT[textSec] : TAB_SPOT[tab]

  return (
    <div>
      <div className="filter-tabs hub-tabs">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            className={`ftab ${tab === tb.id ? 'active' : ''}`}
            onClick={() => setTab(tb.id)}
          >
            {t(tb.ar, tb.en)}
          </button>
        ))}
        {!showPreview && (
          <button className="ftab hub-pv-open" onClick={() => setShowPreview(true)}>
            👁 {t('المعاينة', 'Preview')}
          </button>
        )}
      </div>

      <div className={`cx${showPreview ? ' cx-with-pv' : ''}`}>
        <div className="cx-main">
          {tab === 'content' && (
            <ContentEditor initial={content} onSaved={() => setVersion((v) => v + 1)} onSection={setTextSec} />
          )}
          {tab === 'clients' && <LogosManager logos={logos} />}
          {tab === 'achievements' && <AchievementsManager items={achievements} />}
          {tab === 'testimonials' && <TestimonialsManager items={testimonials} slug={slug} />}
          {tab === 'team' && <TeamManager items={team} />}
        </div>
        {showPreview && (
          <LandingPreview spot={spot} version={version} path={`/${slug}`} onClose={() => setShowPreview(false)} />
        )}
      </div>
    </div>
  )
}
