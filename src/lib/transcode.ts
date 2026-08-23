import { spawn } from 'child_process'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

/** Outcome of a compression attempt, so callers can report what happened. */
export type TranscodeResult = {
  buf: Buffer | null
  mimetype?: string
  /** Why nothing was replaced — for reporting, never for failing the upload. */
  reason?: 'too-small' | 'no-ffmpeg' | 'ffmpeg-failed' | 'no-gain'
  fromBytes: number
  toBytes?: number
}

/** Give up on a stuck encode rather than hold the request open forever. */
const TIMEOUT_MS = 10 * 60 * 1000

/**
 * Re-encode an uploaded video to a smaller H.264 MP4 (fast-start, longest side
 * capped at 1280, CRF 30).
 *
 * Compression never fails an upload: on any problem the caller keeps the
 * original file and the reason is reported instead. A phone/CapCut export is
 * the normal input here, so this has to survive large files and odd codecs.
 */
export async function compressVideo(
  input: Buffer,
  /** Source mime — a non-mp4 is always re-encoded, even if it doesn't shrink. */
  sourceMime?: string,
): Promise<TranscodeResult> {
  const fromBytes = input.length
  // Skip tiny clips — not worth the CPU.
  if (fromBytes < 400 * 1024) return { buf: null, reason: 'too-small', fromBytes }
  const notMp4 = Boolean(sourceMime && sourceMime !== 'video/mp4')

  let dir = ''
  let spawnFailed = false
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
      const timer = setTimeout(() => {
        ff.kill('SIGKILL')
        reject(new Error(`ffmpeg timed out after ${TIMEOUT_MS / 1000}s`))
      }, TIMEOUT_MS)
      ff.on('error', (e) => {
        // ENOENT here means ffmpeg isn't installed in this environment.
        spawnFailed = true
        clearTimeout(timer)
        reject(e)
      })
      ff.on('close', (code) => {
        clearTimeout(timer)
        code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${err.slice(-300)}`))
      })
    })

    const out = await readFile(outPath)
    // Keep the re-encode when it shrinks — or whenever the source wasn't mp4,
    // since .mov plays badly (or not at all) in some browsers.
    if (out.length >= fromBytes && !notMp4) {
      return { buf: null, reason: 'no-gain', fromBytes, toBytes: out.length }
    }
    console.log(
      `[transcode] ${(fromBytes / 1048576).toFixed(1)}MB -> ${(out.length / 1048576).toFixed(1)}MB`,
    )
    return { buf: out, mimetype: 'video/mp4', fromBytes, toBytes: out.length }
  } catch (e) {
    const msg = (e as Error).message
    console.error('[transcode] failed:', msg)
    return {
      buf: null,
      reason: spawnFailed ? 'no-ffmpeg' : 'ffmpeg-failed',
      fromBytes,
    }
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
