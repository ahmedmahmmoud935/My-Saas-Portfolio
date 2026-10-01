/**
 * A link a client typed, safe to put in an href.
 *
 * `javascript:` in an href runs when a visitor clicks it — and the fields a
 * client fills (a client's website, a button in the phone bar) went straight
 * into one. Ordinary addresses pass untouched; a scheme that runs code or
 * reads local data becomes a link to nowhere. Browsers ignore whitespace and
 * control characters inside a scheme, so those are ignored here too.
 */
export function safeHref(value: string | null | undefined, fallback = '#'): string {
  const v = (value ?? '').trim()
  if (!v) return fallback
  const scheme = v.replace(/[\u0000-\u001f\u007f\s]+/g, '').toLowerCase()
  if (/^(javascript|vbscript|data|file):/.test(scheme)) return fallback
  return v
}
