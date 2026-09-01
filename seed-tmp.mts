import { getPayload } from 'payload'
import config from '@payload-config'
const payload = await getPayload({ config })
const u = await payload.find({ collection: 'users', where: { email: { equals: 'devcheck@localhost.test' } }, limit: 1 })
if (!u.docs[0]) await payload.create({ collection: 'users', data: { email: 'devcheck@localhost.test', password: 'devcheck-local-1', isOwner: true, name: 'Dev Check' } as never })
let t = (await payload.find({ collection: 'tenants', where: { slug: { equals: 'devcheck' } }, limit: 1 })).docs[0]
if (!t) t = await payload.create({ collection: 'tenants', data: { name: 'Ahmed Mahmoud', slug: 'devcheck' } as never }) as never
const st = await payload.find({ collection: 'site-settings', where: { tenant: { equals: (t as any).id } }, limit: 1 })
const data = {
  tenant: (t as any).id,
  style: { hero: 'panel' },
  content: { hero: {
    name: 'Your next big\nidea starts here',
    title: 'MULTIMEDIA DESIGNER',
    desc: 'The ideal framework to learn how to manage all aspects of startup.',
    btn1: 'Start for free', btn2: 'Get in touch',
  } },
} as never
if (st.docs[0]) await payload.update({ collection: 'site-settings', id: st.docs[0].id, data })
else await payload.create({ collection: 'site-settings', data })
console.log('SEEDED')
process.exit(0)
