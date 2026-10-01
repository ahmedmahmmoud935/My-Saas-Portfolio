import { getPayload } from 'payload'
import config from '@payload-config'
import { MAX_CODE_ATTEMPTS } from '@/lib/activation'
import { allow, clientIp, tooMany } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Set the client's password via a one-time link token OR an email + 6-digit
// code, then mark the account activated (which unlocks login).
export async function POST(req: Request) {
  // Across every account at once: one address may not guess at many.
  if (!allow(`activate:${clientIp(req)}`, 10, 10 * 60 * 1000)) return tooMany()
  try {
    const { token, email, code, password } = (await req.json()) as {
      token?: string
      email?: string
      code?: string
      password?: string
    }
    if (!password || password.length < 8) {
      return Response.json({ ok: false, error: 'weak' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    let user:
      | { id: number | string; resetExp?: number | null }
      | undefined
    if (token) {
      const r = await payload.find({
        collection: 'users',
        where: { resetToken: { equals: token } },
        limit: 1,
        overrideAccess: true,
      })
      user = r.docs[0] as never
    } else if (email && code) {
      /* The account first, then the code — so a wrong guess can be counted
         against it. Five wrong guesses spend the code; the link in the email
         still works, and a new code can be asked for. */
      const r = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
        showHiddenFields: true,
      })
      const u = r.docs[0] as
        | { id: number; resetCode?: string | null; resetExp?: number | null; resetAttempts?: number | null }
        | undefined
      if (u?.resetCode && u.resetCode === String(code).trim()) {
        user = u
      } else if (u?.resetCode) {
        const attempts = (u.resetAttempts ?? 0) + 1
        await payload.update({
          collection: 'users',
          id: u.id,
          data: attempts >= MAX_CODE_ATTEMPTS ? { resetCode: null, resetAttempts: 0 } : { resetAttempts: attempts },
          overrideAccess: true,
        })
        if (attempts >= MAX_CODE_ATTEMPTS) {
          return Response.json({ ok: false, error: 'too-many' }, { status: 429 })
        }
      }
    }

    if (!user) return Response.json({ ok: false, error: 'invalid' }, { status: 400 })
    const exp = user.resetExp
    if (!exp || exp < Date.now()) return Response.json({ ok: false, error: 'expired' }, { status: 400 })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password, activated: true, resetToken: null, resetCode: null, resetExp: null, resetAttempts: 0 },
      overrideAccess: true,
    })
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[activate]', e)
    return Response.json({ ok: false, error: 'error' }, { status: 500 })
  }
}
