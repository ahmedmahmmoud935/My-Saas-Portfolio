/**
 * Support for pasting a whole HTML page into a text element.
 *
 * People write a case study as a standalone HTML file (styles and all) and
 * paste it in. Dropped into the page as-is that would mean a <head> inside a
 * <div> and a stylesheet loose on the site, so this pulls the document apart:
 * markup on one side, CSS on the other, and the CSS gets scoped to the element
 * so it can't reach the rest of the page.
 */

/** Looks like markup rather than prose. */
export const looksLikeHtml = (s: string) => /<\/?[a-z][a-z0-9-]*(\s[^<>]*)?>/i.test(s)

/** Looks like a full document rather than a fragment. */
export const looksLikeDocument = (s: string) => /<!doctype\s+html|<html[\s>]|<body[\s>]/i.test(s)

const decodeEntities = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

/**
 * Markup that was pasted into the visual editor arrives escaped — the browser
 * stored it as text, so the page would print `<!doctype html>` instead of
 * rendering it. Recover it rather than making people paste again.
 */
export function recoverEscapedHtml(value: string): string {
  const hasRealTags = looksLikeHtml(value)
  const hasEscapedMarkup = /&lt;\s*\/?\s*(!doctype|html|head|body|style|div|section|h[1-6]|p|span|img)\b/i.test(value)
  if (hasEscapedMarkup && !hasRealTags) return decodeEntities(value)
  // Mixed: the visual editor wraps escaped text in <div>/<br>. Strip those
  // wrappers, then decode what's left.
  if (hasEscapedMarkup) {
    const stripped = value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(div|p)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
    return decodeEntities(stripped)
  }
  return value
}

/**
 * Worth rendering as a page of its own rather than as rich text: a whole
 * document, or a fragment that carries its own <style>.
 */
export const isEmbeddablePage = (s: string) => {
  const v = recoverEscapedHtml(s)
  return looksLikeDocument(v) || /<style[\s>]/i.test(v)
}

export type EmbeddedHtml = {
  html: string
  css: string
  /** The document's own `dir`, if it declared one. */
  dir?: 'rtl' | 'ltr'
}

/** Split a pasted document into renderable markup + its stylesheet. */
export function splitHtmlDocument(raw: string): EmbeddedHtml {
  let src = recoverEscapedHtml(raw)
  const styles: string[] = []

  // A linked stylesheet (a web font, usually) lives in the <head> that gets
  // dropped below — carry it over as an @import so the type still loads.
  src.replace(/<link\b[^>]*>/gi, (tag: string) => {
    if (!/rel\s*=\s*['"]?stylesheet/i.test(tag)) return tag
    const href = tag.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    const url = href && (href[1] || href[2] || href[3])
    if (url && /^https?:\/\//i.test(url)) styles.push(`@import url('${url}');`)
    return tag
  })

  // Collect <style> blocks wherever they are, then drop them from the markup.
  src = src.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, css: string) => {
    styles.push(css)
    return ''
  })
  // The markup keeps no <link> tags: a stylesheet reference inside a <div> is
  // valid but pointless once its @import is hoisted, and the rest are icons.
  src = src.replace(/<link\b[^>]*>/gi, '')
  // Never carry scripts across — they don't run via innerHTML anyway, and
  // leaving them in only means dead code in the page source.
  src = src.replace(/<script[\s\S]*?<\/script>/gi, '')

  // The document's own writing direction, before the tag carrying it is
  // dropped. An Arabic page pasted into a site being read in English would
  // otherwise inherit the site's `ltr` and lay itself out backwards.
  let dir: 'rtl' | 'ltr' | undefined
  const dirTag = src.match(/<(?:html|body)\b[^>]*\bdir\s*=\s*(?:"|')?(rtl|ltr)/i)
  if (dirTag) dir = dirTag[1].toLowerCase() as 'rtl' | 'ltr'

  if (looksLikeDocument(src)) {
    src = src
      .replace(/<!doctype[^>]*>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?(html|head|body)[^>]*>/gi, '')
  }

  return { html: src.trim(), css: styles.join('\n').trim(), dir }
}

/* ── CSS scoping ──────────────────────────────────────────────────────
 *
 * A pasted page brings its own stylesheet. It has to be confined to the one
 * element that holds the page, or it would restyle the whole site.
 *
 * This walks the stylesheet rule by rule instead of running a regex over it.
 * The regex version broke on the first `;` inside `@import url(...&wght@400;500)`
 * — a Google-Fonts import, i.e. the most common first line there is — which
 * cut the import in half and took the entire stylesheet down with it.
 */

const skipString = (s: string, i: number) => {
  const quote = s[i]
  i += 1
  while (i < s.length) {
    if (s[i] === '\\') i += 2
    else if (s[i] === quote) return i + 1
    else i += 1
  }
  return i
}

const skipComment = (s: string, i: number) => {
  const end = s.indexOf('*/', i + 2)
  return end === -1 ? s.length : end + 2
}

/** Index of the `}` closing the `{` at `start`, ignoring braces in strings. */
function closingBrace(s: string, start: number): number {
  let depth = 0
  let i = start
  while (i < s.length) {
    const c = s[i]
    if (c === '"' || c === "'") {
      i = skipString(s, i)
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      i = skipComment(s, i)
      continue
    }
    if (c === '{') depth += 1
    else if (c === '}') {
      depth -= 1
      if (depth === 0) return i
    }
    i += 1
  }
  return -1
}

/** At-rules whose body is more rules, so the scoping has to go inside them. */
const NESTS_RULES = /^@(media|supports|layer|container|scope|document)\b/i
/** At-rules to copy through untouched (their "selectors" aren't selectors). */
const STATEMENT_AT = /^@(import|charset|namespace)\b/i

/**
 * Rename the pasted page's own classes and ids.
 *
 * Scoping stops the pasted CSS getting OUT. It does nothing about the site's
 * CSS getting IN: this site styles `.hero`, `.section` and `.eyebrow`, and a
 * pasted case study uses exactly those names. `.hero { display:flex;
 * min-height:82vh }` from the portfolio turned the pasted hero into a row two
 * thirds of a screen tall — the author's own rules never mentioned display or
 * height, so there was nothing to override it with. Renaming both sides makes
 * the collision impossible instead of fighting it with specificity.
 */
export function prefixSelectorNames(sel: string, prefix: string): string {
  if (!prefix) return sel
  // Attribute selectors may quote text containing dots — step over them whole.
  return sel.replace(/\[[^\]]*\]|([.#])(-?[_a-zA-Z][\w-]*)/g, (m, sym: string, name: string) =>
    sym ? `${sym}${prefix}-${name}` : m,
  )
}

/** The markup half of the rename: class, id, and same-page anchor targets. */
export function prefixHtmlClasses(html: string, prefix: string): string {
  if (!prefix) return html
  const attr = /(\s(?:class|id|href)\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi
  return html.replace(attr, (m, lead: string, dq?: string, sq?: string) => {
    const value = (dq ?? sq ?? '').trim()
    const name = lead.trim().slice(0, -1).trim().toLowerCase()
    if (name === 'class') {
      if (!value) return m
      return `${lead}"${value.split(/\s+/).map((c) => `${prefix}-${c}`).join(' ')}"`
    }
    if (name === 'id') return value ? `${lead}"${prefix}-${value}"` : m
    // href: only in-page anchors, never a real link.
    return value.startsWith('#') && value.length > 1 ? `${lead}"#${prefix}-${value.slice(1)}"` : m
  })
}

/** Point every selector in a list at the wrapper. */
function scopeSelectorList(list: string, scope: string, prefix: string): string {
  return list
    .split(',')
    .map((raw) => {
      const sel = prefixSelectorNames(raw.trim(), prefix)
      if (!sel) return ''
      // The author's page-level selectors describe the wrapper now — without
      // this the custom properties they set on :root would never apply.
      if (/^(:root|html|body)$/i.test(sel)) return scope
      const page = sel.match(/^(?::root|html|body)\b([\s\S]*)$/i)
      if (page) {
        const rest = page[1].trim()
        if (!rest) return scope
        // `html.dark` / `body[data-x]` qualify the wrapper itself.
        return /^[.#[:]/.test(rest) ? `${scope}${rest}` : `${scope} ${rest}`
      }
      if (sel.startsWith('&')) return scope + sel.slice(1)
      return `${scope} ${sel}`
    })
    .filter(Boolean)
    .join(', ')
}

function walkRules(css: string, scope: string, imports: string[], prefix: string): string {
  let out = ''
  let prelude = ''
  let i = 0

  while (i < css.length) {
    const c = css[i]
    if (c === '"' || c === "'") {
      const end = skipString(css, i)
      prelude += css.slice(i, end)
      i = end
      continue
    }
    if (c === '/' && css[i + 1] === '*') {
      i = skipComment(css, i)
      continue
    }
    if (c === ';') {
      const stmt = prelude.trim()
      // @import has to sit at the top of the sheet, so it gets hoisted out.
      if (/^@import\b/i.test(stmt)) imports.push(`${stmt};`)
      // @charset/@namespace and stray declarations are dropped.
      prelude = ''
      i += 1
      continue
    }
    if (c === '{') {
      const end = closingBrace(css, i)
      const body = css.slice(i + 1, end === -1 ? css.length : end)
      const head = prelude.trim()

      if (head.startsWith('@')) {
        if (NESTS_RULES.test(head)) out += `${head}{${walkRules(body, scope, imports, prefix)}}`
        else if (!STATEMENT_AT.test(head)) out += `${head}{${body}}` // keyframes, font-face…
      } else if (head) {
        out += `${scopeSelectorList(head, scope, prefix)}{${body}}`
      }

      prelude = ''
      i = end === -1 ? css.length : end + 1
      continue
    }
    prelude += c
    i += 1
  }

  return out
}

/**
 * Confine a pasted stylesheet to one element.
 *
 * `:root`, `html` and `body` rules are re-pointed at the wrapper — otherwise
 * the custom properties and page background the author relied on would simply
 * never match.
 */
export function scopeCss(css: string, scopeSelector: string, classPrefix = ''): string {
  if (!css.trim()) return ''
  const imports: string[] = []
  const body = walkRules(css, scopeSelector, imports, classPrefix)
  const hoisted = [...new Set(imports)]
  return hoisted.length ? `${hoisted.join('\n')}\n${body}` : body
}
