'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function RangeSelector({ current }: { current: string }) {
  const router = useRouter()
  const opts = [
    { v: '7', label: 'آخر 7 أيام' },
    { v: '30', label: 'آخر 30 يوم' },
    { v: 'all', label: 'الكل' },
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
