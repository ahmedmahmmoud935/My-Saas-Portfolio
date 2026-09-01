import { getPayload } from 'payload'
import config from '@payload-config'
const payload = await getPayload({ config })
// Fixtures created for this check only — the database had none before them.
const t = (await payload.find({ collection: 'tenants', where: { slug: { equals: 'devcheck' } }, limit: 1 })).docs[0]
if (t) await payload.delete({ collection: 'tenants', id: t.id })
const u = (await payload.find({ collection: 'users', where: { email: { equals: 'devcheck@localhost.test' } }, limit: 1 })).docs[0]
if (u) await payload.delete({ collection: 'users', id: u.id })
console.log('tenants:', (await payload.find({ collection: 'tenants', limit: 5 })).totalDocs,
            'users:', (await payload.find({ collection: 'users', limit: 5 })).totalDocs)
process.exit(0)
