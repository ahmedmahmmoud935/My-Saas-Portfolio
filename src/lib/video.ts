// Client-safe: turn a video URL into an embeddable source.
export type Embed =
  | { kind: 'youtube'; src: string }
  | { kind: 'vimeo'; src: string }
  | { kind: 'file'; src: string }
  | null

export function toEmbed(url: string | null | undefined): Embed {
  if (!url) return null
  const u = url.trim()

  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return { kind: 'youtube', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&playsinline=1&rel=0` }

  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&playsinline=1` }

  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u)) return { kind: 'file', src: u }

  // Fallback: assume a direct/embeddable URL.
  return { kind: 'file', src: u }
}
