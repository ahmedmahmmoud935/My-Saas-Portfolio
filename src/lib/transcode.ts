import { spawn } from 'child_process'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

/**
 * Re-encode an uploaded video to a smaller H.264 MP4 (fast-start, capped width,
 * CRF 28). Returns null on any failure — the caller then keeps the original, so
 * a missing/broken ffmpeg never breaks uploads. Runs ffmpeg as a subprocess so
 * it doesn't block the Node event loop.
 */
export async function compressVideo(
  input: Buffer,
  /** Source mime — a non-mp4 is always re-encoded, even if it doesn't shrink. */
  sourceMime?: string,
): Promise<{ buf: Buffer; mimetype: string; ext: string } | null> {
  // Skip tiny clips — not worth the CPU.
  if (input.length < 400 * 1024) return null
  const notMp4 = Boolean(sourceMime && sourceMime !== 'video/mp4')

  let dir = ''
  try {
    dir = await mkdtemp(path.join(tmpdir(), 'vpx-vid-'))
    const inPath = path.join(dir, 'in')
    const outPath = path.join(dir, 'out.mp4')
    await writeFile(inPath, input)

    await new Promise<void>((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-y',
        '-i',
        inPath,
        // Cap the LONGEST side at 1280 — capping width alone left a portrait
        // reel at 1080×1920, which is what made these heavy on mobile.
        '-vf',
        "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'",
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '30',
        // Phone-friendly profile, and keyframes often enough to seek quickly.
        '-profile:v',
        'high',
        '-level',
        '4.0',
        '-g',
        '48',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
        outPath,
      ])
      let err = ''
      ff.stderr.on('data', (d) => {
        err += d.toString()
      })
      ff.on('error', reject) // ffmpeg not installed
      ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${err.slice(-300)}`))))
    })

    const out = await readFile(outPath)
    // Keep the re-encode when it shrinks — or whenever the source wasn't mp4,
    // since .mov plays badly (or not at all) in some browsers.
    if (out.length >= input.length && !notMp4) return null
    return { buf: out, mimetype: 'video/mp4', ext: 'mp4' }
  } catch (e) {
    console.error('[transcode]', (e as Error).message)
    return null
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
