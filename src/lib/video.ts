// Client-safe: turn a video URL into an embeddable source.
export type Embed =
  | { kind: 'youtube'; src: string }
  | { kind: 'vimeo'; src: string }
  | { kind: 'file'; src: string }
  | null

export function toEmbed(url: string | null | undefined): Embed {
  if (!url) return null
  const u = url.trim()

  // Params trimmed for weight: the privacy hosts skip the tracking scripts,
  // and title/byline/portrait off drops Vimeo's own overlay (and the extra
  // avatar request that comes with it).
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt)
    return {
      kind: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&playsinline=1&rel=0&modestbranding=1`,
    }

  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm)
    return {
      kind: 'vimeo',
      src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&playsinline=1&dnt=1&title=0&byline=0&portrait=0`,
    }

  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u)) return { kind: 'file', src: u }

  // Fallback: assume a direct/embeddable URL.
  return { kind: 'file', src: u }
}

/**
 * Video *module* source. Unlike `toEmbed`, the module's single `embedUrl`
 * string can be a link, a full <iframe> embed code, OR a direct uploaded file
 * URL — this normalises all three. Unknown links are treated as an iframe
 * (not a <video> file) so generic embeds still render.
 */
export type ResolvedVideo = { kind: 'iframe' | 'file'; url: string }

export function resolveVideoUrl(input: string | null | undefined): ResolvedVideo | null {
  const s = (input ?? '').trim()
  if (!s) return null

  // Embed code (<iframe src="…">) → pull the src out.
  const srcMatch = s.match(/src=["']([^"']+)["']/i)
  const raw = (srcMatch ? srcMatch[1] : s).trim()

  // Direct/uploaded video file → play in a <video> tag.
  if (/\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test(raw)) return { kind: 'file', url: raw }

  const yt = raw.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/,
  )
  if (yt) return { kind: 'iframe', url: `https://www.youtube.com/embed/${yt[1]}` }

  const vm = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { kind: 'iframe', url: `https://player.vimeo.com/video/${vm[1]}` }

  // Already an embed URL (or something else) → iframe as-is.
  return { kind: 'iframe', url: raw }
}
