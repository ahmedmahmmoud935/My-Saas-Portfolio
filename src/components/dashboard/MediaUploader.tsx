'use client'

import React, { useRef, useState } from 'react'
import { uploadProjectMedia } from '@/lib/project-actions'
import { useDashLang } from './DashLang'
import { actionErrorMessage, isStaleDeployment } from '@/lib/action-error'

import type { VideoReport } from '@/lib/project-types'

export type UploadedMedia = {
  id: number
  url: string | null
  thumbUrl: string | null
  mimeType?: string | null
  video?: VideoReport
}

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
  const { t, lang } = useDashLang()
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null)
  const [note, setNote] = useState<string | null>(null)
  const lbl = label ?? t('رفع صورة', 'Upload image')

  async function pickFiles(files: File[]) {
    if (!files.length) return
    setBusy(true)
    try {
      const results: UploadedMedia[] = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        results.push(await uploadProjectMedia(fd))
      }
      const last = results[results.length - 1]
      setPreview(last?.thumbUrl ?? last?.url ?? null)
      // Say what happened to a video: a file that couldn't be compressed would
      // otherwise go up silently and be slow for every visitor.
      const v = results.find((r) => r.video)?.video
      if (v) {
        if (v.compressed) {
          setNote(
            t(`تم الضغط: ${v.fromMb} ← ${v.toMb} ميجابايت ✓`, `Compressed: ${v.fromMb} → ${v.toMb} MB ✓`),
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
      // A page left open across a deploy calls an action id that no longer
      // exists — reload rather than blame the file.
      alert(actionErrorMessage(err, lang))
      if (isStaleDeployment(err)) location.reload()
    } finally {
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

  const withNote = (el: React.ReactNode) => (
    <>
      {el}
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
        <img src={preview} alt="" />
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
