'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useDashLang } from './DashLang'
import { isStaleDeployment } from '@/lib/action-error'
import { uploadFile, type UploadPhase } from '@/lib/upload-client'
import {
  VIDEO_QUALITY_DEFAULT,
  VIDEO_QUALITY_OPTIONS,
  isVideoQuality,
  type VideoQuality,
} from '@/lib/video-quality'

export type { UploadedMedia } from '@/lib/upload-client'
import type { UploadedMedia } from '@/lib/upload-client'

export default function MediaUploader({
  label,
  previewUrl,
  onUploaded,
  onUploadedMany,
  accept = 'image/*',
  compact = false,
  big = false,
  multiple = false,
  plus = false,
  aspect,
  dim,
  onRemove,
}: {
  label?: string
  previewUrl?: string | null
  onUploaded?: (m: UploadedMedia) => void
  /** Called once with every uploaded file — use with `multiple`. */
  onUploadedMany?: (items: UploadedMedia[]) => void
  accept?: string
  compact?: boolean
  /** Render the preview full-width (as it appears when published) with a replace badge. */
  big?: boolean
  /** Allow picking several files at once. */
  multiple?: boolean
  /** Render as a small "+" tile (for adding more images to a gallery). */
  plus?: boolean
  /** CSS aspect-ratio (e.g. '9 / 16') — frames the preview like the real cover. */
  aspect?: string
  /** 0–100. Lays the same dim over the preview that the site will apply. */
  dim?: number
  /** When given, the preview gets a button to clear the image. */
  onRemove?: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null)
  const [note, setNote] = useState<string | null>(null)
  const [phase, setPhase] = useState<UploadPhase | null>(null)
  const [error, setError] = useState<{ text: string; reload: boolean } | null>(null)
  // Compression has no progress to report, so show the clock instead of a bar
  // that isn't moving.
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (phase?.stage !== 'processing') return
    setSecs(0)
    const id = setInterval(() => setSecs((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [phase?.stage, phase?.index])
  const lbl = label ?? t('رفع صورة', 'Upload image')
  // Videos get compressed on the server; let the picker choose the trade-off
  // and remember it, so it isn't re-picked on every upload.
  const takesVideo = accept.includes('video')
  const [quality, setQuality] = useState<VideoQuality>(VIDEO_QUALITY_DEFAULT)
  const savedQuality = (): VideoQuality | null => {
    try {
      const saved = localStorage.getItem('vpx-video-quality')
      return isVideoQuality(saved) ? saved : null
    } catch {
      return null
    }
  }
  useEffect(() => {
    if (!takesVideo) return
    const saved = savedQuality()
    if (saved) setQuality(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [takesVideo])

  async function pickFiles(files: File[]) {
    if (!files.length) return
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      const results: UploadedMedia[] = []
      for (const [i, file] of files.entries()) {
        results.push(
          await uploadFile(file, {
            // Read the saved choice rather than this instance's state: an
            // uploader that doesn't show the picker still honours it.
            quality: savedQuality() ?? quality,
            index: i + 1,
            total: files.length,
            onPhase: setPhase,
          }),
        )
      }
      const last = results[results.length - 1]
      setPreview(last?.thumbUrl ?? last?.url ?? null)
      // Say what happened to a video: a file that couldn't be compressed would
      // otherwise go up silently and be slow for every visitor.
      const v = results.find((r) => r.video)?.video
      if (v) {
        if (v.compressed) {
          const res = v.height ? ` · ${v.height}p` : ''
          setNote(
            t(
              `تم الضغط: ${v.fromMb} ← ${v.toMb} ميجابايت${res} ✓`,
              `Compressed: ${v.fromMb} → ${v.toMb} MB${res} ✓`,
            ),
          )
        } else if (v.reason !== 'too-small' && v.reason !== 'no-gain') {
          setNote(
            t(
              `اترفع من غير ضغط (${v.fromMb} ميجابايت) — الضغط فشل على السيرفر.`,
              `Uploaded uncompressed (${v.fromMb} MB) — compression failed on the server.`,
            ),
          )
        }
      }
      if (onUploadedMany) onUploadedMany(results)
      else results.forEach((r) => onUploaded?.(r))
    } catch (err) {
      // Never reload on its own here: an open editor holds unsaved work, and
      // pulling the page out from under it is how uploads used to "kick you
      // out". Say what happened and let the picker be clicked again.
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'unauthorized') {
        setError({
          text: t('انتهت الجلسة. سجّل الدخول تاني في تبويب جديد وبعدين جرّب.', 'Session expired. Sign in again in a new tab, then retry.'),
          reload: true,
        })
      } else if (isStaleDeployment(err)) {
        setError({ text: t('الموقع اتحدّث. حدّث الصفحة وجرّب تاني.', 'The site was updated. Refresh the page and retry.'), reload: true })
      } else {
        setError({
          text: t(`فشل الرفع${msg ? `: ${msg}` : ''} — جرّب تاني.`, `Upload failed${msg ? `: ${msg}` : ''} — try again.`),
          reload: false,
        })
      }
    } finally {
      setPhase(null)
      setBusy(false)
    }
  }

  const input = (
    <input
      ref={ref}
      type="file"
      accept={accept}
      multiple={multiple}
      hidden
      onChange={(e) => {
        const fs = Array.from(e.target.files ?? [])
        if (fs.length) pickFiles(fs)
        e.target.value = ''
      }}
    />
  )

  // Not on a "+" tile: that one is a cell in a gallery grid, and a three-button
  // settings column beside the thumbnails wrecked the row. The choice is saved
  // globally, so a "+" upload still uses whatever was picked elsewhere.
  const picker = takesVideo && !plus && (
    <div className="vq-row">
      <span className="vq-label">{t('جودة الفيديو', 'Video quality')}</span>
      <div className="vq-opts">
        {VIDEO_QUALITY_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`vq-opt${quality === o.id ? ' active' : ''}`}
            title={t(o.hintAr, o.hintEn)}
            onClick={(e) => {
              e.stopPropagation()
              setQuality(o.id)
              localStorage.setItem('vpx-video-quality', o.id)
            }}
          >
            {t(o.ar, o.en)}
          </button>
        ))}
      </div>
      <p className="vq-hint">
        {t(
          VIDEO_QUALITY_OPTIONS.find((o) => o.id === quality)?.hintAr ?? '',
          VIDEO_QUALITY_OPTIONS.find((o) => o.id === quality)?.hintEn ?? '',
        )}
      </p>
    </div>
  )

  const progress = phase && (
    <div className="up-prog" role="status" aria-live="polite">
      <div className="up-prog-head">
        <span className="up-spin" aria-hidden />
        <span>
          {phase.stage === 'uploading'
            ? t(`جاري الرفع… ${phase.pct}%`, `Uploading… ${phase.pct}%`)
            : phase.isVideo
              ? t(`جاري ضغط الفيديو… ${secs} ث`, `Compressing video… ${secs}s`)
              : t('جاري المعالجة…', 'Processing…')}
        </span>
        {phase.total > 1 && (
          <span className="up-count">{t(`ملف ${phase.index} من ${phase.total}`, `File ${phase.index} of ${phase.total}`)}</span>
        )}
      </div>
      <div className="up-bar">
        <div
          // Uploading has a real percentage; compression doesn't, so the bar
          // switches to a moving stripe rather than pretending to know.
          className={`up-bar-fill${phase.stage === 'processing' ? ' indet' : ''}`}
          style={phase.stage === 'uploading' ? { width: `${phase.pct}%` } : undefined}
        />
      </div>
      {phase.stage === 'processing' && phase.isVideo && (
        <p className="up-hint">
          {t('سيبها تخلّص — الفيديو الطويل ممكن ياخد دقيقة أو اتنين.', "Hang on — a long clip can take a minute or two.")}
        </p>
      )}
    </div>
  )

  const withNote = (el: React.ReactNode) => (
    <>
      {picker}
      {el}
      {progress}
      {error && (
        <p className="upload-err">
          {error.text}
          {error.reload && (
            <button type="button" className="link-btn" onClick={() => location.reload()}>
              {t('تحديث الصفحة', 'Refresh')}
            </button>
          )}
        </p>
      )}
      {note && <p className="upload-note">{note}</p>}
    </>
  )

  // "+" tile — add more images to a gallery.
  if (plus) {
    return withNote(
      <button type="button" className="uploader-plus" onClick={() => ref.current?.click()} title={lbl}>
        {input}
        {busy ? '…' : '+'}
      </button>,
    )
  }

  // Full-width preview with a replace badge — clicking re-opens the picker.
  if (big && preview) {
    return withNote(
      <div className="uploader uploader-big" onClick={() => ref.current?.click()}>
        {input}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="" draggable={false} />
        {/* Show the dim at its real strength, so the slider previews the
            published result instead of leaving you to guess. */}
        {dim !== undefined && <span className="uploader-dim" style={{ opacity: dim / 100 }} />}
        <span className="uploader-replace">
          {busy ? t('جاري الرفع…', 'Uploading…') : t('⟳ استبدال', '⟳ Replace')}
        </span>
        {onRemove && (
          <button
            type="button"
            className="uploader-remove"
            title={t('حذف الصورة', 'Remove image')}
            onClick={(e) => {
              e.stopPropagation()
              setPreview(null)
              onRemove()
            }}
          >
            ✕
          </button>
        )}
      </div>,
    )
  }

  // Framed preview in a specific aspect ratio (cover images per media type).
  if (aspect) {
    const [w, h] = aspect.split('/').map((n) => parseFloat(n))
    const portrait = w && h ? w / h < 1 : false
    return withNote(
      <div
        className="uploader uploader-aspect"
        onClick={() => ref.current?.click()}
        style={{ aspectRatio: aspect, maxWidth: portrait ? 190 : 340 }}
      >
        {input}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" />
        ) : (
          <span className="uploader-aspect-label">{busy ? t('جاري الرفع…', 'Uploading…') : `⬆ ${lbl}`}</span>
        )}
        <span className="uploader-replace">{busy ? t('جاري الرفع…', 'Uploading…') : preview ? t('⟳ استبدال', '⟳ Replace') : ''}</span>
      </div>,
    )
  }

  return withNote(
    <div
      className="uploader"
      onClick={() => ref.current?.click()}
      style={{
        border: '1px dashed var(--border)',
        borderRadius: 10,
        padding: compact ? 8 : 14,
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        minHeight: compact ? 64 : 96,
        background: 'var(--bg-3)',
      }}
    >
      {input}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          style={{ maxHeight: compact ? 48 : 80, borderRadius: 8, objectFit: 'cover' }}
        />
      ) : (
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
          {busy ? t('جاري الرفع…', 'Uploading…') : `⬆ ${lbl}`}
        </span>
      )}
    </div>,
  )
}
