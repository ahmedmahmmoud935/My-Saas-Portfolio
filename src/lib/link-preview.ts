import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

/**
 * The picture a website offers for itself when its link is shared — its
 * og:image (or twitter:image) — read from the page at an address.
 *
 * Used for a product card with no picture uploaded: the live site already has
 * a picture made for exactly this. Fetched once, when the card is saved, not
 * on every visit.
 *
 * The address is typed by a client and fetched by our server, so only public
 * https sites are asked: no IP addresses, no local or private names, and the
 * name must not resolve to a private address either.
 */

const PRIVATE_V4 = [/^10\./, /^127\./, /^169\.254\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./]
const isPrivate = (ip: string) =>
  isIP(ip) === 6 ? /^(::1|f[cd]|fe80|::ffff:(10|127|192\.168|169\.254)\.)/i.test(ip) : PRIVATE_V4.some((r) => r.test(ip))

async function publicHttps(raw: string): Promise<URL | null> {
  let u: URL
  try {
    // A site typed as http:// is asked over https; nearly every site answers both.
    u = new URL(raw.trim().replace(/^http:\/\//i, 'https://'))
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || u.username || u.password) return null
  const host = u.hostname.toLowerCase()
  if (isIP(host) || !host.includes('.') || /\.(local|localhost|internal|test|lan)$/.test(host)) return null
  try {
    const addrs = await lookup(host, { all: true })
    if (!addrs.length || addrs.some((a) => isPrivate(a.address))) return null
  } catch {
    return null
  }
  return u
}

const meta = (html: string, key: string) => {
  // Attribute order varies: property/name first, or content first.
  const a = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, 'i').exec(html)
  const b = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, 'i').exec(html)
  return (a?.[1] || b?.[1] || '').trim()
}

export async function linkPreviewImage(address: string): Promise<string | null> {
  const page = await publicHttps(address)
  if (!page) return null
  try {
    const res = await fetch(page, {
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'ViralPX link preview', Accept: 'text/html' },
    })
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return null
    // The head is enough; a page that streams megabytes is cut off.
    const html = (await res.text()).slice(0, 300_000)
    const found = meta(html, 'og:image:secure_url') || meta(html, 'og:image') || meta(html, 'twitter:image')
    if (!found) return null
    const img = new URL(found.replace(/&amp;/g, '&'), res.url || page)
    return img.protocol === 'https:' ? img.toString() : null
  } catch {
    return null
  }
}
