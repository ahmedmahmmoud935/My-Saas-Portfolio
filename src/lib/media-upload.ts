import type { getDashboardContext } from './dashboard'
import { compressVideo } from './transcode'
import { VIDEO_QUALITY_DEFAULT, type VideoQuality } from './video-quality'

import type { VideoReport } from './project-types'

export type UploadedMedia = {
  id: number
  url: string | null
  thumbUrl: string | null
  mimeType?: string | null
  video?: VideoReport
}

type Ctx = NonNullable<Awaited<ReturnType<typeof getDashboardContext>>>

/**
 * Store one uploaded file as Media (Payload makes the WebP + thumb/card sizes).
 *
 * Shared by the upload route and the legacy server action so both behave
 * identically — videos are compressed here and the result is reported back, so
 * the dashboard can say what happened instead of silently storing a 70MB
 * export.
 */
export async function storeUpload(
  ctx: Ctx,
  file: File,
  quality: VideoQuality = VIDEO_QUALITY_DEFAULT,
): Promise<UploadedMedia> {
  let buf: Buffer = Buffer.from(await file.arrayBuffer())
  let mimetype = file.type
  let name = file.name
  let video: VideoReport | undefined

  if (file.type.startsWith('video/')) {
    const c = await compressVideo(buf, file.type, quality)
    if (c.buf && c.mimetype) {
      buf = c.buf
      mimetype = c.mimetype
      name = name.replace(/\.[^.]+$/, '') + '.mp4'
    }
    video = {
      compressed: Boolean(c.buf),
      fromMb: +(c.fromBytes / 1048576).toFixed(1),
      toMb: +((c.toBytes ?? c.fromBytes) / 1048576).toFixed(1),
      reason: c.reason,
      height: c.height,
    }
  }

  const media = await ctx.payload.create({
    collection: 'media',
    data: { tenant: ctx.tenantId, alt: name },
    file: { data: buf as Buffer<ArrayBuffer>, mimetype, name, size: buf.length },
  })
  const sizes = (media as { sizes?: { thumb?: { url?: string }; card?: { url?: string } } }).sizes
  return {
    id: media.id,
    url: media.url ?? null,
    thumbUrl: sizes?.thumb?.url ?? media.url ?? null,
    mimeType: media.mimeType ?? mimetype ?? null,
    video,
  }
}
