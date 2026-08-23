import { spawn } from 'child_process'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'

import type { VideoQuality } from './video-quality'
import { VIDEO_QUALITY_DEFAULT } from './video-quality'

/** Outcome of a compression attempt, so callers can report what happened. */
export type TranscodeResult = {
  buf: Buffer | null
  mimetype?: string
  /** Why nothing was replaced — for reporting, never for failing the upload. */
  reason?: 'too-small' | 'no-ffmpeg' | 'ffmpeg-failed' | 'no-gain'
  fromBytes: number
  toBytes?: number
  /** Vertical resolution of the encode (720, 1080…) — shown in the dashboard. */
  height?: number
}

/** Give up on a stuck encode rather than hold the request open forever. */
const PASS_TIMEOUT_MS = 8 * 60 * 1000

/**
 * How each quality level trades detail against file size.
 *
 * `crf` is the quality target (lower = better, ~6 points ≈ half/double the
 * size); `maxSide` caps the longest edge, never upscales; `maxrateK` puts a
 * ceiling on busy scenes so a clip can't spike on a phone connection; and
 * `budgetMb` is the size we retry above.
 */
const LEVELS: Record<VideoQuality, { maxSide: number; crf: number; maxrateK: number; budgetMb: number }> = {
  high: { maxSide: 1920, crf: 21, maxrateK: 9000, budgetMb: 70 },
  balanced: { maxSide: 1920, crf: 24, maxrateK: 5200, budgetMb: 28 },
  small: { maxSide: 1280, crf: 28, maxrateK: 2400, budgetMb: 10 },
}

type Probe = {
  width?: number
  height?: number
  duration?: number
  /** smpte2084 / arib-std-b67 mean the source is HDR. */
  transfer?: string
  fps?: number
}

/** Read dimensions and duration. Best effort — the encode runs regardless. */
async function probe(file: string): Promise<Probe> {
  return new Promise((resolve) => {
    const ff = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,color_transfer,r_frame_rate:format=duration',
      '-of', 'json',
      file,
    ])
    let out = ''
    ff.stdout.on('data', (d) => (out += d.toString()))
    ff.on('error', () => resolve({}))
    ff.on('close', () => {
      try {
        const j = JSON.parse(out)
        const st = j.streams?.[0] ?? {}
        // r_frame_rate comes back as a fraction, e.g. "60000/1001".
        const [num, den] = String(st.r_frame_rate ?? '').split('/').map(Number)
        resolve({
          width: st.width,
          height: st.height,
          duration: parseFloat(j.format?.duration) || undefined,
          transfer: st.color_transfer,
          fps: num && den ? num / den : undefined,
        })
      } catch {
        resolve({})
      }
    })
  })
}

/**
 * x264 preset = how much CPU we spend looking for savings. `medium` gives
 * noticeably better detail per megabyte than `veryfast`, but a long clip on a
 * small VPS has to finish inside the request, so long or large inputs step
 * down.
 */
function speedPreset(p: Probe, maxSide: number): string {
  const secs = p.duration ?? 0
  const bigFrame = maxSide >= 1920
  if (secs > 360) return 'veryfast'
  if (secs > 150) return bigFrame ? 'fast' : 'medium'
  return 'medium'
}

/** HDR sources (iPhone and most modern phones, some editors) are 10-bit; just
 *  forcing 8-bit yuv420p makes them look grey and washed out. */
const isHdr = (p: Probe) => p.transfer === 'smpte2084' || p.transfer === 'arib-std-b67'

function encode(
  inPath: string,
  outPath: string,
  opts: {
    maxSide: number
    crf: number
    maxrateK: number
    preset: string
    tonemap?: boolean
    fpsCap?: number
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { maxSide, crf, maxrateK, preset, tonemap, fpsCap } = opts
    const filters = [
      // Cap the LONGEST side (so a portrait reel is capped on its height),
      // and never upscale.
      `scale='if(gt(iw,ih),min(${maxSide},iw),-2)':'if(gt(iw,ih),-2,min(${maxSide},ih))'`,
    ]
    // Proper HDR→SDR conversion instead of a flat bit-depth cut.
    if (tonemap)
      filters.push(
        'zscale=t=linear:npl=100',
        'format=gbrpf32le',
        'zscale=p=bt709',
        'tonemap=tonemap=hable:desat=0',
        'zscale=t=bt709:m=bt709:r=tv',
        'format=yuv420p',
      )
    if (fpsCap) filters.push(`fps=${fpsCap}`)
    const ff = spawn('ffmpeg', [
      '-y',
      '-i',
      inPath,
      // lanczos instead of the default bilinear: keeps edges and on-screen
      // text crisp when downscaling, which is most of what "it looks softer"
      // actually is.
      '-sws_flags',
      'lanczos',
      '-vf',
      filters.join(','),
      '-c:v',
      'libx264',
      '-preset',
      preset,
      '-crf',
      String(crf),
      // Ceiling for busy scenes; CRF still decides the average.
      '-maxrate',
      `${maxrateK}k`,
      '-bufsize',
      `${maxrateK * 2}k`,
      // Phone-friendly profile, and keyframes often enough to seek quickly.
      '-profile:v',
      'high',
      '-level',
      '4.1',
      '-g',
      '48',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ac',
      '2',
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
      reject(new Error(`ffmpeg timed out after ${PASS_TIMEOUT_MS / 1000}s`))
    }, PASS_TIMEOUT_MS)
    ff.on('error', (e) => {
      // ENOENT here means ffmpeg isn't installed in this environment.
      ;(e as Error & { spawnFailed?: boolean }).spawnFailed = true
      clearTimeout(timer)
      reject(e)
    })
    ff.on('close', (code) => {
      clearTimeout(timer)
      code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${err.slice(-300)}`))
    })
  })
}

/**
 * Re-encode an uploaded video to a smaller H.264 MP4 (fast-start).
 *
 * Quality first: the clip keeps its resolution up to the level's cap and is
 * encoded to a quality target, not a fixed bitrate. Only if the result blows
 * past the size budget does it get a second, cheaper pass — so a short clip
 * stays sharp and a long one still can't turn into a 200MB download.
 *
 * Compression never fails an upload: on any problem the caller keeps the
 * original file and the reason is reported instead. The input can come from
 * any editor or phone — large files, 10-bit HDR, high frame rates, and odd
 * containers all have to survive this path.
 */
export async function compressVideo(
  input: Buffer,
  /** Source mime — a non-mp4 is always re-encoded, even if it doesn't shrink. */
  sourceMime?: string,
  quality: VideoQuality = VIDEO_QUALITY_DEFAULT,
): Promise<TranscodeResult> {
  const fromBytes = input.length
  // Skip tiny clips — not worth the CPU.
  if (fromBytes < 400 * 1024) return { buf: null, reason: 'too-small', fromBytes }
  const notMp4 = Boolean(sourceMime && sourceMime !== 'video/mp4')
  const level = LEVELS[quality] ?? LEVELS[VIDEO_QUALITY_DEFAULT]

  let dir = ''
  let spawnFailed = false
  try {
    dir = await mkdtemp(path.join(tmpdir(), 'vpx-vid-'))
    const inPath = path.join(dir, 'in')
    const outPath = path.join(dir, 'out.mp4')
    await writeFile(inPath, input)

    const info = await probe(inPath)
    // Slow-motion and 120fps exports: 60 is as much as any browser will show,
    // and the extra frames only cost bitrate that detail could have used.
    const fpsCap = info.fps && info.fps > 61 ? 60 : undefined
    const startedAt = Date.now()
    const pass = (o: Partial<Parameters<typeof encode>[2]> = {}) =>
      encode(inPath, outPath, {
        maxSide: level.maxSide,
        crf: level.crf,
        maxrateK: level.maxrateK,
        preset: speedPreset(info, level.maxSide),
        fpsCap,
        ...o,
      })

    if (isHdr(info)) {
      // Not every ffmpeg build ships zimg/tonemap; if this one doesn't, the
      // plain encode still runs rather than the upload losing its video.
      try {
        await pass({ tonemap: true })
      } catch (e) {
        if ((e as Error & { spawnFailed?: boolean }).spawnFailed) throw e
        console.warn('[transcode] tonemap unavailable, encoding without it')
        await pass()
      }
    } else {
      await pass()
    }
    let out = await readFile(outPath)
    let maxSide = level.maxSide

    // Too big for the budget — one cheaper pass rather than shipping a clip
    // nobody on mobile data will wait for. Skipped if the first pass was slow.
    const firstPassMs = Date.now() - startedAt
    if (out.length > level.budgetMb * 1048576 && firstPassMs < 4 * 60 * 1000) {
      // 'high' was chosen on purpose — trim it less than the other levels.
      maxSide = Math.min(maxSide, quality === 'high' ? 1440 : 1280)
      await pass({
        maxSide,
        crf: level.crf + 4,
        maxrateK: Math.round(level.maxrateK * 0.6),
        preset: speedPreset(info, maxSide),
        tonemap: isHdr(info),
      })
      out = await readFile(outPath)
    }

    // Keep the re-encode when it shrinks — or whenever the source wasn't mp4,
    // since .mov plays badly (or not at all) in some browsers.
    if (out.length >= fromBytes && !notMp4) {
      return { buf: null, reason: 'no-gain', fromBytes, toBytes: out.length }
    }
    const finalHeight = await probe(outPath).then((p) => p.height)
    console.log(
      `[transcode] ${quality}: ${(fromBytes / 1048576).toFixed(1)}MB -> ${(out.length / 1048576).toFixed(1)}MB` +
        (finalHeight ? ` (${finalHeight}p)` : ''),
    )
    return { buf: out, mimetype: 'video/mp4', fromBytes, toBytes: out.length, height: finalHeight }
  } catch (e) {
    const msg = (e as Error).message
    spawnFailed = Boolean((e as Error & { spawnFailed?: boolean }).spawnFailed)
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
