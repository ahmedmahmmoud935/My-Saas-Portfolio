import { getPayload } from 'payload'
import config from '@payload-config'
import { sendActivation } from '@/lib/activation'

export const dynamic = 'force-dynamic'

// Public "forgot password" trigger. Always responds 200 so it never reveals
// which emails are registered.
export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string }
    if (email) {
      const payload = await getPayload({ config })
      const res = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      })
      const u = res.docs[0]
      if (u) await sendActivation(payload, { id: u.id, email: u.email })
    }
  } catch (e) {
    console.error('[request-reset]', e)
  }
  return Response.json({ ok: true })
}
