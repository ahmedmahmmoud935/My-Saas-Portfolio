import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Tenants } from './collections/Tenants'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Articles } from './collections/Articles'
import { Logos } from './collections/Logos'
import { Testimonials } from './collections/Testimonials'
import { Achievements } from './collections/Achievements'
import { Visits } from './collections/Visits'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Only enable R2 when its env vars are present; otherwise media falls back to
// local disk so the admin can boot without cloud storage configured.
const hasR2 = Boolean(
  process.env.R2_BUCKET && process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID,
)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— ViralPX',
    },
  },
  collections: [
    Users,
    Tenants,
    Media,
    Projects,
    Articles,
    Logos,
    Testimonials,
    Achievements,
    Visits,
    SiteSettings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),
  // Bilingual everywhere: Arabic (RTL) + English. Default to Arabic.
  localization: {
    locales: [
      { label: 'العربية', code: 'ar', rtl: true },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'ar',
    fallback: true,
  },
  sharp,
  plugins: [
    // Tenant isolation. More collections (projects, articles, logos,
    // testimonials, achievements, visits, site-settings) get added here in Phase 1.
    multiTenantPlugin({
      collections: {
        media: {},
        projects: {},
        articles: {},
        logos: {},
        testimonials: {},
        achievements: {},
        visits: {},
        // One settings document per tenant (behaves like a global).
        'site-settings': { isGlobal: true },
      },
      tenantsSlug: 'tenants',
      // Owners can operate across every tenant.
      userHasAccessToAllTenants: (user) => Boolean(user?.isOwner),
    }),
    ...(hasR2
      ? [
          s3Storage({
            collections: {
              media: { prefix: 'media' },
            },
            bucket: process.env.R2_BUCKET as string,
            config: {
              endpoint: process.env.R2_ENDPOINT,
              region: 'auto',
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
              },
            },
          }),
        ]
      : []),
  ],
})
