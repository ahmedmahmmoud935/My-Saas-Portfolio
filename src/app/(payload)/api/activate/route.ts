import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// Set the client's password via a one-time link token OR an email + 6-digit
// code, then mark the account activated (which unlocks login).
export async function POST(req: Request) {
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
      const r = await payload.find({
        collection: 'users',
        where: { and: [{ email: { equals: email } }, { resetCode: { equals: String(code) } }] },
        limit: 1,
        overrideAccess: true,
      })
      user = r.docs[0] as never
    }

    if (!user) return Response.json({ ok: false, error: 'invalid' }, { status: 400 })
    const exp = user.resetExp
    if (!exp || exp < Date.now()) return Response.json({ ok: false, error: 'expired' }, { status: 400 })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password, activated: true, resetToken: null, resetCode: null, resetExp: null },
      overrideAccess: true,
    })
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[activate]', e)
    return Response.json({ ok: false, error: 'error' }, { status: 500 })
  }
}
