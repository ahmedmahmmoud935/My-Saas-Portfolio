'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import { saveLanding } from '@/lib/landing-actions'
import { LANDING_COPY } from '@/lib/landing-copy'

type Copy = (typeof LANDING_COPY)['ar']
type Form = { ar: Copy; en: Copy }

const SECTIONS = [
  { id: 'header', ar: 'الهيدر', en: 'Header' },
  { id: 'hero', ar: 'القسم الرئيسي', en: 'Hero' },
  { id: 'titles', ar: 'عناوين الأقسام', en: 'Section titles' },
  { id: 'features', ar: 'المميزات', en: 'Features' },
  { id: 'faq', ar: 'الأسئلة', en: 'FAQ' },
  { id: 'cta', ar: 'دعوة الفعل', en: 'Call to action' },
  { id: 'footer', ar: 'الفوتر', en: 'Footer' },
] as const

/* Bilingual text field (AR + EN side by side). */
function Field({
  label,
  ar,
  en,
  onAr,
  onEn,
  multiline,
}: {
  label: string
  ar: string
  en: string
  onAr: (v: string) => void
  onEn: (v: string) => void
  multiline?: boolean
}) {
  const { t } = useDashLang()
  const C = (multiline ? 'textarea' : 'input') as 'input'
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="lbl" style={{ display: 'block' }}>{label}</label>
      <div className="grid-2">
        <C className="field" placeholder={t('عربي', 'Arabic')} value={ar} onChange={(e) => onAr(e.target.value)} {...(multiline ? { rows: 2 } : {})} />
        <C className="field" dir="ltr" placeholder="English" value={en} onChange={(e) => onEn(e.target.value)} style={{ textAlign: 'start' }} {...(multiline ? { rows: 2 } : {})} />
      </div>
    </div>
  )
}

export default function LandingEditor({ initial }: { initial: Form }) {
  const [f, setF] = useState<Form>(initial)
  const [sec, setSec] = useState<(typeof SECTIONS)[number]['id']>('hero')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)
  const { t } = useDashLang()

  // Deep-ish setters over the two locale copies.
  const setKey = (key: keyof Copy, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], [key]: v } }))
  const setNav = (key: keyof Copy['nav'], v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], nav: { ...p[loc].nav, [key]: v } } }))
  const setArr = <K extends 'features' | 'faqs'>(arr: K, i: number, field: string, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        [arr]: (p[loc][arr] as Record<string, string>[]).map((x, j) => (j === i ? { ...x, [field]: v } : x)),
      },
    }))

  const scalar = (key: keyof Copy, label: string, multiline?: boolean) => (
    <Field
      label={label}
      ar={String(f.ar[key] ?? '')}
      en={String(f.en[key] ?? '')}
      onAr={(v) => setKey(key, v, 'ar')}
      onEn={(v) => setKey(key, v, 'en')}
      multiline={multiline}
    />
  )

  async function save() {
    setBusy(true)
    await saveLanding(f.ar, f.en)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="🌍"
        title={t('الصفحة الرئيسية', 'Landing page')}
        subtitle={t('عدّل نصوص وهوية صفحة الموقع الرئيسية', 'Edit the marketing landing page copy')}
        actions={<button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? '…' : t('💾 حفظ', '💾 Save')}</button>}
      />

      <div className="cat-pills" style={{ marginBottom: 18 }}>
        {SECTIONS.map((s) => (
          <button key={s.id} className={`pill ${sec === s.id ? 'active' : ''}`} onClick={() => setSec(s.id)}>
            {t(s.ar, s.en)}
          </button>
        ))}
      </div>

      <div className="panel">
        {sec === 'header' && (
          <>
            <Field label={t('رابط: المميزات', 'Nav: Features')} ar={f.ar.nav.features} en={f.en.nav.features} onAr={(v) => setNav('features', v, 'ar')} onEn={(v) => setNav('features', v, 'en')} />
            <Field label={t('رابط: الطريقة', 'Nav: How')} ar={f.ar.nav.how} en={f.en.nav.how} onAr={(v) => setNav('how', v, 'ar')} onEn={(v) => setNav('how', v, 'en')} />
            <Field label={t('رابط: أمثلة', 'Nav: Showcase')} ar={f.ar.nav.showcase} en={f.en.nav.showcase} onAr={(v) => setNav('showcase', v, 'ar')} onEn={(v) => setNav('showcase', v, 'en')} />
            <Field label={t('رابط: الأسعار', 'Nav: Pricing')} ar={f.ar.nav.pricing} en={f.en.nav.pricing} onAr={(v) => setNav('pricing', v, 'ar')} onEn={(v) => setNav('pricing', v, 'en')} />
            <Field label={t('رابط: الأسئلة', 'Nav: FAQ')} ar={f.ar.nav.faq} en={f.en.nav.faq} onAr={(v) => setNav('faq', v, 'ar')} onEn={(v) => setNav('faq', v, 'en')} />
            {scalar('login', t('زر الدخول', 'Login button'))}
            {scalar('cta', t('زر ابدأ', 'Start button'))}
          </>
        )}

        {sec === 'hero' && (
          <>
            {scalar('heroEyebrow', t('السطر العلوي', 'Eyebrow'))}
            {scalar('heroTitle', t('العنوان', 'Title'))}
            {scalar('heroTitleAccent', t('الكلمة المميّزة', 'Accent word'))}
            {scalar('heroSub', t('الوصف', 'Subtitle'), true)}
            {scalar('heroBtn1', t('زر 1', 'Button 1'))}
            {scalar('heroBtn2', t('زر 2', 'Button 2'))}
          </>
        )}

        {sec === 'titles' && (
          <>
            {scalar('featuresTitle', t('عنوان المميزات', 'Features title'))}
            {scalar('howTitle', t('عنوان الطريقة', 'How-it-works title'))}
            {scalar('showcaseTitle', t('عنوان الأمثلة', 'Showcase title'))}
            {scalar('showcaseEmpty', t('نص لا يوجد أمثلة', 'Showcase empty text'))}
            {scalar('visit', t('كلمة «زيارة»', '“Visit” label'))}
            {scalar('pricingTitle', t('عنوان الأسعار', 'Pricing title'))}
            {scalar('faqTitle', t('عنوان الأسئلة', 'FAQ title'))}
          </>
        )}

        {sec === 'features' && (
          <>
            {f.ar.features.map((_, i) => (
              <div className="mod-card" key={i}>
                <div className="mod-card-head"><span /><strong style={{ color: 'var(--sub)' }}>#{i + 1}</strong></div>
                <Field label={t('العنوان', 'Title')} ar={f.ar.features[i].t} en={f.en.features[i].t} onAr={(v) => setArr('features', i, 't', v, 'ar')} onEn={(v) => setArr('features', i, 't', v, 'en')} />
                <Field label={t('الوصف', 'Description')} ar={f.ar.features[i].d} en={f.en.features[i].d} onAr={(v) => setArr('features', i, 'd', v, 'ar')} onEn={(v) => setArr('features', i, 'd', v, 'en')} multiline />
              </div>
            ))}
          </>
        )}

        {sec === 'faq' && (
          <>
            {f.ar.faqs.map((_, i) => (
              <div className="mod-card" key={i}>
                <div className="mod-card-head"><span /><strong style={{ color: 'var(--sub)' }}>#{i + 1}</strong></div>
                <Field label={t('السؤال', 'Question')} ar={f.ar.faqs[i].q} en={f.en.faqs[i].q} onAr={(v) => setArr('faqs', i, 'q', v, 'ar')} onEn={(v) => setArr('faqs', i, 'q', v, 'en')} />
                <Field label={t('الإجابة', 'Answer')} ar={f.ar.faqs[i].a} en={f.en.faqs[i].a} onAr={(v) => setArr('faqs', i, 'a', v, 'ar')} onEn={(v) => setArr('faqs', i, 'a', v, 'en')} multiline />
              </div>
            ))}
          </>
        )}

        {sec === 'cta' && (
          <>
            {scalar('ctaTitle', t('العنوان', 'Title'))}
            {scalar('ctaSub', t('الوصف', 'Subtitle'), true)}
            {scalar('ctaBtn', t('الزر', 'Button'))}
          </>
        )}

        {sec === 'footer' && <>{scalar('rights', t('حقوق النشر', 'Copyright text'))}</>}
      </div>

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
