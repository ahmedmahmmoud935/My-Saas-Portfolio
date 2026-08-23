import { NextResponse } from 'next/server'
import { getDashboardContext } from '@/lib/dashboard'
import { storeUpload } from '@/lib/media-upload'
import { isVideoQuality, VIDEO_QUALITY_DEFAULT } from '@/lib/video-quality'

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

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'bad-body' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'no-file' }, { status: 400 })

  const q = form.get('quality')
  try {
    const media = await storeUpload(ctx, file, isVideoQuality(q) ? q : VIDEO_QUALITY_DEFAULT)
    return NextResponse.json(media)
  } catch (e) {
    console.error('[upload-media] failed:', (e as Error).message)
    return NextResponse.json({ error: (e as Error).message || 'upload-failed' }, { status: 500 })
  }
}

// Compressing a long clip takes minutes; don't let the platform cut it short.
export const maxDuration = 600
