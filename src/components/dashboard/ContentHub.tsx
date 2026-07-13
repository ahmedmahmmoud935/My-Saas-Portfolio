'use client'

import React, { useState } from 'react'
import ContentEditor from './ContentEditor'
import LogosManager from './LogosManager'
import AchievementsManager from './AchievementsManager'
import TestimonialsManager from './TestimonialsManager'
import { useDashLang } from './DashLang'
import type { ContentForm } from '@/lib/content-types'

type HubTab = 'content' | 'clients' | 'achievements' | 'testimonials'

const TABS: { id: HubTab; ar: string; en: string }[] = [
  { id: 'content', ar: 'النصوص', en: 'Texts' },
  { id: 'clients', ar: 'العملاء', en: 'Clients' },
  { id: 'achievements', ar: 'الإنجازات', en: 'Achievements' },
  { id: 'testimonials', ar: 'آراء العملاء', en: 'Testimonials' },
]

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
}: {
  content: ContentForm
  logos: React.ComponentProps<typeof LogosManager>['logos']
  achievements: React.ComponentProps<typeof AchievementsManager>['items']
  testimonials: React.ComponentProps<typeof TestimonialsManager>['items']
}) {
  const [tab, setTab] = useState<HubTab>('content')
  const { t } = useDashLang()

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
      </div>

      {tab === 'content' && <ContentEditor initial={content} />}
      {tab === 'clients' && <LogosManager logos={logos} />}
      {tab === 'achievements' && <AchievementsManager items={achievements} />}
      {tab === 'testimonials' && <TestimonialsManager items={testimonials} />}
    </div>
  )
}
