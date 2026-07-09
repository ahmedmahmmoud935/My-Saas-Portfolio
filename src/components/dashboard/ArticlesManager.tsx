'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'

type Item = {
  id?: number
  title: string
  slug: string
  excerpt: string
  contentHtml: string
  tags: string
  published: boolean
  readMin: number
  coverId: number | null
  coverUrl: string | null
}

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')

export default function ArticlesManager({ items }: { items: Item[] }) {
  const router = useRouter()
  const [edit, setEdit] = useState<Item | null>(null)
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!edit) return
    setBusy(true)
    await saveDoc('articles', edit.id, {
      title: edit.title,
      slug: edit.slug || slugify(edit.title),
      excerpt: edit.excerpt,
      cover: edit.coverId,
      mode: 'html',
      contentHtml: edit.contentHtml,
      tags: edit.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => ({ tag })),
      published: edit.published,
      readMin: edit.readMin,
    })
    setBusy(false)
    setEdit(null)
    router.refresh()
  }
  async function remove(id: number) {
    if (!confirm('حذف المقال؟')) return
    await deleteDoc('articles', id)
    router.refresh()
  }

  const blank: Item = { title: '', slug: '', excerpt: '', contentHtml: '', tags: '', published: false, readMin: 3, coverId: null, coverUrl: null }

  return (
    <div>
      <PageHeader
        icon="📖"
        title="المقالات"
        subtitle="مدوّنتك — كل مقال صفحة تساعد على SEO"
        actions={<button className="btn btn-primary" onClick={() => setEdit(blank)}>+ مقال جديد</button>}
      />

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>لا توجد مقالات بعد.</div>
      ) : (
        <div className="proj-manage-grid">
          {items.map((a) => (
            <div className="proj-manage-card" key={a.id}>
              <div className="pm-cover">
                {a.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverUrl} alt={a.title} />
                ) : <span style={{ color: 'var(--sub)' }}>📖</span>}
              </div>
              <div className="pm-body">
                <strong>{a.title}</strong>
                <span>{a.published ? 'منشور' : 'مسودّة'} · {a.readMin} د</span>
              </div>
              <div className="pm-actions">
                <button className="icon-btn" onClick={() => setEdit(a)}>✏️</button>
                <button className="icon-btn del" onClick={() => remove(a.id!)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <div className="modal-overlay" onClick={() => setEdit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <button className="icon-btn" onClick={() => setEdit(null)}>✕</button>
              <strong>{edit.id ? 'تعديل مقال' : 'مقال جديد'}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">العنوان</label>
              <input className="field" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value, slug: edit.slug || slugify(e.target.value) })} />
              <label className="lbl">الـ slug</label>
              <input className="field" dir="ltr" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} style={{ textAlign: 'start' }} />
              <label className="lbl">المقتطف</label>
              <textarea className="field" rows={2} value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} />
              <label className="lbl">الغلاف</label>
              <MediaUploader compact previewUrl={edit.coverUrl} onUploaded={(m) => setEdit({ ...edit, coverId: m.id, coverUrl: m.thumbUrl })} />
              <label className="lbl">المحتوى (HTML)</label>
              <textarea className="field" rows={8} dir="ltr" value={edit.contentHtml} onChange={(e) => setEdit({ ...edit, contentHtml: e.target.value })} style={{ textAlign: 'start', fontFamily: 'monospace' }} />
              <label className="lbl">الوسوم (مفصولة بفاصلة)</label>
              <input className="field" value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} />
              <div className="grid-2">
                <div>
                  <label className="lbl">دقائق القراءة</label>
                  <input className="field" type="number" value={edit.readMin} onChange={(e) => setEdit({ ...edit, readMin: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="lbl">الحالة</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 13 }}>{edit.published ? 'منشور' : 'مسودّة'}</span>
                    <div className={`toggle ${edit.published ? 'on' : ''}`} role="switch" aria-checked={edit.published} onClick={() => setEdit({ ...edit, published: !edit.published })} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.title.trim()}>{busy ? '...' : '💾 حفظ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
