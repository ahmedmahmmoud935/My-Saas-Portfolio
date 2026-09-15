'use client'

import React, { useMemo, useState } from 'react'
import { useDashLang } from './DashLang'
import { analyse, type Status } from '@/lib/seo-analysis'

/**
 * The analysis panel: what a search engine will make of this piece, checked
 * while it is being written rather than after it is published.
 *
 * Everything is computed in the browser from the fields already on screen — no
 * request, no key, nothing to go stale — so it updates as you type.
 */
export default function SeoPanel({
  html,
  title,
  metaTitle,
  metaDescription,
  excerpt,
  slug,
  keyphrase,
  onKeyphrase,
}: {
  html: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  slug: string
  keyphrase: string
  onKeyphrase: (v: string) => void
}) {
  const { t } = useDashLang()
  /* The checks that pass are the ones you never need to read. They are kept a
     click away rather than printed in full, so the panel stays short enough to
     sit beside the article without a scrollbar of its own. */
  const [showPassing, setShowPassing] = useState(false)

  const result = useMemo(
    () => analyse({ html, title, metaTitle, metaDescription, excerpt, slug, keyphrase }),
    [html, title, metaTitle, metaDescription, excerpt, slug, keyphrase],
  )

  const order: Record<Status, number> = { bad: 0, warn: 1, good: 2 }
  const sorted = [...result.checks].sort((a, b) => order[a.status] - order[b.status])
  const counts = {
    bad: result.checks.filter((c) => c.status === 'bad').length,
    warn: result.checks.filter((c) => c.status === 'warn').length,
    good: result.checks.filter((c) => c.status === 'good').length,
  }

  // The band the score sits in, not the number — a number invites chasing 100.
  const band = result.score >= 80 ? 'good' : result.score >= 55 ? 'warn' : 'bad'

  return (
    <div className="de-group seo-panel" style={{ marginTop: 18 }}>
      <div className="de-group-title">{t('تحليل المحتوى', 'Content analysis')}</div>

      <label className="lbl">{t('الكلمة اللي عايز تترتّب عليها', 'The phrase you want to be found for')}</label>
      <input
        className="field"
        value={keyphrase}
        placeholder={t('مثلًا: تصميم هوية بصرية', 'e.g. brand identity design')}
        onChange={(e) => onKeyphrase(e.target.value)}
      />

      <div className={`seo-score ${band}`}>
        <div className="seo-score-num">{result.score}</div>
        <div className="seo-score-side">
          <div className="seo-score-bar">
            <span style={{ width: `${result.score}%` }} />
          </div>
          <div className="seo-score-meta">
            {result.words} {t('كلمة', 'words')}
            {counts.bad > 0 && ` · ${counts.bad} ${t('مشكلة', 'to fix')}`}
            {counts.warn > 0 && ` · ${counts.warn} ${t('ملاحظة', 'to look at')}`}
          </div>
        </div>
      </div>

      <ul className="seo-checks">
        {(showPassing ? sorted : sorted.filter((c) => c.status !== 'good')).map((c) => (
          <li key={c.id} className={c.status}>
            <span className="seo-dot" aria-hidden />
            <span>{t(c.ar, c.en)}</span>
          </li>
        ))}
      </ul>

      {counts.good > 0 && (
        <button type="button" className="seo-more" onClick={() => setShowPassing((v) => !v)}>
          {showPassing
            ? t('اخفي الناجح', 'Hide what passed')
            : `${counts.good} ${t('فحص عدّى ✓', 'checks passed ✓')}`}
        </button>
      )}
      {counts.bad === 0 && counts.warn === 0 && !showPassing && (
        <p className="seo-clear">{t('مفيش ملاحظات — المقال جاهز.', 'Nothing to fix — this one is ready.')}</p>
      )}
    </div>
  )
}
