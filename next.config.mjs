import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Media uploads go through a Server Action (uploadProjectMedia); the
      // default 1MB cap rejects normal design/photo files. Allow large images.
      bodySizeLimit: '25mb',
    },
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
