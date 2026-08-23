'use client'

import type { UploadedMedia } from './media-upload'
import type { VideoQuality } from './video-quality'

export type { UploadedMedia }

/** What the uploader is doing right now, so the UI can say so. */
export type UploadPhase = {
  /** 'uploading' = bytes going up (pct is real); 'processing' = the server is
   *  compressing/converting, which has no progress to report. */
  stage: 'uploading' | 'processing'
  pct: number
  /** 1-based position when several files were picked at once. */
  index: number
  total: number
  isVideo: boolean
}

/**
 * Send one file to /api/upload-media.
 *
 * XMLHttpRequest rather than fetch: it's the only way to get real upload
 * progress, which is the difference between "frozen" and "62%" on a 100MB
 * video.
 */
export function uploadFile(
  file: File,
  opts: {
    quality?: VideoQuality
    index?: number
    total?: number
    onPhase?: (p: UploadPhase) => void
  } = {},
): Promise<UploadedMedia> {
  const { quality, index = 1, total = 1, onPhase } = opts
  const isVideo = file.type.startsWith('video/')

  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.append('file', file)
    if (isVideo && quality) fd.append('quality', quality)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload-media')
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return
      onPhase?.({
        stage: 'uploading',
        pct: Math.min(99, Math.round((e.loaded / e.total) * 100)),
        index,
        total,
        isVideo,
      })
    }
    // Bytes are all up; whatever happens now is the server working.
    xhr.upload.onload = () => onPhase?.({ stage: 'processing', pct: 100, index, total, isVideo })
    xhr.onerror = () => reject(new Error('network'))
    xhr.onload = () => {
      let body: { error?: string } & Partial<UploadedMedia> = {}
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        /* fall through to the status check */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.id) resolve(body as UploadedMedia)
      else if (xhr.status === 401) reject(new Error('unauthorized'))
      else reject(new Error(body.error || `HTTP ${xhr.status}`))
    }
    xhr.send(fd)
  })
}
