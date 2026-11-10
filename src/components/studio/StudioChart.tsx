'use client'

import React, { useState } from 'react'
import { Icon } from './icons'

/**
 * The reference's demo dashboard: six bars, two months of sample data, and a
 * switch between them — the bars grow and shrink with the stylesheet's own
 * transition. The numbers are illustrative and say so.
 */
const MONTHS = [
  [28, 51, 39, 70, 58, 82],
  [42, 68, 53, 84, 72, 95],
]

export default function StudioChart({ title, isEn }: { title: string; isEn: boolean }) {
  const [m, setM] = useState(0)
  return (
    <div className="st-dashboard-preview">
      <div className="st-dashboard-title">
        <Icon name="layout-dashboard" size={21} />
        <strong>{title || (isEn ? 'Branch overview' : 'نظرة على الفروع')}</strong>
      </div>
      <div className="st-demo-switch" role="group" aria-label={isEn ? 'Demo period' : 'فترة البيانات التجريبية'}>
        {(isEn ? ['Month 1', 'Month 2'] : ['الشهر الأول', 'الشهر الثاني']).map((label, i) => (
          <button key={i} aria-pressed={m === i} onClick={() => setM(i)}>
            {label}
          </button>
        ))}
      </div>
      <div className="st-sample-chart" aria-label={isEn ? 'Illustrative comparison' : 'مقارنة توضيحية'}>
        {MONTHS[m].map((v, i) => (
          <div key={i}>
            <span>{v}</span>
            <i style={{ height: `${v}px` }} />
            <span>{i + 1}</span>
          </div>
        ))}
      </div>
      <p className="st-demo-caption">{isEn ? 'Sample data · try switching months' : 'بيانات تجريبية · جرّب تغيير الشهر'}</p>
    </div>
  )
}
