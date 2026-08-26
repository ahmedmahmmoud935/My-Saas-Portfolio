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
