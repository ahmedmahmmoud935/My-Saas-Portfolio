import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard'
import AnalyticsView from '@/components/dashboard/AnalyticsView'

export const dynamic = 'force-dynamic'

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
    if (!v.referrer) return '__direct__' // translated in the view
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
  const daily = Array.from({ length: span }, (_, i) => {
    const dt = new Date(Date.now() - (span - 1 - i) * 86400000)
    const d = dt.toISOString().slice(0, 10)
    return { d, n: dayCounts.get(d) || 0 }
  })

  return (
    <AnalyticsView
      days={days}
      total={total}
      unique={unique}
      mobilePct={mobilePct}
      countriesCount={countries.length}
      daily={daily}
      topProjects={topProjects}
      countries={countries}
      referrers={referrers}
      devices={{ desktop: devices.desktop, mobile: devices.mobile, tablet: devices.tablet }}
    />
  )
}
