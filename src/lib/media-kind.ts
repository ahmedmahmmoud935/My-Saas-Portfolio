/**
 * Is this media a video? Highlights saved before the uploader recorded the mime
 * type are all stored as `image`, so fall back to sniffing the file extension —
 * rendering a video inside an <img> hangs the browser on big files.
 *
 * Kept free of server imports so client components can use it too.
 */
export function isVideoSrc(url?: string | null, mimeType?: string | null): boolean {
  if (mimeType?.startsWith('video/')) return true
  if (!url) return false
  return /\.(mp4|mov|m4v|webm|ogv|avi|mkv|qt)(\?|#|$)/i.test(url)
}
