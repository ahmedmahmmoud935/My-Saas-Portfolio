import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Uploads go through /api/upload-media now, not an action. The largest
      // action body left is a suggestion with its attachments (5 × 10 MB);
      // anything much bigger is a request no action here should have to read.
      bodySizeLimit: '60mb',
    },
  },
  /**
   * One address for the site. Both hosts answered with 200 and neither pointed
   * at the other, so every page existed twice as far as a search engine is
   * concerned and the ranking for it was split between the two. www is the
   * primary, so the bare domain sends people there permanently.
   *
   * Scoped to this domain by name: a client's own custom domain must not be
   * rewritten, and some of those may be www-only themselves.
   */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'viralpx.com' }],
        destination: 'https://www.viralpx.com/:path*',
        permanent: true,
      },
    ]
  },
  /**
   * A Link header on the homepage pointing at the one machine-readable
   * description this site actually has. `describedby` is a registered relation
   * (RFC 8288); llms.txt lists every portfolio on the install.
   */
  async headers() {
    return [
      /* The basics every page should carry. The dashboard frames its own
         pages for previews, so frames are allowed from the same site and no
         other — another site cannot dress up the login page and catch clicks.
         HSTS is sent on its own host only, never to subdomains it does not
         know about. */
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/',
        headers: [{ key: 'Link', value: '</llms.txt>; rel="describedby"; type="text/plain"' }],
      },
    ]
  },
  // No advert for the stack in every response.
  poweredByHeader: false,
  // Allow media served from R2 / the CDN in next/image.
  images: {
    remotePatterns: [
      // Filled from R2_PUBLIC_URL host at deploy time; add your CDN host here.
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
