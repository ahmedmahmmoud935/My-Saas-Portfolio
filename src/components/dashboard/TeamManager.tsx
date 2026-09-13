'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { useDashLang } from './DashLang'

/**
 * The people behind the site.
 *
 * Bilingual on the words and shared on the face, the way the rest of the
 * content works — and ordered by hand, because who is introduced first is a
 * decision, not an accident of who was added first.
 */
export type TeamItem = {
  id?: number
  nameAr: string
  nameEn: string
  roleAr: string
  roleEn: string
  bioAr: string
  bioEn: string
  photoId: number | null
  photoUrl: string | null
  sortOrder: number
}

const blank: TeamItem = {
  nameAr: '',
  nameEn: '',
  roleAr: '',
  roleEn: '',
  bioAr: '',
  bioEn: '',
  photoId: null,
  photoUrl: null,
  sortOrder: 0,
}

export default function TeamManager({ items }: { items: TeamItem[] }) {
  const router = useRouter()
  const { t } = useDashLang()
  const [edit, setEdit] = useState<TeamItem | null>(null)
  const [busy, setBusy] = useState(false)

  /* A member is written twice — once per language — because Payload stores a
     localized field per locale, and one save can only carry one of them. The
     Arabic pass creates the row; the English pass fills the other half of it. */
  async function save() {
    if (!edit) return
    if (!edit.nameAr.trim() && !edit.nameEn.trim()) {
      alert(t('اكتب الاسم على الأقل', 'A name, at least'))
      return
    }
    setBusy(true)
    const ar = await saveDoc(
      'team',
      edit.id,
      {
        name: edit.nameAr || edit.nameEn,
        role: edit.roleAr,
        bio: edit.bioAr,
        photo: edit.photoId,
        sortOrder: edit.sortOrder,
      },
      'ar',
    )
    const id = edit.id ?? (ar as { id?: number })?.id
    if (id) {
      await saveDoc(
        'team',
        id,
        { name: edit.nameEn || edit.nameAr, role: edit.roleEn, bio: edit.bioEn },
        'en',
      )
    }
    setBusy(false)
    setEdit(null)
    router.refresh()
  }

  async function remove(id: number) {
    if (!confirm(t('حذف العضو؟', 'Remove this person?'))) return
    await deleteDoc('team', id)
    router.refresh()
  }

  /** Swapping two neighbours' order, and saving only those two. */
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (busy || j < 0 || j >= items.length) return
    setBusy(true)
    const a = items[i]
    const b = items[j]
    await Promise.all([
      saveDoc('team', a.id, { sortOrder: j }, 'ar'),
      saveDoc('team', b.id, { sortOrder: i }, 'ar'),
    ])
    setBusy(false)
    router.refresh()
  }

  return (
    <div>
      <PageHeader
        icon="🧑‍🤝‍🧑"
        title={t('الفريق', 'The team')}
        subtitle={t(
          'الناس اللي وراء الشغل — صورة واسم ومسمى وظيفي وسطر عن كل واحد',
          'The people behind the work — a face, a name, a title and a line each',
        )}
        actions={
          <button className="btn btn-primary" onClick={() => setEdit({ ...blank, sortOrder: items.length })}>
            + {t('عضو جديد', 'Add someone')}
          </button>
        }
      />

      {items.length === 0 && (
        <div className="panel" style={{ color: 'var(--sub)' }}>
          {t(
            'لسه مفيش حد هنا. القسم ده مش بيظهر على الموقع غير لما تضيف أول عضو — فلو انت شغال لوحدك سيبه فاضي.',
            'Nobody here yet. The section stays off the site until the first person is added — leave it empty if you work alone.',
          )}
        </div>
      )}

      <div className="proj-manage-grid" style={{ gridTemplateColumns: '1fr' }}>
        {items.map((m, i) => (
          <div className="panel" key={m.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div className="team-thumb">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt="" />
                ) : (
                  <span>{(m.nameAr || m.nameEn || '؟').trim()[0]}</span>
                )}
              </div>
              <div style={{ flex: '1 1 200px', textAlign: 'start' }}>
                <strong>{m.nameAr || m.nameEn}</strong>
                <div style={{ color: 'var(--sub)', fontSize: 13 }}>{m.roleAr || m.roleEn}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, -1)}>▲</button>
                <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, 1)}>▼</button>
              </div>
              <button className="btn btn-ghost" onClick={() => setEdit(m)}>
                {t('تعديل', 'Edit')}
              </button>
              <button className="btn btn-danger" onClick={() => m.id && remove(m.id)}>
                {t('🗑 حذف', '🗑 Delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <div className="modal-overlay" onClick={() => setEdit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <button className="icon-btn" onClick={() => setEdit(null)}>✕</button>
              <strong>{edit.id ? t('تعديل عضو', 'Edit') : t('عضو جديد', 'Add someone')}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">{t('الصورة', 'Photo')}</label>
              <MediaUploader
                compact
                accept="image/*"
                previewUrl={edit.photoUrl}
                onUploaded={(m) => setEdit({ ...edit, photoId: m.id, photoUrl: m.thumbUrl ?? m.url ?? null })}
                onRemove={edit.photoUrl ? () => setEdit({ ...edit, photoId: null, photoUrl: null }) : undefined}
              />

              <label className="lbl" style={{ marginTop: 16, display: 'block' }}>{t('الاسم', 'Name')}</label>
              <div className="grid-2">
                <input className="field" placeholder={t('عربي', 'Arabic')} value={edit.nameAr} onChange={(e) => setEdit({ ...edit, nameAr: e.target.value })} />
                <input className="field" dir="ltr" style={{ textAlign: 'start' }} placeholder="English" value={edit.nameEn} onChange={(e) => setEdit({ ...edit, nameEn: e.target.value })} />
              </div>

              <label className="lbl" style={{ marginTop: 12, display: 'block' }}>{t('المسمى الوظيفي', 'Job title')}</label>
              <div className="grid-2">
                <input className="field" placeholder={t('مثلاً: مونتير', 'e.g. Video editor')} value={edit.roleAr} onChange={(e) => setEdit({ ...edit, roleAr: e.target.value })} />
                <input className="field" dir="ltr" style={{ textAlign: 'start' }} placeholder="e.g. Video editor" value={edit.roleEn} onChange={(e) => setEdit({ ...edit, roleEn: e.target.value })} />
              </div>

              <label className="lbl" style={{ marginTop: 12, display: 'block' }}>{t('نبذة', 'A line about them')}</label>
              <div className="grid-2">
                <textarea className="field" rows={3} value={edit.bioAr} onChange={(e) => setEdit({ ...edit, bioAr: e.target.value })} />
                <textarea className="field" rows={3} dir="ltr" style={{ textAlign: 'start' }} value={edit.bioEn} onChange={(e) => setEdit({ ...edit, bioEn: e.target.value })} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-primary" onClick={save} disabled={busy}>
                {busy ? '…' : t('💾 حفظ', '💾 Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
