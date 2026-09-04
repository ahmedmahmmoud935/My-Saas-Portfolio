'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import type { AuditResult, Severity } from '@/lib/seo-audit'

/**
 * The whole-site check, grouped by how much each finding matters.
 *
 * The list is filtered rather than paginated: a site with forty findings needs
 * to see the four that break something first, and a long list of suggestions
 * underneath is noise until those are done.
 */
export default function SeoAudit({
  result,
  siteHref,
  children,
}: {
  result: AuditResult
  siteHref: string
  /** The Google-tools panel, rendered above the findings. */
  children?: React.ReactNode
}) {
  const { t } = useDashLang()
  const [only, setOnly] = useState<Severity | 'all'>('all')

  const label: Record<Severity, { ar: string; en: string }> = {
    bad: { ar: 'لازم يتصلّح', en: 'Fix' },
    warn: { ar: 'يستاهل نظرة', en: 'Worth a look' },
    info: { ar: 'اقتراح', en: 'Suggestion' },
  }

  const shown = only === 'all' ? result.findings : result.findings.filter((f) => f.severity === only)
  const order: Record<Severity, number> = { bad: 0, warn: 1, info: 2 }
  const sorted = [...shown].sort((a, b) => order[a.severity] - order[b.severity])

  return (
    <div>
      <PageHeader
        icon="🔎"
        title={t('فحص الموقع', 'Site check')}
        subtitle={t(
          `فحص ${result.pages} صفحة منشورة — الحاجات اللي محرك البحث هيقف عندها.`,
          `${result.pages} published pages checked — what a search engine would object to.`,
        )}
        actions={
          <a className="btn btn-ghost" href={siteHref} target="_blank" rel="noreferrer">
            {t('افتح الموقع', 'Open site')}
          </a>
        }
      />

      {children}

      <div className="panel">
        <div className="audit-tabs">
          {(['all', 'bad', 'warn', 'info'] as const).map((k) => {
            const n = k === 'all' ? result.findings.length : result.counts[k]
            return (
              <button key={k} className={`pill ${only === k ? 'active' : ''}`} onClick={() => setOnly(k)}>
                {k === 'all' ? t('الكل', 'All') : t(label[k].ar, label[k].en)} ({n})
              </button>
            )
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>
          {result.findings.length === 0
            ? t('مفيش أي ملاحظة — الموقع نضيف.', 'Nothing to report — the site is clean.')
            : t('مفيش حاجة في القسم ده.', 'Nothing in this group.')}
        </div>
      ) : (
        <div className="panel">
          {sorted.map((f) => (
            <div className={`audit-row ${f.severity}`} key={f.id}>
              <span className="audit-dot" aria-hidden />
              <div className="audit-body">
                <div className="audit-msg">{t(f.ar, f.en)}</div>
                {f.page && <div className="audit-page">{f.page}</div>}
              </div>
              {f.href && (
                <a className="btn btn-ghost btn-sm" href={f.href}>
                  {t('افتح', 'Open')}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
