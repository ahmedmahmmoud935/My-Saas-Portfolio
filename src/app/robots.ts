import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/api'] },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  }
}
