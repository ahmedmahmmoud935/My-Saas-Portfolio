import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow media served from R2 / the CDN in next/image.
  images: {
    remotePatterns: [
      // Filled from R2_PUBLIC_URL host at deploy time; add your CDN host here.
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
