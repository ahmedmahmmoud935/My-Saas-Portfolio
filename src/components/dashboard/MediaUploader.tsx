'use client'

import React, { useRef, useState } from 'react'
import { uploadProjectMedia } from '@/lib/project-actions'
import { useDashLang } from './DashLang'

export type UploadedMedia = { id: number; url: string | null; thumbUrl: string | null }

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
}) {
  const ref = useRef<HTMLInputElement>(null)
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null)
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
      if (onUploadedMany) onUploadedMany(results)
      else results.forEach((r) => onUploaded?.(r))
    } catch {
      alert(t('فشل الرفع', 'Upload failed'))
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

  // "+" tile — add more images to a gallery.
  if (plus) {
    return (
      <button type="button" className="uploader-plus" onClick={() => ref.current?.click()} title={lbl}>
        {input}
        {busy ? '…' : '+'}
      </button>
    )
  }

  // Full-width preview with a replace badge — clicking re-opens the picker.
  if (big && preview) {
    return (
      <div className="uploader uploader-big" onClick={() => ref.current?.click()}>
        {input}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="" />
        <span className="uploader-replace">
          {busy ? t('جاري الرفع…', 'Uploading…') : t('⟳ استبدال', '⟳ Replace')}
        </span>
      </div>
    )
  }

  return (
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
    </div>
  )
}
