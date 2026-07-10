'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveContent } from '@/lib/content-actions'
import {
  CONTENT_SECTIONS,
  emptyLoc,
  type ContentForm,
  type Loc,
} from '@/lib/content-types'
import { useDashLang } from './DashLang'

/* Bilingual field (AR + EN side by side). */
function LocField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: Loc
  onChange: (v: Loc) => void
  multiline?: boolean
}) {
  const { t } = useDashLang()
  const Cmp = (multiline ? 'textarea' : 'input') as 'input'
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="lbl" style={{ display: 'block' }}>
        {label}
      </label>
      <div className="grid-2">
        <Cmp
          className="field"
          placeholder={t('عربي', 'Arabic')}
          value={value.ar}
          onChange={(e) => onChange({ ...value, ar: e.target.value })}
          {...(multiline ? { rows: 3 } : {})}
        />
        <Cmp
          className="field"
          dir="ltr"
          placeholder="English"
          value={value.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          style={{ textAlign: 'start' }}
          {...(multiline ? { rows: 3 } : {})}
        />
      </div>
    </div>
  )
}

function ArrayCard({
  children,
  onRemove,
}: {
  children: React.ReactNode
  onRemove: () => void
}) {
  return (
    <div className="mod-card">
      <div className="mod-card-head">
        <button className="icon-btn del" style={{ width: 30, height: 30 }} onClick={onRemove}>
          🗑
        </button>
        <span />
      </div>
      {children}
    </div>
  )
}

export default function ContentEditor({ initial }: { initial: ContentForm }) {
  const [f, setF] = useState<ContentForm>(initial)
  const [sec, setSec] = useState<keyof ContentForm>('hero')
  const [busy, setBusy] = useState(false)
  const { t } = useDashLang()
  const [toast, setToast] = useState(false)

  const patch = (p: Partial<ContentForm>) => setF((prev) => ({ ...prev, ...p }))

  async function save() {
    setBusy(true)
    await saveContent(f)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="✏️"
        title={t('المحتوى', 'Content')}
        subtitle={t('نصوص كل قسم بالعربي والإنجليزي', 'Each section’s text in Arabic and English')}
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : t('💾 حفظ', '💾 Save')}
          </button>
        }
      />

      <div className="cat-pills" style={{ marginBottom: 18 }}>
        {CONTENT_SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`pill ${sec === s.id ? 'active' : ''}`}
            onClick={() => setSec(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {sec === 'hero' && (
          <>
            <LocField label={t('الاسم', 'Name')} value={f.hero.name} onChange={(v) => patch({ hero: { ...f.hero, name: v } })} />
            <LocField label={t('التخصص / العنوان', 'Specialty / title')} value={f.hero.title} onChange={(v) => patch({ hero: { ...f.hero, title: v } })} />
            <LocField label={t('زر 1', 'Button 1')} value={f.hero.btn1} onChange={(v) => patch({ hero: { ...f.hero, btn1: v } })} />
            <LocField label={t('زر 2', 'Button 2')} value={f.hero.btn2} onChange={(v) => patch({ hero: { ...f.hero, btn2: v } })} />
          </>
        )}

        {sec === 'about' && (
          <>
            <LocField label={t('النبذة', 'Bio')} multiline value={f.about.text} onChange={(v) => patch({ about: { ...f.about, text: v } })} />
            <LocField label={t('الوسوم (مفصولة بفاصلة)', 'Tags (comma separated)')} value={f.about.tags} onChange={(v) => patch({ about: { ...f.about, tags: v } })} />
          </>
        )}

        {sec === 'expertise' && (
          <>
            <LocField label={t('عنوان القسم', 'Section title')} value={f.expertise.title} onChange={(v) => patch({ expertise: { ...f.expertise, title: v } })} />
            {f.expertise.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ expertise: { ...f.expertise, items: f.expertise.items.filter((_, j) => j !== i) } })}>
                <LocField label={t('العنوان', 'Title')} value={it.title} onChange={(v) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, title: v } : x)) } })} />
                <LocField label={t('الوصف', 'Description')} multiline value={it.description} onChange={(v) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, description: v } : x)) } })} />
                <label className="lbl">{t('أيقونة', 'Icon')}</label>
                <MediaUploader compact previewUrl={it.iconUrl} onUploaded={(u) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, iconId: u.id, iconUrl: u.thumbUrl } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ expertise: { ...f.expertise, items: [...f.expertise.items, { title: emptyLoc(), description: emptyLoc(), iconId: null, iconUrl: null }] } })}>+ {t('خدمة', 'Service')}</button>
          </>
        )}

        {sec === 'experience' && (
          <>
            {f.experience.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ experience: { items: f.experience.items.filter((_, j) => j !== i) } })}>
                <label className="lbl">{t('الشركة', 'Company')}</label>
                <input className="field" value={it.company} onChange={(e) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, company: e.target.value } : x)) } })} />
                <LocField label={t('المسمى الوظيفي', 'Job title')} value={it.role} onChange={(v) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, role: v } : x)) } })} />
                <label className="lbl">{t('الفترة', 'Period')}</label>
                <input className="field" value={it.period} onChange={(e) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)) } })} />
                <LocField label={t('الوصف', 'Description')} multiline value={it.description} onChange={(v) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, description: v } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ experience: { items: [...f.experience.items, { company: '', role: emptyLoc(), period: '', description: emptyLoc() }] } })}>+ {t('خبرة', 'Experience')}</button>
          </>
        )}

        {sec === 'education' && (
          <>
            {f.education.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ education: { items: f.education.items.filter((_, j) => j !== i) } })}>
                <LocField label={t('المؤهل', 'Degree')} value={it.title} onChange={(v) => patch({ education: { items: f.education.items.map((x, j) => (j === i ? { ...x, title: v } : x)) } })} />
                <LocField label={t('الجهة', 'Institution')} value={it.org} onChange={(v) => patch({ education: { items: f.education.items.map((x, j) => (j === i ? { ...x, org: v } : x)) } })} />
                <label className="lbl">{t('الفترة', 'Period')}</label>
                <input className="field" value={it.period} onChange={(e) => patch({ education: { items: f.education.items.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ education: { items: [...f.education.items, { title: emptyLoc(), org: emptyLoc(), period: '', description: emptyLoc() }] } })}>+ {t('مؤهل', 'Qualification')}</button>
          </>
        )}

        {sec === 'skills' && (
          <LocField label={t('المهارات (مفصولة بفاصلة)', 'Skills (comma separated)')} value={f.skills.items} onChange={(v) => patch({ skills: { items: v } })} />
        )}

        {sec === 'tools' && (
          <>
            {f.tools.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ tools: { items: f.tools.items.filter((_, j) => j !== i) } })}>
                <label className="lbl">{t('الاسم', 'Name')}</label>
                <input className="field" value={it.name} onChange={(e) => patch({ tools: { items: f.tools.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } })} />
                <label className="lbl">{t('أيقونة', 'Icon')}</label>
                <MediaUploader compact previewUrl={it.iconUrl} onUploaded={(u) => patch({ tools: { items: f.tools.items.map((x, j) => (j === i ? { ...x, iconId: u.id, iconUrl: u.thumbUrl } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ tools: { items: [...f.tools.items, { name: '', iconId: null, iconUrl: null }] } })}>+ {t('أداة', 'Tool')}</button>
          </>
        )}

        {sec === 'projects' && (
          <>
            <LocField label={t('عنوان قسم المشاريع', 'Projects section title')} value={f.projects.title} onChange={(v) => patch({ projects: { ...f.projects, title: v } })} />
            <LocField label={t('العنوان الفرعي', 'Subtitle')} value={f.projects.subtitle} onChange={(v) => patch({ projects: { ...f.projects, subtitle: v } })} />
          </>
        )}

        {sec === 'contact' && (
          <>
            <LocField label={t('العنوان', 'Title')} value={f.contact.title} onChange={(v) => patch({ contact: { ...f.contact, title: v } })} />
            <LocField label={t('العنوان الفرعي', 'Subtitle')} value={f.contact.subtitle} onChange={(v) => patch({ contact: { ...f.contact, subtitle: v } })} />
            <label className="lbl">{t('البريد الإلكتروني', 'Email')}</label>
            <input className="field" dir="ltr" value={f.contact.email} onChange={(e) => patch({ contact: { ...f.contact, email: e.target.value } })} style={{ textAlign: 'start' }} />
            <label className="lbl">{t('الهاتف', 'Phone')}</label>
            <input className="field" dir="ltr" value={f.contact.phone} onChange={(e) => patch({ contact: { ...f.contact, phone: e.target.value } })} style={{ textAlign: 'start' }} />
          </>
        )}
      </div>

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
