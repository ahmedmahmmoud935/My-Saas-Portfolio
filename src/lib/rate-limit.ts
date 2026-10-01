/**
 * A small limit on how often one visitor can use a public form.
 *
 * The public endpoints — a review, a contact message, a password reset — take
 * requests from anyone, and nothing stopped one script from sending thousands:
 * filling a client's inbox, their storage, or guessing at a reset code. Kept
 * in memory: the site runs as one process, and a limit that forgets on a
 * restart still turns thousands of tries into a handful.
 */

const hits = new Map<string, number[]>()
let lastSweep = 0

/** True when this key may go ahead; records the attempt when it may. */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  if (now - lastSweep > 10 * 60 * 1000) {
    lastSweep = now
    for (const [k, times] of hits) if (!times.some((t) => now - t < windowMs)) hits.delete(k)
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

/** The visitor's address as Cloudflare saw it, falling back to the proxy's. */
export function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export const tooMany = () =>
  Response.json({ ok: false, error: 'too-many' }, { status: 429, headers: { 'retry-after': '600' } })
