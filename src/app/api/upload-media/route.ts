import { NextResponse } from 'next/server'
import { getDashboardContext } from '@/lib/dashboard'
import { storeUpload } from '@/lib/media-upload'
import { isVideoQuality, VIDEO_QUALITY_DEFAULT } from '@/lib/video-quality'
import { MAX_UPLOAD_MB, QUOTA_FULL } from '@/lib/quota'

/**
 * Media upload endpoint for the dashboard.
 *
 * This used to be a Server Action. Two reasons it isn't any more: an action's
 * response re-renders the route's server tree, which occasionally reset an
 * open editor mid-session; and an action gives the browser no upload progress,
 * so a 100MB video looked frozen. A plain POST does neither.
 */
export async function POST(req: Request) {
  const ctx = await getDashboardContext()
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  /* Too big is refused from the request's declared size, before the body is
     read: reading it first meant holding the whole file in memory to find out
     it could not be kept. */
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared > (MAX_UPLOAD_MB.video + 5) * 1048576) {
    return NextResponse.json({ error: 'too-big' }, { status: 413 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'bad-body' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'no-file' }, { status: 400 })
  const kind = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null
  if (!kind) return NextResponse.json({ error: 'type' }, { status: 415 })
  if (file.size > MAX_UPLOAD_MB[kind] * 1048576) return NextResponse.json({ error: 'too-big' }, { status: 413 })

  const q = form.get('quality')
  try {
    const media = await storeUpload(ctx, file, isVideoQuality(q) ? q : VIDEO_QUALITY_DEFAULT)
    return NextResponse.json(media)
  } catch (e) {
    /* Out of room is an answer, not a failure: its own status and code, so the
       dashboard can say what to do about it instead of "try again". */
    if (String((e as Error)?.message ?? '').includes(QUOTA_FULL)) {
      return NextResponse.json({ error: QUOTA_FULL }, { status: 413 })
    }
    // The reason goes to the log; the dashboard gets a code it can explain.
    console.error('[upload-media] failed:', (e as Error).message)
    return NextResponse.json({ error: 'upload-failed' }, { status: 500 })
  }
}

// Compressing a long clip takes minutes; don't let the platform cut it short.
export const maxDuration = 600
