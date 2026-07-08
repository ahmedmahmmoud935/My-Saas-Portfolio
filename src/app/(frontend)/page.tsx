import { getPayload } from 'payload'
import config from '@payload-config'

// Touches the DB → render per-request (no build-time DB needed).
export const dynamic = 'force-dynamic'

/**
 * Phase 0 placeholder home. The real multi-tenant landing / portfolio routing
 * (host + /<username> resolution) arrives in Phase 2/4.
 */
export default async function HomePage() {
  const payload = await getPayload({ config })
  const { totalDocs: tenantCount } = await payload.count({ collection: 'tenants' })

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: '#0A0A0A',
        color: '#fff',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div>
        <h1 style={{ fontSize: 40, margin: 0, color: '#F97316' }}>ViralPX</h1>
        <p style={{ opacity: 0.7 }}>
          Phase 0 scaffold is running. Tenants in DB: {tenantCount}
        </p>
        <p>
          <a href="/admin" style={{ color: '#F97316' }}>
            Go to the dashboard → /admin
          </a>
        </p>
      </div>
    </main>
  )
}
