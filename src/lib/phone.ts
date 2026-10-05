/**
 * Phone numbers as a visitor's phone needs them.
 *
 * People write their number the way they say it — "0558710190", "+971 55…",
 * "00971…". A call link can take the local form as it is; a WhatsApp link
 * cannot: wa.me needs the full international number, country code first, no
 * leading zero. Prefixing "+" to a local number (as the call button did) made
 * "+0558710190", which no phone can dial.
 */

const digitsOf = (v: string) => v.replace(/[^\d]/g, '')

/** "+971 55 871 0190" | "00971…" → "971558710190"; a local "055…" → null. */
export function waNumber(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return null
  let d = digitsOf(v)
  if (d.startsWith('00')) d = d.slice(2)
  else if (d.startsWith('0')) return null // local: the country is unknown
  return d.length >= 8 && d.length <= 15 ? d : null
}

/** A tel: target that dials: international when written so, local otherwise. */
export function telTarget(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return null
  const d = digitsOf(v)
  if (d.length < 5) return null
  if (v.startsWith('+')) return `+${d}`
  if (d.startsWith('00')) return `+${d.slice(2)}`
  // Eleven digits or more without a leading zero is a country code and a
  // number written without its "+" (971 55 …); dialled bare it would be local.
  if (d.length >= 11 && !d.startsWith('0')) return `+${d}`
  return d
}
