import sanitizeHtml from 'sanitize-html'

/**
 * HTML a client wrote, made safe to put on a page.
 *
 * Articles, project descriptions and project text are stored as the HTML the
 * client typed or pasted, and were rendered as-is — so a client could put a
 * script on their own pages, and those pages are also served on the platform's
 * own address when previewed from the dashboard. Everything a page needs to
 * look the way it was written is kept: headings, lists, links, images, tables,
 * inline styles, classes, a <style> block, YouTube and Vimeo players. What is
 * removed is what runs: <script>, event handlers (onclick…), javascript: links,
 * frames from anywhere else, <object>/<embed>, forms.
 *
 * Run on the server, on the HTML a page is about to render — after any
 * un-escaping, never before it, or the un-escaping would bring back what this
 * took out.
 */

const LAYOUT = [
  'html', 'head', 'body', 'title', 'style',
  'section', 'article', 'header', 'footer', 'main', 'nav', 'aside', 'div', 'span',
  'figure', 'figcaption', 'picture', 'source', 'video', 'audio', 'track',
  'details', 'summary', 'mark', 'small', 'big', 'u', 's', 'del', 'ins', 'sup', 'sub',
  'center', 'font', 'hr', 'br', 'img', 'iframe', 'button', 'label',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]
const SVG = [
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask',
]

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...new Set([...sanitizeHtml.defaults.allowedTags, ...LAYOUT, ...SVG])],
  // <style> is text for the browser to style with, not code; the page builder
  // scopes it to its own block.
  allowVulnerableTags: true,
  allowedAttributes: {
    '*': ['class', 'style', 'id', 'dir', 'lang', 'title', 'align', 'role', 'aria-*', 'data-*', 'width', 'height'],
    a: ['href', 'target', 'rel', 'name'],
    img: ['src', 'srcset', 'sizes', 'alt', 'loading', 'decoding'],
    source: ['src', 'srcset', 'type', 'media', 'sizes'],
    video: ['src', 'poster', 'controls', 'autoplay', 'muted', 'loop', 'playsinline', 'preload'],
    audio: ['src', 'controls', 'loop', 'preload'],
    iframe: ['src', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
    ol: ['start', 'type', 'reversed'],
    font: ['color', 'face', 'size'],
    button: ['type'],
    svg: ['viewbox', 'viewBox', 'xmlns', 'fill', 'stroke', 'preserveaspectratio', 'preserveAspectRatio'],
    ...Object.fromEntries(
      ['g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'text', 'tspan', 'stop', 'lineargradient', 'radialgradient', 'clippath', 'mask'].map((t) => [
        t,
        ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke-opacity', 'transform', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'points', 'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradientUnits', 'clip-path', 'font-size', 'text-anchor'],
      ]),
    ),
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'], source: ['http', 'https'] },
  allowProtocolRelative: true,
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'www.google.com',
    'maps.google.com',
    'open.spotify.com',
    'w.soundcloud.com',
    'www.behance.net',
  ],
  // Keep attribute case: SVG reads viewBox, not viewbox.
  parser: { lowerCaseAttributeNames: false },
  // A link that opens elsewhere cannot reach back into this page.
  transformTags: {
    a: (tagName, attribs) =>
      attribs.target === '_blank' ? { tagName, attribs: { ...attribs, rel: 'noopener noreferrer' } } : { tagName, attribs },
  },
}

export function cleanHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, OPTIONS)
}
