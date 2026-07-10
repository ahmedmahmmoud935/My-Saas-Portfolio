'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useDashLang } from './DashLang'

export default function RangeSelector({ current }: { current: string }) {
  const router = useRouter()
  const { t } = useDashLang()
  const opts = [
    { v: '7', label: t('آخر 7 أيام', 'Last 7 days') },
    { v: '30', label: t('آخر 30 يوم', 'Last 30 days') },
    { v: 'all', label: t('الكل', 'All') },
  ]
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {opts.map((o) => (
        <button
          key={o.v}
          className={`pill ${current === o.v ? 'active' : ''}`}
          onClick={() => router.push(`/dashboard/analytics?days=${o.v}`)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
