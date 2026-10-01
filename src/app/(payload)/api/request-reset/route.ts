import { getPayload } from 'payload'
import config from '@payload-config'
import { RESEND_GAP_MS, issuedAt, sendActivation } from '@/lib/activation'
import { allow, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Public "forgot password" trigger. Always responds 200 so it never reveals
// which emails are registered.
export async function POST(req: Request) {
  // Still answers 200 when limited, so it never says which emails exist.
  if (!allow(`reset:${clientIp(req)}`, 5, 10 * 60 * 1000)) return Response.json({ ok: true })
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
      const u = res.docs[0] as { id: number; email: string; resetExp?: number | null } | undefined
      /* One code a minute per account: each request emails the person, and
         each fresh code would otherwise hand a guesser five new tries. */
      const last = issuedAt(u?.resetExp)
      if (u && !(last && Date.now() - last < RESEND_GAP_MS)) {
        await sendActivation(payload, { id: u.id, email: u.email })
      }
    }
  } catch (e) {
    console.error('[request-reset]', e)
  }
  return Response.json({ ok: true })
}
