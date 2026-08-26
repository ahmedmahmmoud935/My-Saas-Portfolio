import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Media uploads go through a Server Action (uploadProjectMedia); the
      // default 1MB cap rejects normal design files. 25mb turned away ordinary
      // phone video, which is the main thing people upload here — the server
      // compresses it after it lands, but it has to land first.
      bodySizeLimit: '150mb',
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
      {
        source: '/',
        headers: [{ key: 'Link', value: '</llms.txt>; rel="describedby"; type="text/plain"' }],
      },
    ]
  },
  // Allow media served from R2 / the CDN in next/image.
  images: {
    remotePatterns: [
      // Filled from R2_PUBLIC_URL host at deploy time; add your CDN host here.
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
