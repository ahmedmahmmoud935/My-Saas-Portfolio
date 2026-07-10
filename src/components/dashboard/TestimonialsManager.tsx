'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { useDashLang } from './DashLang'

type Item = {
  id?: number
  name: string
  role: string
  company: string
  content: string
  rating: number
  approved: boolean
  avatarId: number | null
  avatarUrl: string | null
}

export default function TestimonialsManager({ items }: { items: Item[] }) {
  const router = useRouter()
  const [edit, setEdit] = useState<Item | null>(null)
  const { t: tr } = useDashLang()
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!edit) return
    setBusy(true)
    await saveDoc('testimonials', edit.id, {
      name: edit.name,
      role: edit.role,
      company: edit.company,
      content: edit.content,
      rating: edit.rating,
      approved: edit.approved,
      avatar: edit.avatarId,
    })
    setBusy(false)
    setEdit(null)
    router.refresh()
  }
  async function remove(id: number) {
    if (!confirm(tr('حذف الرأي؟', 'Delete this review?'))) return
    await deleteDoc('testimonials', id)
    router.refresh()
  }

  const blank: Item = { name: '', role: '', company: '', content: '', rating: 5, approved: true, avatarId: null, avatarUrl: null }

  return (
    <div>
      <PageHeader
        icon="💬"
        title={tr('آراء العملاء', 'Testimonials')}
        subtitle={tr('التقييمات (المعتمدة تظهر على الموقع)', 'Reviews (approved ones show on the site)')}
        actions={
          <button className="btn btn-primary" onClick={() => setEdit(blank)}>+ {tr('إضافة رأي', 'Add review')}</button>
        }
      />

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>{tr('مفيش آراء لسه.', 'No reviews yet.')}</div>
      ) : (
        <div className="proj-manage-grid">
          {items.map((t) => (
            <div className="proj-manage-card" key={t.id}>
              <div className="pm-body" style={{ paddingTop: 16 }}>
                <div style={{ color: 'var(--accent)' }}>{'★'.repeat(t.rating)}</div>
                <p style={{ fontSize: 13, color: 'var(--text)', margin: '6px 0' }}>{t.content.slice(0, 90)}</p>
                <strong>{t.name}</strong>
                <span>{[t.role, t.company].filter(Boolean).join(' · ')}</span>
                {!t.approved && <span style={{ color: '#f59e0b' }}>{tr('بانتظار الموافقة', 'Pending approval')}</span>}
              </div>
              <div className="pm-actions">
                <button className="icon-btn" onClick={() => setEdit(t)}>✏️</button>
                <button className="icon-btn del" onClick={() => remove(t.id!)}>🗑</button>
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
              <strong>{edit.id ? tr('تعديل رأي', 'Edit review') : tr('رأي جديد', 'New review')}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">{tr('الاسم', 'Name')}</label>
              <input className="field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              <div className="grid-2">
                <div>
                  <label className="lbl">{tr('المسمى', 'Role')}</label>
                  <input className="field" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} />
                </div>
                <div>
                  <label className="lbl">{tr('الشركة', 'Company')}</label>
                  <input className="field" value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} />
                </div>
              </div>
              <label className="lbl">{tr('الرأي', 'Review')}</label>
              <textarea className="field" rows={3} value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} />
              <div className="grid-2">
                <div>
                  <label className="lbl">{tr('التقييم', 'Rating')}</label>
                  <select className="field" value={edit.rating} onChange={(e) => setEdit({ ...edit, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">{tr('الحالة', 'Status')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 13 }}>{edit.approved ? tr('معتمد', 'Approved') : tr('مخفي', 'Hidden')}</span>
                    <div className={`toggle ${edit.approved ? 'on' : ''}`} role="switch" aria-checked={edit.approved} onClick={() => setEdit({ ...edit, approved: !edit.approved })} />
                  </div>
                </div>
              </div>
              <label className="lbl">{tr('الصورة (اختياري)', 'Photo (optional)')}</label>
              <MediaUploader compact previewUrl={edit.avatarUrl} onUploaded={(m) => setEdit({ ...edit, avatarId: m.id, avatarUrl: m.thumbUrl })} />
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>{tr('إلغاء', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.name.trim() || !edit.content.trim()}>{busy ? '…' : tr('💾 حفظ', '💾 Save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
