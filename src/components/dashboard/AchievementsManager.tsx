'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { useDashLang } from './DashLang'

type Item = { id?: number; title: string; value: string; iconId: number | null; iconUrl: string | null }

export default function AchievementsManager({ items }: { items: Item[] }) {
  const router = useRouter()
  const [edit, setEdit] = useState<Item | null>(null)
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!edit) return
    setBusy(true)
    await saveDoc('achievements', edit.id, { title: edit.title, value: edit.value, icon: edit.iconId })
    setBusy(false)
    setEdit(null)
    router.refresh()
  }
  async function remove(id: number) {
    if (!confirm(t('حذف الإنجاز؟', 'Delete this achievement?'))) return
    await deleteDoc('achievements', id)
    router.refresh()
  }

  return (
    <div>
      <PageHeader
        icon="🏆"
        title={t('الإنجازات', 'Achievements')}
        subtitle={t('العدّادات (عنوان + قيمة زي 50+)', 'Stat counters (title + value like 50+)')}
        actions={
          <button className="btn btn-primary" onClick={() => setEdit({ title: '', value: '', iconId: null, iconUrl: null })}>
            + {t('إضافة إنجاز', 'Add achievement')}
          </button>
        }
      />

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>{t('مفيش إنجازات لسه.', 'No achievements yet.')}</div>
      ) : (
        <div className="proj-manage-grid">
          {items.map((a) => (
            <div className="proj-manage-card" key={a.id}>
              <div className="pm-cover" style={{ flexDirection: 'column' }}>
                <b style={{ fontSize: 30, color: 'var(--accent)' }}>{a.value}</b>
              </div>
              <div className="pm-body">
                <strong>{a.title}</strong>
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
              <strong>{edit.id ? t('تعديل إنجاز', 'Edit achievement') : t('إنجاز جديد', 'New achievement')}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">{t('العنوان', 'Title')}</label>
              <input className="field" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
              <label className="lbl">{t('القيمة (مثال: 50+)', 'Value (e.g. 50+)')}</label>
              <input className="field" value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} />
              <label className="lbl">{t('أيقونة (اختياري)', 'Icon (optional)')}</label>
              <MediaUploader compact previewUrl={edit.iconUrl} onUploaded={(m) => setEdit({ ...edit, iconId: m.id, iconUrl: m.thumbUrl })} />
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>{t('إلغاء', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.title.trim()}>{busy ? '…' : t('💾 حفظ', '💾 Save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
