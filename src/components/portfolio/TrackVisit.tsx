'use client'

import { useEffect } from 'react'

// Fire-and-forget visit beacon (once per mount).
export default function TrackVisit({
  tenant,
  page,
  project,
}: {
  tenant: number
  page: string
  project?: number
}) {
  useEffect(() => {
    const body = JSON.stringify({ tenant, page, project })
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    } catch {
      /* ignore */
    }
  }, [tenant, page, project])
  return null
}
