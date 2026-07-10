'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { useDashLang } from './DashLang'

type Logo = { id?: number; name: string; websiteUrl: string; logoId: number | null; logoUrl: string | null }

export default function LogosManager({ logos }: { logos: Logo[] }) {
  const router = useRouter()
  const [edit, setEdit] = useState<Logo | null>(null)
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!edit) return
    setBusy(true)
    await saveDoc('logos', edit.id, {
      name: edit.name,
      websiteUrl: edit.websiteUrl,
      logo: edit.logoId,
    })
    setBusy(false)
    setEdit(null)
    router.refresh()
  }
  async function remove(id: number) {
    if (!confirm(t('حذف الشعار؟', 'Delete this logo?'))) return
    await deleteDoc('logos', id)
    router.refresh()
  }

  return (
    <div>
      <PageHeader
        icon="👥"
        title={t('شعارات العملاء', 'Client logos')}
        subtitle={t('الشركات اللي اشتغلت معاها', 'Companies you have worked with')}
        actions={
          <button className="btn btn-primary" onClick={() => setEdit({ name: '', websiteUrl: '', logoId: null, logoUrl: null })}>
            + {t('إضافة شعار', 'Add logo')}
          </button>
        }
      />

      {logos.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>
          {t('مفيش شعارات لسه.', 'No logos yet.')}
        </div>
      ) : (
        <div className="proj-manage-grid">
          {logos.map((l) => (
            <div className="proj-manage-card" key={l.id}>
              <div className="pm-cover" style={{ background: '#fff' }}>
                {l.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.logoUrl} alt={l.name} style={{ objectFit: 'contain', padding: 12 }} />
                ) : (
                  <span style={{ color: '#111' }}>{l.name}</span>
                )}
              </div>
              <div className="pm-body">
                <strong>{l.name}</strong>
                <span dir="ltr">{l.websiteUrl}</span>
              </div>
              <div className="pm-actions">
                <button className="icon-btn" onClick={() => setEdit(l)}>✏️</button>
                <button className="icon-btn del" onClick={() => remove(l.id!)}>🗑</button>
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
              <strong>{edit.id ? t('تعديل شعار', 'Edit logo') : t('شعار جديد', 'New logo')}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">{t('اسم الشركة', 'Company name')}</label>
              <input className="field" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              <label className="lbl">{t('رابط الموقع', 'Website URL')}</label>
              <input className="field" dir="ltr" value={edit.websiteUrl} onChange={(e) => setEdit({ ...edit, websiteUrl: e.target.value })} style={{ textAlign: 'start' }} />
              <label className="lbl">{t('الشعار', 'Logo')}</label>
              <MediaUploader previewUrl={edit.logoUrl} onUploaded={(m) => setEdit({ ...edit, logoId: m.id, logoUrl: m.thumbUrl })} />
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>{t('إلغاء', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.name.trim()}>{busy ? '…' : t('💾 حفظ', '💾 Save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
