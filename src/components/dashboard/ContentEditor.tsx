'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveContent } from '@/lib/content-actions'
import {
  CONTENT_SECTIONS,
  emptyLoc,
  type ContentForm,
  type ExpertiseItem,
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

/**
 * Tags, one row per tag instead of a single comma-separated box.
 *
 * Still stored as a comma-separated string per locale — splitting here rather
 * than changing the schema keeps existing content working untouched.
 */
function TagsField({
  label,
  value,
  onChange,
}: {
  label: string
  value: Loc
  onChange: (v: Loc) => void
}) {
  const { t } = useDashLang()
  const split = (str: string) => str.split(',').map((x) => x.trim())
  const ar = split(value.ar)
  const en = split(value.en)
  const pairs = Array.from({ length: Math.max(ar.length, en.length) }, (_, i) => ({
    ar: ar[i] ?? '',
    en: en[i] ?? '',
  }))
  // Blanks are dropped on the way out so an empty row never becomes a pill.
  const commit = (next: { ar: string; en: string }[]) =>
    onChange({
      ar: next.map((p) => p.ar.trim()).filter(Boolean).join(','),
      en: next.map((p) => p.en.trim()).filter(Boolean).join(','),
    })

  return (
    <div style={{ marginBottom: 14 }}>
      <label className="lbl" style={{ display: 'block' }}>
        {label}
      </label>
      {pairs.map((p, i) => (
        <div className="tag-row" key={i}>
          <input
            className="field"
            placeholder={t('عربي', 'Arabic')}
            value={p.ar}
            onChange={(e) => commit(pairs.map((x, j) => (j === i ? { ...x, ar: e.target.value } : x)))}
          />
          <input
            className="field"
            dir="ltr"
            placeholder="English"
            style={{ textAlign: 'start' }}
            value={p.en}
            onChange={(e) => commit(pairs.map((x, j) => (j === i ? { ...x, en: e.target.value } : x)))}
          />
          <button className="icon-btn del" title={t('حذف', 'Remove')} onClick={() => commit(pairs.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button className="btn btn-ghost" onClick={() => commit([...pairs, { ar: '', en: '' }])}>
        + {t('وسم', 'Tag')}
      </button>
    </div>
  )
}

/**
 * One service, drawn the way the public card is drawn, with its picture, icon
 * and delete controls sitting on it.
 *
 * The icon and the background could only be replaced before, never removed:
 * once a picture was attached the card was stuck with one.
 */
function ServicePreview({
  item,
  onIcon,
  onImage,
  onClearIcon,
  onClearImage,
}: {
  item: ExpertiseItem
  onIcon: (u: { id: number; thumbUrl: string | null }) => void
  onImage: (u: { id: number; thumbUrl: string | null }) => void
  onClearIcon: () => void
  onClearImage: () => void
}) {
  const { t, lang } = useDashLang()
  const pick = (v: { ar: string; en: string }) => v[lang] || v.ar || v.en

  return (
    <div className={`svc-preview${item.imageUrl ? ' has-bg' : ''}`}>
      {item.imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="svc-bg"
            src={item.imageUrl}
            alt=""
            style={{
              transform: `scale(${(item.bgZoom ?? 100) / 100})`,
              objectPosition: `${item.bgPosX ?? 50}% ${item.bgPosY ?? 50}%`,
            }}
          />
          <span className="svc-dim" style={{ opacity: (item.bgOverlay ?? 45) / 100 }} />
        </>
      )}

      <div className="svc-tools">
        <MediaUploader compact label={item.imageUrl ? t('تغيير الصورة', 'Change image') : t('صورة خلفية', 'Background')} onUploaded={onImage} />
        {item.imageUrl && (
          <button type="button" className="svc-tool-btn del" onClick={onClearImage}>
            {t('حذف الصورة', 'Remove image')}
          </button>
        )}
        <MediaUploader compact label={item.iconUrl ? t('تغيير الأيقونة', 'Change icon') : t('أيقونة', 'Icon')} onUploaded={onIcon} />
        {item.iconUrl && (
          <button type="button" className="svc-tool-btn del" onClick={onClearIcon}>
            {t('حذف الأيقونة', 'Remove icon')}
          </button>
        )}
      </div>

      <div className="svc-body">
        <div className="ic">
          {item.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.iconUrl} alt="" width={22} height={22} />
          ) : (
            <span>◆</span>
          )}
        </div>
        <h4>{pick(item.title) || t('بدون عنوان', 'Untitled')}</h4>
        {pick(item.description) && <p>{pick(item.description)}</p>}
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
  const setEx = (i: number, p: Partial<ExpertiseItem>) =>
    patch({
      expertise: {
        ...f.expertise,
        items: f.expertise.items.map((x, j) => (j === i ? { ...x, ...p } : x)),
      },
    })

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
            <LocField label={t('عنوان القسم', 'Section title')} value={f.about.title} onChange={(v) => patch({ about: { ...f.about, title: v } })} />
            <LocField label={t('النبذة', 'Bio')} multiline value={f.about.text} onChange={(v) => patch({ about: { ...f.about, text: v } })} />
            <TagsField
              label={t('الوسوم', 'Tags')}
              value={f.about.tags}
              onChange={(v) => patch({ about: { ...f.about, tags: v } })}
            />
          </>
        )}

        {sec === 'expertise' && (
          <>
            <LocField label={t('عنوان القسم', 'Section title')} value={f.expertise.title} onChange={(v) => patch({ expertise: { ...f.expertise, title: v } })} />
            {f.expertise.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ expertise: { ...f.expertise, items: f.expertise.items.filter((_, j) => j !== i) } })}>
                {/* The card as the site will draw it, with its controls on top —
                    the fields underneath used to be the only view of it, so you
                    picked a picture and a dim level without seeing either. */}
                <ServicePreview
                  item={it}
                  onIcon={(u) => setEx(i, { iconId: u.id, iconUrl: u.thumbUrl })}
                  onImage={(u) => setEx(i, { imageId: u.id, imageUrl: u.thumbUrl })}
                  onClearIcon={() => setEx(i, { iconId: null, iconUrl: null })}
                  onClearImage={() => setEx(i, { imageId: null, imageUrl: null })}
                />
                <LocField label={t('العنوان', 'Title')} value={it.title} onChange={(v) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, title: v } : x)) } })} />
                <LocField label={t('الوصف', 'Description')} multiline value={it.description} onChange={(v) => patch({ expertise: { ...f.expertise, items: f.expertise.items.map((x, j) => (j === i ? { ...x, description: v } : x)) } })} />
                {it.imageUrl && (
                  <div className="bg-ctrls">
                    <label className="lbl">{t('الزوم', 'Zoom')} — {it.bgZoom}%</label>
                    <input type="range" min={100} max={220} value={it.bgZoom} onChange={(e) => setEx(i, { bgZoom: Number(e.target.value) })} />
                    <label className="lbl">{t('التعتيم', 'Dim')} — {it.bgOverlay}%</label>
                    <input type="range" min={0} max={90} value={it.bgOverlay} onChange={(e) => setEx(i, { bgOverlay: Number(e.target.value) })} />
                    <label className="lbl">{t('الموضع ↔', 'Position ↔')} — {it.bgPosX}%</label>
                    <input type="range" min={0} max={100} value={it.bgPosX} onChange={(e) => setEx(i, { bgPosX: Number(e.target.value) })} />
                    <label className="lbl">{t('الموضع ↕', 'Position ↕')} — {it.bgPosY}%</label>
                    <input type="range" min={0} max={100} value={it.bgPosY} onChange={(e) => setEx(i, { bgPosY: Number(e.target.value) })} />
                  </div>
                )}
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ expertise: { ...f.expertise, items: [...f.expertise.items, { title: emptyLoc(), description: emptyLoc(), iconId: null, iconUrl: null, imageId: null, imageUrl: null, bgZoom: 100, bgOverlay: 45, bgPosX: 50, bgPosY: 50 }] } })}>+ {t('خدمة', 'Service')}</button>
          </>
        )}

        {sec === 'experience' && (
          <>
            <LocField label={t('عنوان القسم', 'Section title')} value={f.experience.title} onChange={(v) => patch({ experience: { ...f.experience, title: v } })} />
            {f.experience.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ experience: { ...f.experience, items: f.experience.items.filter((_, j) => j !== i) } })}>
                <label className="lbl">{t('الشركة', 'Company')}</label>
                <input className="field" value={it.company} onChange={(e) => patch({ experience: { ...f.experience, items: f.experience.items.map((x, j) => (j === i ? { ...x, company: e.target.value } : x)) } })} />
                <LocField label={t('المسمى الوظيفي', 'Job title')} value={it.role} onChange={(v) => patch({ experience: { ...f.experience, items: f.experience.items.map((x, j) => (j === i ? { ...x, role: v } : x)) } })} />
                <label className="lbl">{t('الفترة', 'Period')}</label>
                <input className="field" value={it.period} onChange={(e) => patch({ experience: { ...f.experience, items: f.experience.items.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)) } })} />
                <LocField label={t('الوصف', 'Description')} multiline value={it.description} onChange={(v) => patch({ experience: { ...f.experience, items: f.experience.items.map((x, j) => (j === i ? { ...x, description: v } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ experience: { ...f.experience, items: [...f.experience.items, { company: '', role: emptyLoc(), period: '', description: emptyLoc() }] } })}>+ {t('خبرة', 'Experience')}</button>
          </>
        )}

        {sec === 'education' && (
          <>
            <LocField label={t('عنوان القسم', 'Section title')} value={f.education.title} onChange={(v) => patch({ education: { ...f.education, title: v } })} />
            {f.education.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ education: { ...f.education, items: f.education.items.filter((_, j) => j !== i) } })}>
                <LocField label={t('المؤهل', 'Degree')} value={it.title} onChange={(v) => patch({ education: { ...f.education, items: f.education.items.map((x, j) => (j === i ? { ...x, title: v } : x)) } })} />
                <LocField label={t('الجهة', 'Institution')} value={it.org} onChange={(v) => patch({ education: { ...f.education, items: f.education.items.map((x, j) => (j === i ? { ...x, org: v } : x)) } })} />
                <label className="lbl">{t('الفترة', 'Period')}</label>
                <input className="field" value={it.period} onChange={(e) => patch({ education: { ...f.education, items: f.education.items.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ education: { ...f.education, items: [...f.education.items, { title: emptyLoc(), org: emptyLoc(), period: '', description: emptyLoc() }] } })}>+ {t('مؤهل', 'Qualification')}</button>
          </>
        )}

        {sec === 'skills' && (
          <>
            <LocField label={t('عنوان القسم', 'Section title')} value={f.skills.title} onChange={(v) => patch({ skills: { ...f.skills, title: v } })} />
            <LocField label={t('المهارات (مفصولة بفاصلة)', 'Skills (comma separated)')} value={f.skills.items} onChange={(v) => patch({ skills: { ...f.skills, items: v } })} />
          </>
        )}

        {sec === 'tools' && (
          <>
            <LocField label={t('عنوان القسم', 'Section title')} value={f.tools.title} onChange={(v) => patch({ tools: { ...f.tools, title: v } })} />
            {f.tools.items.map((it, i) => (
              <ArrayCard key={i} onRemove={() => patch({ tools: { ...f.tools, items: f.tools.items.filter((_, j) => j !== i) } })}>
                <label className="lbl">{t('الاسم', 'Name')}</label>
                <input className="field" value={it.name} onChange={(e) => patch({ tools: { ...f.tools, items: f.tools.items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) } })} />
                <label className="lbl">{t('أيقونة', 'Icon')}</label>
                <MediaUploader compact previewUrl={it.iconUrl} onUploaded={(u) => patch({ tools: { ...f.tools, items: f.tools.items.map((x, j) => (j === i ? { ...x, iconId: u.id, iconUrl: u.thumbUrl } : x)) } })} />
              </ArrayCard>
            ))}
            <button className="btn btn-ghost" onClick={() => patch({ tools: { ...f.tools, items: [...f.tools.items, { name: '', iconId: null, iconUrl: null }] } })}>+ {t('أداة', 'Tool')}</button>
          </>
        )}

        {sec === 'projects' && (
          <>
            <LocField label={t('عنوان قسم المشاريع', 'Projects section title')} value={f.projects.title} onChange={(v) => patch({ projects: { ...f.projects, title: v } })} />
            <LocField label={t('العنوان الفرعي', 'Subtitle')} value={f.projects.subtitle} onChange={(v) => patch({ projects: { ...f.projects, subtitle: v } })} />
          </>
        )}

        {sec === 'clients' && (
          <LocField label={t('عنوان القسم', 'Section title')} value={f.clients.title} onChange={(v) => patch({ clients: { ...f.clients, title: v } })} />
        )}

        {sec === 'testimonials' && (
          <LocField label={t('عنوان القسم', 'Section title')} value={f.testimonials.title} onChange={(v) => patch({ testimonials: { ...f.testimonials, title: v } })} />
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
