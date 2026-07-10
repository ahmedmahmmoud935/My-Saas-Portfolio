'use client'

import React from 'react'
import PageHeader from './PageHeader'
import RangeSelector from './RangeSelector'
import NavIcon from './icons'
import { useDashLang } from './DashLang'

export type Row = { label: string; n: number }
export type AnalyticsData = {
  days: string
  total: number
  unique: number
  mobilePct: number
  countriesCount: number
  daily: { d: string; n: number }[]
  topProjects: Row[]
  countries: Row[]
  referrers: Row[]
  devices: { desktop: number; mobile: number; tablet: number }
}

function Stat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="counter">
      <div className="counter-info">
        <b>{value}</b>
        <span>{label}</span>
      </div>
      <span className="counter-ic">
        <NavIcon id={icon} size={20} />
      </span>
    </div>
  )
}

function Bars({ icon, title, rows, empty }: { icon: string; title: string; rows: Row[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <div className="panel">
      <div className="panel-title">
        <span>{title}</span>
        <NavIcon id={icon} size={16} />
      </div>
      {rows.length === 0 && <div style={{ color: 'var(--sub)', fontSize: 13 }}>{empty}</div>}
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ width: 26, textAlign: 'start', color: 'var(--sub)', fontSize: 12 }}>{r.n}</span>
          <div style={{ flex: 1, background: 'var(--bg-3)', borderRadius: 6, height: 10 }}>
            <div style={{ width: `${(r.n / max) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 6 }} />
          </div>
          <span
            style={{ fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            dir="auto"
          >
            {r.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsView(d: AnalyticsData) {
  const { t } = useDashLang()
  const dailyMax = Math.max(1, ...d.daily.map((x) => x.n))
  const empty = t('لا توجد بيانات.', 'No data.')

  // Translate the known "direct" referrer + device labels; other labels are data.
  const referrers = d.referrers.map((r) =>
    r.label === '__direct__' ? { ...r, label: t('مباشر', 'Direct') } : r,
  )
  const deviceRows: Row[] = [
    { label: t('ديسكتوب', 'Desktop'), n: d.devices.desktop },
    { label: t('موبايل', 'Mobile'), n: d.devices.mobile },
    { label: t('تابلت', 'Tablet'), n: d.devices.tablet },
  ]

  return (
    <div>
      <PageHeader
        icon="📊"
        title={t('إحصائيات الزوار', 'Visitor analytics')}
        subtitle={t('شاهد مين زار موقعك ومن أين', 'See who visited your site and from where')}
        actions={<RangeSelector current={d.days} />}
      />

      <div className="counter-grid" style={{ marginBottom: 18 }}>
        <Stat icon="eye" value={d.total} label={t('إجمالي الزيارات', 'Total visits')} />
        <Stat icon="users" value={d.unique} label={t('زائر فريد', 'Unique visitors')} />
        <Stat icon="phone" value={`${d.mobilePct}%`} label={t('من الموبايل', 'From mobile')} />
        <Stat icon="globe" value={d.countriesCount} label={t('دولة مختلفة', 'Countries')} />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-title">
          <span>{t('الزوار يومياً', 'Daily visitors')}</span>
          <NavIcon id="analytics" size={16} />
        </div>
        <div className="daily-chart">
          {d.daily.map((x) => (
            <div key={x.d} className="daily-bar" title={`${x.d}: ${x.n}`}>
              <span style={{ height: `${(x.n / dailyMax) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="daily-axis">
          <span>{d.daily[0]?.d.slice(5)}</span>
          <span>{d.daily[d.daily.length - 1]?.d.slice(5)}</span>
        </div>
      </div>

      <div className="grid-2">
        <Bars icon="achievements" title={t('أكثر المشاريع مشاهدة', 'Most-viewed projects')} rows={d.topProjects} empty={empty} />
        <Bars icon="globe" title={t('أعلى الدول زيارة', 'Top countries')} rows={d.countries} empty={empty} />
      </div>
      <div style={{ height: 16 }} />
      <div className="grid-2">
        <Bars icon="link" title={t('مصادر الزيارات', 'Traffic sources')} rows={referrers} empty={empty} />
        <Bars icon="monitor" title={t('الأجهزة', 'Devices')} rows={deviceRows} empty={empty} />
      </div>
    </div>
  )
}
