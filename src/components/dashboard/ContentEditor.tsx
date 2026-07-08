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
  const Cmp = (multiline ? 'textarea' : 'input') as 'input'
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="lbl" style={{ display: 'block' }}>
        {label}
      </label>
      <div className="grid-2">
        <Cmp
          className="field"
          placeholder="عربي"
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
        title="المحتوى"
        subtitle="نصوص كل قسم بالعربي والإنجليزي"
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '...' : '💾 حفظ'}
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
            <LocField label="الاسم" value={f.hero.name} onChange={(v) => patch({ hero: { ...f.hero, name: v } })} />
            <LocField label="التخصص / العنوان" value={f.hero.title} onChange={(v) => patch({ hero: { ...f.hero, title: v } })} />
            <LocField label="زر 1" value={f.hero.btn1} onChange={(v) => patch({ hero: { ...f.hero, btn1: v } })} />
            <LocField label="زر 2" value={f.hero.btn2} onChange={(v) => patch({ hero: { ...f.hero, btn2: v } })} />
          </>
        )}

        {sec === 'about' && (
          <>
            <LocField label="النبذة" multiline value={f.about.text} onChange={(v) => patch({ about: { ...f.about, text: v } })} />
            <LocField label="الوسوم (مفصولة بفاصلة)" value={f.about.tags} onChange={(v) => patch({ about: { ...f.about, tags: v } })} />
          </>
        )}

        {sec === 'expertise' && (
          <>
            <LocField label="عنوان القسم" value={f.expertise.title} onChange={(v) => patch({ expertise: { ...f.expertise, title: v } })} />
            {f.expertise.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ expertise: { ...f.expertise, items: f.expertise.items.filter((_, j) => j !== i) } })}>
                <LocField label="العنوان" value={it.title} onChange={(v) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, title: v } : x)) } })} />
                <LocField label="الوصف" multiline value={it.description} onChange={(v) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, description: v } : x)) } })} />
                <label className="lbl">أيقونة</label>
                <MediaUploader compact previewUrl={it.iconUrl} onUploaded={(u) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, iconId: u.id, iconUrl: u.thumbUrl } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ expertise: { ...f.expertise, items: [...f.expertise.items, { title: emptyLoc(), description: emptyLoc(), iconId: null, iconUrl: null }] } })}>+ خدمة</button>
          </>
        )}

        {sec === 'experience' && (
          <>
            {f.experience.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ experience: { items: f.experience.items.filter((_, j) => j !== i) } })}>
                <label className="lbl">الشركة</label>
                <input className="field" value={it.company} onChange={(e) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, company: e.target.value } : x)) } })} />
                <LocField label="المسمى الوظيفي" value={it.role} onChange={(v) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, role: v } : x)) } })} />
                <label className="lbl">الفترة</label>
                <input className="field" value={it.period} onChange={(e) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)) } })} />
                <LocField label="الوصف" multiline value={it.description} onChange={(v) => patch({ experience: { items: f.experience.items.map((x, j) => (j === i ? { ...x, description: v } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ experience: { items: [...f.experience.items, { company: '', role: emptyLoc(), period: '', description: emptyLoc() }] } })}>+ خبرة</button>
          </>
        )}

        {sec === 'education' && (
          <>
            {f.education.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ education: { items: f.education.items.filter((_, j) => j !== i) } })}>
                <LocField label="المؤهل" value={it.title} onChange={(v) => patch({ education: { items: f.education.items.map((x, j) => (j === i ? { ...x, title: v } : x)) } })} />
                <LocField label="الجهة" value={it.org} onChange={(v) => patch({ education: { items: f.education.items.map((x, j) => (j === i ? { ...x, org: v } : x)) } })} />
                <label className="lbl">الفترة</label>
                <input className="field" value={it.period} onChange={(e) => patch({ education: { items: f.education.items.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ education: { items: [...f.education.items, { title: emptyLoc(), org: emptyLoc(), period: '', description: emptyLoc() }] } })}>+ مؤهل</button>
          </>
        )}

        {sec === 'skills' && (
          <LocField label="المهارات (مفصولة بفاصلة)" value={f.skills.items} onChange={(v) => patch({ skills: { items: v } })} />
        )}

        {sec === 'tools' && (
          <>
            {f.tools.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ tools: { items: f.tools.items.filter((_, j) => j !== i) } })}>
                <label className="lbl">الاسم</label>
                <input className="field" value={it.name} onChange={(e) => patch({ tools: { items: f.tools.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } })} />
                <label className="lbl">أيقونة</label>
                <MediaUploader compact previewUrl={it.iconUrl} onUploaded={(u) => patch({ tools: { items: f.tools.items.map((x, j) => (j === i ? { ...x, iconId: u.id, iconUrl: u.thumbUrl } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ tools: { items: [...f.tools.items, { name: '', iconId: null, iconUrl: null }] } })}>+ أداة</button>
          </>
        )}

        {sec === 'projects' && (
          <>
            <LocField label="عنوان قسم المشاريع" value={f.projects.title} onChange={(v) => patch({ projects: { ...f.projects, title: v } })} />
            <LocField label="العنوان الفرعي" value={f.projects.subtitle} onChange={(v) => patch({ projects: { ...f.projects, subtitle: v } })} />
          </>
        )}

        {sec === 'contact' && (
          <>
            <LocField label="العنوان" value={f.contact.title} onChange={(v) => patch({ contact: { ...f.contact, title: v } })} />
            <LocField label="العنوان الفرعي" value={f.contact.subtitle} onChange={(v) => patch({ contact: { ...f.contact, subtitle: v } })} />
            <label className="lbl">البريد الإلكتروني</label>
            <input className="field" dir="ltr" value={f.contact.email} onChange={(e) => patch({ contact: { ...f.contact, email: e.target.value } })} style={{ textAlign: 'start' }} />
            <label className="lbl">الهاتف</label>
            <input className="field" dir="ltr" value={f.contact.phone} onChange={(e) => patch({ contact: { ...f.contact, phone: e.target.value } })} style={{ textAlign: 'start' }} />
          </>
        )}
      </div>

      {toast && <div className="toast">تم الحفظ ✓</div>}
    </div>
  )
}
