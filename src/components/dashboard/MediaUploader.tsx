'use client'

import React, { useRef, useState } from 'react'
import { uploadProjectMedia } from '@/lib/project-actions'
import { useDashLang } from './DashLang'

export type UploadedMedia = { id: number; url: string | null; thumbUrl: string | null }

export default function MediaUploader({
  label,
  previewUrl,
  onUploaded,
  accept = 'image/*',
  compact = false,
  big = false,
}: {
  label?: string
  previewUrl?: string | null
  onUploaded: (m: UploadedMedia) => void
  accept?: string
  compact?: boolean
  /** Render the preview full-width (as it appears when published) with a replace badge. */
  big?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null)
  const lbl = label ?? t('رفع صورة', 'Upload image')

  async function pick(file: File) {
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadProjectMedia(fd)
      setPreview(res.thumbUrl ?? res.url)
      onUploaded(res)
    } catch {
      alert(t('فشل الرفع', 'Upload failed'))
    } finally {
      setBusy(false)
    }
  }

  // Full-width preview (shows the image at roughly its published size) with a
  // replace badge — clicking anywhere re-opens the picker to swap the image.
  if (big && preview) {
    return (
      <div className="uploader uploader-big" onClick={() => ref.current?.click()}>
        <input
          ref={ref}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) pick(f)
            e.target.value = ''
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="" />
        <span className="uploader-replace">{busy ? t('جاري الرفع…', 'Uploading…') : t('⟳ استبدال', '⟳ Replace')}</span>
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
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) pick(f)
          e.target.value = ''
        }}
      />
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
