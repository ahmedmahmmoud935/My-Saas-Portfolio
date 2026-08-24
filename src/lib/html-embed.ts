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

export type EmbeddedHtml = { html: string; css: string }

/** Split a pasted document into renderable markup + its stylesheet. */
export function splitHtmlDocument(raw: string): EmbeddedHtml {
  let src = recoverEscapedHtml(raw)
  const styles: string[] = []

  // Collect <style> blocks wherever they are, then drop them from the markup.
  src = src.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, css: string) => {
    styles.push(css)
    return ''
  })
  // Never carry scripts across — they don't run via innerHTML anyway, and
  // leaving them in only means dead code in the page source.
  src = src.replace(/<script[\s\S]*?<\/script>/gi, '')

  if (looksLikeDocument(src)) {
    src = src
      .replace(/<!doctype[^>]*>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?(html|head|body)[^>]*>/gi, '')
  }

  return { html: src.trim(), css: styles.join('\n').trim() }
}

/**
 * Confine a pasted stylesheet to one element using CSS nesting.
 *
 * `:root`, `html` and `body` selectors are rewritten to the wrapper itself —
 * otherwise the custom properties and page background the author relied on
 * would simply never match.
 */
export function scopeCss(css: string, scopeSelector: string): string {
  if (!css.trim()) return ''
  // @import has to stay at the top level of the stylesheet.
  const imports: string[] = []
  const body = css.replace(/@import[^;]+;/gi, (m) => {
    imports.push(m)
    return ''
  })

  // Rewrite whole-page selectors so they land on the wrapper.
  const rewritten = body.replace(
    /(^|[},])([^{}]*?)(?=\{)/g,
    (_m, lead: string, selector: string) => {
      if (/^\s*@/.test(selector)) return lead + selector // at-rules pass through
      const fixed = selector
        .split(',')
        .map((part) => {
          const s = part.trim()
          if (/^(:root|html|body)$/i.test(s)) return '&'
          return s.replace(/^(:root|html|body)\b/i, '&')
        })
        .join(', ')
      return lead + fixed
    },
  )

  return `${imports.join('\n')}\n${scopeSelector} {\n${rewritten}\n}`
}
