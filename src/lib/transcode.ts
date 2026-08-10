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
): Promise<{ buf: Buffer; mimetype: string; ext: string } | null> {
  // Skip tiny clips — not worth the CPU.
  if (input.length < 400 * 1024) return null

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
        // Cap width at 1080 (only downscales); keep aspect, even dims.
        '-vf',
        "scale='min(1080,iw)':-2",
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '28',
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
    // Only use it if it actually got smaller.
    if (out.length >= input.length) return null
    return { buf: out, mimetype: 'video/mp4', ext: 'mp4' }
  } catch (e) {
    console.error('[transcode]', (e as Error).message)
    return null
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
