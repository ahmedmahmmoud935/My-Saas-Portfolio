import React from 'react'
import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import PageHeader from '@/components/dashboard/PageHeader'
import RangeSelector from '@/components/dashboard/RangeSelector'
import NavIcon from '@/components/dashboard/icons'

export const dynamic = 'force-dynamic'

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

function Bars({
  icon,
  title,
  rows,
}: {
  icon: string
  title: string
  rows: { label: string; n: number }[]
}) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <div className="panel">
      <div className="panel-title">
        <span>{title}</span>
        <NavIcon id={icon} size={16} />
      </div>
      {rows.length === 0 && <div style={{ color: 'var(--sub)', fontSize: 13 }}>لا توجد بيانات.</div>}
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ width: 26, textAlign: 'start', color: 'var(--sub)', fontSize: 12 }}>{r.n}</span>
          <div style={{ flex: 1, background: 'var(--bg-3)', borderRadius: 6, height: 10 }}>
            <div style={{ width: `${(r.n / max) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 6 }} />
          </div>
          <span style={{ fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir="auto">{r.label}</span>
        </div>
      ))}
    </div>
  )
}

type Params = { searchParams: Promise<{ days?: string }> }

export default async function AnalyticsPage({ searchParams }: Params) {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/login')
  const { days = '30' } = await searchParams

  const where: Record<string, unknown> = { tenant: { equals: ctx.tenantId } }
  if (days !== 'all') {
    const cutoff = new Date(Date.now() - Number(days) * 86400000).toISOString()
    where.visitedAt = { greater_than_equal: cutoff }
  }

  const res = await ctx.payload.find({
    collection: 'visits',
    where: where as never,
    limit: 10000,
    depth: 1,
    sort: '-visitedAt',
  })
  const visits = res.docs

  const total = visits.length
  const unique = new Set(visits.map((v) => v.visitorId).filter(Boolean)).size
  const devices = { desktop: 0, mobile: 0, tablet: 0 } as Record<string, number>
  const countByLabel = (fn: (v: (typeof visits)[number]) => string | null | undefined) => {
    const m = new Map<string, number>()
    for (const v of visits) {
      const k = fn(v)
      if (k) m.set(k, (m.get(k) || 0) + 1)
    }
    return [...m.entries()].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n)
  }
  for (const v of visits) if (v.device) devices[v.device] = (devices[v.device] || 0) + 1
  const mobilePct = total ? Math.round((devices.mobile / total) * 100) : 0

  const topProjects = countByLabel((v) =>
    v.project && typeof v.project === 'object' ? v.project.title : null,
  ).slice(0, 6)
  const countries = countByLabel((v) => v.country).slice(0, 6)
  const referrers = countByLabel((v) => {
    if (!v.referrer) return 'مباشر'
    try {
      return new URL(v.referrer).hostname
    } catch {
      return v.referrer
    }
  }).slice(0, 6)

  // Daily visit buckets for the chart (cap at 60 bars).
  const dayCounts = new Map<string, number>()
  for (const v of visits) {
    const d = (v.visitedAt ?? '').slice(0, 10)
    if (d) dayCounts.set(d, (dayCounts.get(d) || 0) + 1)
  }
  const span = Math.min(days === 'all' ? 30 : Number(days) || 30, 60)
  const dailyDays = Array.from({ length: span }, (_, i) => {
    const dt = new Date(Date.now() - (span - 1 - i) * 86400000)
    return dt.toISOString().slice(0, 10)
  })
  const dailyMax = Math.max(1, ...dailyDays.map((d) => dayCounts.get(d) || 0))

  return (
    <div>
      <PageHeader
        icon="📊"
        title="إحصائيات الزوار"
        subtitle="شاهد مين زار موقعك ومن أين"
        actions={<RangeSelector current={days} />}
      />

      <div className="counter-grid" style={{ marginBottom: 18 }}>
        <Stat icon="eye" value={total} label="إجمالي الزيارات" />
        <Stat icon="users" value={unique} label="زائر فريد" />
        <Stat icon="phone" value={`${mobilePct}%`} label="من الموبايل" />
        <Stat icon="globe" value={countries.length} label="دولة مختلفة" />
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-title">
          <span>الزوار يومياً</span>
          <NavIcon id="analytics" size={16} />
        </div>
        <div className="daily-chart">
          {dailyDays.map((d) => (
            <div key={d} className="daily-bar" title={`${d}: ${dayCounts.get(d) || 0}`}>
              <span style={{ height: `${((dayCounts.get(d) || 0) / dailyMax) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="daily-axis">
          <span>{dailyDays[0]?.slice(5)}</span>
          <span>{dailyDays[dailyDays.length - 1]?.slice(5)}</span>
        </div>
      </div>

      <div className="grid-2">
        <Bars icon="achievements" title="أكثر المشاريع مشاهدة" rows={topProjects} />
        <Bars icon="globe" title="أعلى الدول زيارة" rows={countries} />
      </div>
      <div style={{ height: 16 }} />
      <div className="grid-2">
        <Bars icon="link" title="مصادر الزيارات" rows={referrers} />
        <Bars
          icon="monitor"
          title="الأجهزة"
          rows={[
            { label: 'ديسكتوب', n: devices.desktop },
            { label: 'موبايل', n: devices.mobile },
            { label: 'تابلت', n: devices.tablet },
          ]}
        />
      </div>
    </div>
  )
}
