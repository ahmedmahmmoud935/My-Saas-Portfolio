'use client'

import React from 'react'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'

/** A small translated header + message panel, for server pages that only need
 *  to show a notice (coming-soon fallback, access-restricted, …). */
export default function DashNotice({
  icon,
  titleAr,
  titleEn,
  subAr,
  subEn,
  bodyAr,
  bodyEn,
  bigIcon = false,
}: {
  icon: string
  titleAr: string
  titleEn: string
  subAr: string
  subEn: string
  bodyAr: string
  bodyEn: string
  bigIcon?: boolean
}) {
  const { t } = useDashLang()
  return (
    <div>
      <PageHeader icon={icon} title={t(titleAr, titleEn)} subtitle={t(subAr, subEn)} />
      <div className="panel" style={{ textAlign: 'center', padding: 60, color: 'var(--sub)' }}>
        {bigIcon && <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>}
        {t(bodyAr, bodyEn)}
      </div>
    </div>
  )
}
