'use client'

import React, { useRef, useState } from 'react'
import { uploadProjectMedia } from '@/lib/project-actions'

export type UploadedMedia = { id: number; url: string | null; thumbUrl: string | null }

export default function MediaUploader({
  label = 'رفع صورة',
  previewUrl,
  onUploaded,
  accept = 'image/*',
  compact = false,
}: {
  label?: string
  previewUrl?: string | null
  onUploaded: (m: UploadedMedia) => void
  accept?: string
  compact?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(previewUrl ?? null)

  async function pick(file: File) {
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadProjectMedia(fd)
      setPreview(res.thumbUrl ?? res.url)
      onUploaded(res)
    } catch {
      alert('فشل الرفع')
    } finally {
      setBusy(false)
    }
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
          {busy ? '...جاري الرفع' : `⬆ ${label}`}
        </span>
      )}
    </div>
  )
}
