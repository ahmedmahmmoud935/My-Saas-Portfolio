'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import MediaUploader from './MediaUploader'
import SectionBgRows from './SectionBgRows'
import { ColorInput, Opt } from './controls'
import { saveLanding, type LandingImages, type LandingStyle, type LandingTheme, type LandingTools } from '@/lib/landing-actions'
import { LANDING_COPY } from '@/lib/landing-copy'
import {
  DARK_PALETTES,
  LIGHT_PALETTES,
  LANDING_BG_SECTIONS,
  type SectionBgForm,
} from '@/lib/design-types'

type Copy = (typeof LANDING_COPY)['ar']
type Form = {
  ar: Copy
  en: Copy
  theme: LandingTheme
  images: LandingImages
  style: LandingStyle
  tools: LandingTools
  sectionBg: SectionBgForm[]
}

const SECTIONS = [
  { id: 'header', ar: 'الهيدر', en: 'Header' },
  { id: 'hero', ar: 'القسم الرئيسي', en: 'Hero' },
  { id: 'titles', ar: 'عناوين الأقسام', en: 'Section titles' },
  { id: 'features', ar: 'المميزات', en: 'Features' },
  { id: 'how', ar: 'الخطوات', en: 'Steps' },
  { id: 'compare', ar: 'المقارنة', en: 'Comparison' },
  { id: 'faq', ar: 'الأسئلة', en: 'FAQ' },
  { id: 'cta', ar: 'دعوة الفعل', en: 'Call to action' },
  { id: 'footer', ar: 'الفوتر', en: 'Footer' },
  { id: 'style', ar: 'الألوان', en: 'Colours' },
  { id: 'cards', ar: 'شكل الكروت', en: 'Card style' },
  { id: 'backgrounds', ar: 'خلفيات الأقسام', en: 'Section backgrounds' },
  { id: 'images', ar: 'الصور', en: 'Images' },
  { id: 'tools', ar: 'أدوات جوجل', en: 'Google tools' },
] as const

/**
 * One icon: a file you upload, or a character you type.
 *
 * The uploaded one wins whenever it is there, so the typed character is the
 * fallback rather than a competing setting — and clearing the upload brings it
 * straight back without anything to retype.
 *
 * Both are shared between the two languages on purpose. A picture doesn't get
 * translated, and a copy per locale means setting it twice and watching the
 * Arabic and English pages drift apart.
 */
function IconInput({
  label,
  value,
  url,
  onChange,
  onUrl,
}: {
  label: string
  value: string
  url?: string
  onChange: (v: string) => void
  onUrl: (v: string) => void
}) {
  const { t } = useDashLang()
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="lbl" style={{ display: 'block' }}>{label}</label>
      <div className="icon-picker">
        <MediaUploader
          compact
          accept="image/*"
          previewUrl={url || null}
          onUploaded={(m) => onUrl(m.thumbUrl || m.url || '')}
          onRemove={url ? () => onUrl('') : undefined}
        />
        <div className="icon-alt">
          <span className="icon-alt-note">
            {url
              ? t('الصورة المرفوعة هي الظاهرة', 'The uploaded image is what shows')
              : t('أو اكتب رمزاً', 'Or type a character')}
          </span>
          <input
            className="field icon-field"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={8}
            disabled={Boolean(url)}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * A fixed-length list of one-line strings, in both languages — the two sides
 * of the comparison, and anything else shaped like them.
 */
function ListField({
  label,
  ar,
  en,
  onAr,
  onEn,
}: {
  label: string
  ar: string[]
  en: string[]
  onAr: (i: number, v: string) => void
  onEn: (i: number, v: string) => void
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="lbl" style={{ display: 'block', marginBottom: 8 }}>{label}</label>
      {ar.map((_, i) => (
        <div className="grid-2" key={i} style={{ marginBottom: 8 }}>
          <input className="field" value={ar[i] ?? ''} onChange={(e) => onAr(i, e.target.value)} />
          <input className="field" dir="ltr" value={en[i] ?? ''} onChange={(e) => onEn(i, e.target.value)} style={{ textAlign: 'start' }} />
        </div>
      ))}
    </div>
  )
}

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
  const [light, setLight] = useState(false)
  const [toast, setToast] = useState(false)
  const { t } = useDashLang()

  // Deep-ish setters over the two locale copies.
  const setTheme = (p: Partial<LandingTheme>) => setF((f0) => ({ ...f0, theme: { ...f0.theme, ...p } }))
  const setImages = (p: Partial<LandingImages>) => setF((f0) => ({ ...f0, images: { ...f0.images, ...p } }))
  const setSectionBg = (rows: SectionBgForm[]) => setF((f0) => ({ ...f0, sectionBg: rows }))
  const setStyle = (p: Partial<LandingStyle>) => setF((f0) => ({ ...f0, style: { ...f0.style, ...p } }))
  const setTools = (p: Partial<LandingTools>) => setF((f0) => ({ ...f0, tools: { ...f0.tools, ...p } }))
  // Which half of the palette the Colours tab is editing.
  const k = light
    ? { accent: 'accentLight', bg: 'bgLight', bg2: 'bg2Light', text: 'textLight', sub: 'subtextLight' }
    : { accent: 'accent', bg: 'bg', bg2: 'bg2', text: 'text', sub: 'subtext' }
  const tv = (key: string) => (f.theme as unknown as Record<string, string>)[key] || ''
  const setKey = (key: keyof Copy, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], [key]: v } }))
  const setNav = (key: keyof Copy['nav'], v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], nav: { ...p[loc].nav, [key]: v } } }))
  const setMetric = (key: keyof Copy['metricsLabels'], v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], metricsLabels: { ...p[loc].metricsLabels, [key]: v } } }))
  const setMockName = (v: string, loc: 'ar' | 'en') =>
    setF((p) => ({ ...p, [loc]: { ...p[loc], mock: { ...p[loc].mock, panel: v } } }))
  const setMockList = (key: 'items' | 'circles' | 'cards', i: number, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        mock: { ...p[loc].mock, [key]: p[loc].mock[key].map((x, j) => (j === i ? v : x)) },
      },
    }))
  const setArr = <K extends 'features' | 'faqs' | 'how'>(arr: K, i: number, field: string, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: {
        ...p[loc],
        [arr]: (p[loc][arr] as Record<string, string>[]).map((x, j) => (j === i ? { ...x, [field]: v } : x)),
      },
    }))

  // Icons and step markers aren't translated, so one edit lands in both copies.
  const setArrBoth = <K extends 'features' | 'how'>(arr: K, i: number, field: string, v: string) =>
    setF((p) => {
      const patch = (loc: 'ar' | 'en') =>
        (p[loc][arr] as Record<string, string>[]).map((x, j) => (j === i ? { ...x, [field]: v } : x))
      return { ...p, ar: { ...p.ar, [arr]: patch('ar') }, en: { ...p.en, [arr]: patch('en') } }
    })

  // The two comparison columns are plain string lists, so they need a setter
  // that reaches an index rather than a named field.
  const setList = (key: 'compareOld' | 'compareNew', i: number, v: string, loc: 'ar' | 'en') =>
    setF((p) => ({
      ...p,
      [loc]: { ...p[loc], [key]: p[loc][key].map((x, j) => (j === i ? v : x)) },
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
    await saveLanding(f.ar, f.en, f.theme, f.images, f.sectionBg, f.style, f.tools)
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
            <Field label={t('رابط: المقارنة', 'Nav: Comparison')} ar={f.ar.nav.compare} en={f.en.nav.compare} onAr={(v) => setNav('compare', v, 'ar')} onEn={(v) => setNav('compare', v, 'en')} />
            <Field label={t('رابط: الأسئلة', 'Nav: FAQ')} ar={f.ar.nav.faq} en={f.en.nav.faq} onAr={(v) => setNav('faq', v, 'ar')} onEn={(v) => setNav('faq', v, 'en')} />
            {scalar('tagline', t('السطر تحت الاسم', 'Line under the wordmark'))}
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
            {scalar('panelTitle', t('عنوان اللوحة', 'Panel title'))}

            <div className="mod-card">
              <div className="mod-card-head">
                <span />
                <strong style={{ color: 'var(--sub)' }}>{t('صورة المنتج', 'The drawn product')}</strong>
              </div>
              <p className="icon-alt-note" style={{ margin: '0 0 14px' }}>
                {t(
                  'الصورة أو الفيديو نفسه بيترفع من تبويب «الصور». دول كلمات الرسمة الافتراضية اللي بتظهر لحد ما ترفع حاجة.',
                  'The image or video itself is uploaded in the Images tab. These are the words of the default drawing, shown until you upload one.',
                )}
              </p>
              <Field label={t('اسم اللوحة', 'Panel name')} ar={f.ar.mock.panel} en={f.en.mock.panel} onAr={(v) => setMockName(v, 'ar')} onEn={(v) => setMockName(v, 'en')} />
              <ListField label={t('عناصر القائمة', 'Sidebar items')} ar={f.ar.mock.items} en={f.en.mock.items} onAr={(i, v) => setMockList('items', i, v, 'ar')} onEn={(i, v) => setMockList('items', i, v, 'en')} />
              <ListField label={t('الدوائر', 'Circles')} ar={f.ar.mock.circles} en={f.en.mock.circles} onAr={(i, v) => setMockList('circles', i, v, 'ar')} onEn={(i, v) => setMockList('circles', i, v, 'en')} />
              <ListField label={t('الكروت', 'Cards')} ar={f.ar.mock.cards} en={f.en.mock.cards} onAr={(i, v) => setMockList('cards', i, v, 'ar')} onEn={(i, v) => setMockList('cards', i, v, 'en')} />
            </div>
          </>
        )}

        {sec === 'titles' && (
          <>
            {scalar('featuresEyebrow', t('المميزات — السطر الصغير', 'Features eyebrow'))}
            {scalar('featuresTitle', t('عنوان المميزات', 'Features title'))}
            {scalar('howEyebrow', t('الطريقة — السطر الصغير', 'How-it-works eyebrow'))}
            {scalar('howTitle', t('عنوان الطريقة', 'How-it-works title'))}
            {scalar('showcaseEyebrow', t('الأمثلة — السطر الصغير', 'Showcase eyebrow'))}
            {scalar('showcaseTitle', t('عنوان الأمثلة', 'Showcase title'))}
            {scalar('showcaseEmpty', t('نص لا يوجد أمثلة', 'Showcase empty text'))}
            {scalar('visit', t('كلمة «زيارة»', '“Visit” label'))}
            {scalar('pricingEyebrow', t('الأسعار — السطر الصغير', 'Pricing eyebrow'))}
            {scalar('pricingTitle', t('عنوان الأسعار', 'Pricing title'))}
            {scalar('faqEyebrow', t('الأسئلة — السطر الصغير', 'FAQ eyebrow'))}
            {scalar('faqTitle', t('عنوان الأسئلة', 'FAQ title'))}

            <div className="mod-card">
              <div className="mod-card-head">
                <span />
                <strong style={{ color: 'var(--sub)' }}>{t('شريط الأرقام', 'The numbers bar')}</strong>
              </div>
              <p className="icon-alt-note" style={{ margin: '0 0 14px' }}>
                {t(
                  'الأرقام نفسها بتتحسب من قاعدة البيانات — دي الكلمات اللي تحتها.',
                  'The numbers are counted from the database. These are the words under them.',
                )}
              </p>
              <Field label={t('البورتفوليوهات', 'Portfolios')} ar={f.ar.metricsLabels.sites} en={f.en.metricsLabels.sites} onAr={(v) => setMetric('sites', v, 'ar')} onEn={(v) => setMetric('sites', v, 'en')} />
              <Field label={t('المشاريع', 'Projects')} ar={f.ar.metricsLabels.projects} en={f.en.metricsLabels.projects} onAr={(v) => setMetric('projects', v, 'ar')} onEn={(v) => setMetric('projects', v, 'en')} />
              <Field label={t('الزيارات', 'Visits')} ar={f.ar.metricsLabels.visits} en={f.en.metricsLabels.visits} onAr={(v) => setMetric('visits', v, 'ar')} onEn={(v) => setMetric('visits', v, 'en')} />
            </div>
          </>
        )}

        {sec === 'features' && (
          <>
            {f.ar.features.map((_, i) => (
              <div className="mod-card" key={i}>
                <div className="mod-card-head"><span /><strong style={{ color: 'var(--sub)' }}>#{i + 1}</strong></div>
                <IconInput label={t('الأيقونة', 'Icon')} value={f.ar.features[i].icon} url={f.ar.features[i].iconUrl} onChange={(v) => setArrBoth('features', i, 'icon', v)} onUrl={(v) => setArrBoth('features', i, 'iconUrl', v)} />
                <Field label={t('العنوان', 'Title')} ar={f.ar.features[i].t} en={f.en.features[i].t} onAr={(v) => setArr('features', i, 't', v, 'ar')} onEn={(v) => setArr('features', i, 't', v, 'en')} />
                <Field label={t('الوصف', 'Description')} ar={f.ar.features[i].d} en={f.en.features[i].d} onAr={(v) => setArr('features', i, 'd', v, 'ar')} onEn={(v) => setArr('features', i, 'd', v, 'en')} multiline />
              </div>
            ))}
          </>
        )}

        {sec === 'how' && (
          <>
            {f.ar.how.map((_, i) => (
              <div className="mod-card" key={i}>
                <div className="mod-card-head"><span /><strong style={{ color: 'var(--sub)' }}>#{i + 1}</strong></div>
                <IconInput label={t('العلامة (رقم أو صورة)', 'Marker (number or image)')} value={f.ar.how[i].n} url={f.ar.how[i].iconUrl} onChange={(v) => setArrBoth('how', i, 'n', v)} onUrl={(v) => setArrBoth('how', i, 'iconUrl', v)} />
                <Field label={t('العنوان', 'Title')} ar={f.ar.how[i].t} en={f.en.how[i].t} onAr={(v) => setArr('how', i, 't', v, 'ar')} onEn={(v) => setArr('how', i, 't', v, 'en')} />
                <Field label={t('الوصف', 'Description')} ar={f.ar.how[i].d} en={f.en.how[i].d} onAr={(v) => setArr('how', i, 'd', v, 'ar')} onEn={(v) => setArr('how', i, 'd', v, 'en')} multiline />
              </div>
            ))}
          </>
        )}

        {sec === 'compare' && (
          <>
            {scalar('compareEyebrow', t('العنوان الصغير', 'Eyebrow'))}
            {scalar('compareTitle', t('عنوان القسم', 'Section title'))}

            <div className="mod-card">
              <div className="mod-card-head">
                <span />
                <strong style={{ color: 'var(--sub)' }}>{t('العمود الأحمر', 'The red column')}</strong>
              </div>
              {scalar('compareOldTitle', t('عنوان العمود', 'Column title'))}
              <ListField
                label={t('النقاط', 'Points')}
                ar={f.ar.compareOld}
                en={f.en.compareOld}
                onAr={(i, v) => setList('compareOld', i, v, 'ar')}
                onEn={(i, v) => setList('compareOld', i, v, 'en')}
              />
            </div>

            <div className="mod-card">
              <div className="mod-card-head">
                <span />
                <strong style={{ color: 'var(--sub)' }}>{t('عمود ViralPX', 'The ViralPX column')}</strong>
              </div>
              {scalar('compareNewTitle', t('عنوان العمود', 'Column title'))}
              <ListField
                label={t('النقاط', 'Points')}
                ar={f.ar.compareNew}
                en={f.en.compareNew}
                onAr={(i, v) => setList('compareNew', i, v, 'ar')}
                onEn={(i, v) => setList('compareNew', i, v, 'en')}
              />
            </div>
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

        {sec === 'style' && (
          <>
            <div className="design-subtabs">
              <button className={`dst ${!light ? 'active' : ''}`} onClick={() => setLight(false)}>
                🌙 {t('داكن', 'Dark')}
              </button>
              <button className={`dst ${light ? 'active' : ''}`} onClick={() => setLight(true)}>
                ☀️ {t('فاتح', 'Light')}
              </button>
            </div>

            <div className="palette-row">
              {(light ? LIGHT_PALETTES : DARK_PALETTES).map((p) => (
                <button
                  key={p.name}
                  className="palette-chip"
                  onClick={() =>
                    setTheme({
                      [k.accent]: p.accent,
                      [k.bg]: p.bg,
                      [k.bg2]: p.bg2,
                      [k.text]: p.text,
                      [k.sub]: p.subtext,
                    } as Partial<LandingTheme>)
                  }
                >
                  <span className="palette-swatch">
                    <i style={{ background: p.accent }} />
                    <i style={{ background: p.bg }} />
                    <i style={{ background: p.bg2 }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="de-colors" style={{ marginTop: 14 }}>
              <ColorInput label={t('المميّز', 'Accent')} value={tv(k.accent)} onChange={(v) => setTheme({ [k.accent]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('الخلفية', 'Background')} value={tv(k.bg)} onChange={(v) => setTheme({ [k.bg]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('خلفية الكروت', 'Cards')} value={tv(k.bg2)} onChange={(v) => setTheme({ [k.bg2]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('النص', 'Text')} value={tv(k.text)} onChange={(v) => setTheme({ [k.text]: v } as Partial<LandingTheme>)} />
              <ColorInput label={t('النص الخافت', 'Muted')} value={tv(k.sub)} onChange={(v) => setTheme({ [k.sub]: v } as Partial<LandingTheme>)} />
            </div>

            <p style={{ color: 'var(--sub)', fontSize: 13, marginTop: 14 }}>
              {t(
                'الزائر بيقلّب بين الوضعين من زر الشمس/القمر في شريط الصفحة، واختياره بيتحفظ عنده.',
                'Visitors switch with the sun/moon button in the page nav, and their choice is remembered.',
              )}
            </p>
          </>
        )}

        {sec === 'cards' && (
          <>
            <Opt
              label={t('كروت البورتفوليوهات', 'Showcase cards')}
              value={f.style.showcase}
              options={[
                { value: 'portrait', label: t('صورة دائرية', 'Portrait') },
                { value: 'plate', label: t('صورة بارزة', 'Plate') },
                { value: 'cover', label: t('غلاف عريض', 'Cover') },
                { value: 'row', label: t('صف مضغوط', 'Compact row') },
              ]}
              onChange={(v) => setStyle({ showcase: v })}
            />
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: '0 0 20px' }}>
              {t(
                'الكارت بيعرض صورة صاحب البورتفوليو وعنوانه من إعداداته — «غلاف عريض» بيستخدم صورة الغلاف. اللي مرفعش صورة بيظهر أول حرف من اسمه زي الأول.',
                "The card shows each owner's photo and their own one-line title — Cover uses their cover image instead. Anyone without a picture keeps the initial.",
              )}
            </p>

            <Opt
              label={t('شكل كل الكروت', 'Card finish')}
              value={f.style.card}
              options={[
                { value: 'solid', label: t('مصمت', 'Solid') },
                { value: 'outline', label: t('حدود فقط', 'Outline') },
                { value: 'glass', label: t('زجاجي', 'Glass') },
                { value: 'elevated', label: t('ظل مرتفع', 'Elevated') },
              ]}
              onChange={(v) => setStyle({ card: v })}
            />
            <p style={{ color: 'var(--sub)', fontSize: 13, margin: 0 }}>
              {t(
                'بيتطبّق على كروت المميزات والبورتفوليوهات والأسعار والأسئلة مع بعض.',
                'Applies to the feature, showcase, pricing and FAQ cards together.',
              )}
            </p>
          </>
        )}

        {sec === 'tools' && (
          <>
            <label className="lbl">{t('كود التحقق من Search Console', 'Search Console verification token')}</label>
            <input className="field" dir="ltr" value={f.tools.searchConsole} placeholder="abc123..." onChange={(e) => setTools({ searchConsole: e.target.value })} style={{ textAlign: 'start' }} />
            <p className="lbl" style={{ opacity: 0.7, marginTop: 4 }}>
              {t(
                'من Search Console → طريقة «HTML tag»، وانسخ قيمة content بس.',
                'In Search Console, pick the “HTML tag” method and copy only the content value.',
              )}
            </p>

            <label className="lbl" style={{ marginTop: 16, display: 'block' }}>
              {t('معرّف Google Analytics', 'Google Analytics measurement id')}
            </label>
            <input className="field" dir="ltr" value={f.tools.analyticsId} placeholder="G-XXXXXXXXXX" onChange={(e) => setTools({ analyticsId: e.target.value })} style={{ textAlign: 'start' }} />
            <p className="lbl" style={{ opacity: 0.7, marginTop: 4 }}>
              {t(
                'دي للموقع الأساسي بس — كل عميل بيربط حساباته من لوحته هو.',
                'These are for the platform site only — each client connects their own from their dashboard.',
              )}
            </p>
          </>
        )}

        {sec === 'backgrounds' && (
          <SectionBgRows rows={f.sectionBg} sections={LANDING_BG_SECTIONS} tr={t} onChange={setSectionBg} />
        )}

        {sec === 'images' && (
          <>
            <label className="lbl">{t('لوجو الشريط العلوي', 'Nav logo')}</label>
            <MediaUploader compact previewUrl={f.images.logoUrl} onUploaded={(m) => setImages({ logoId: m.id, logoUrl: m.thumbUrl })} />

            <label className="lbl" style={{ marginTop: 18, display: 'block' }}>
              {t('صورة القسم الرئيسي', 'Hero image')}
            </label>
            <MediaUploader big dim={f.images.heroDim} previewUrl={f.images.heroUrl} onUploaded={(m) => setImages({ heroId: m.id, heroUrl: m.url ?? m.thumbUrl })} />
            <div style={{ marginTop: 12 }}>
              <div className="lbl" style={{ marginBottom: 4 }}>
                {t('التعتيم', 'Dim')}: {f.images.heroDim}%
              </div>
              <input type="range" min={0} max={100} value={f.images.heroDim} onChange={(e) => setImages({ heroDim: Number(e.target.value) })} style={{ width: '100%' }} />
            </div>

            <label className="lbl" style={{ marginTop: 18, display: 'block' }}>
              {t('صورة المشاركة (واتساب/تويتر)', 'Share preview image')}
            </label>
            <MediaUploader compact previewUrl={f.images.ogUrl} onUploaded={(m) => setImages({ ogId: m.id, ogUrl: m.url ?? m.thumbUrl })} />

            <label className="lbl" style={{ marginTop: 24, display: 'block' }}>
              {t('لوحة القسم الرئيسي — صورة أو فيديو', 'Hero panel — image or video')}
            </label>
            <p className="icon-alt-note" style={{ margin: '0 0 10px' }}>
              {t(
                'اللوحة اللي تحت الأزرار. من غير رفع، بتفضل الرسمة الافتراضية.',
                'The panel under the buttons. With nothing uploaded, the default drawing stays.',
              )}
            </p>
            <MediaUploader
              big
              accept="image/*,video/*"
              aspect="16 / 10"
              previewUrl={f.images.panelUrl}
              onUploaded={(m) =>
                setImages({
                  panelId: m.id,
                  panelUrl: m.url ?? m.thumbUrl,
                  panelKind: m.mimeType?.startsWith('video/') ? 'video' : 'image',
                })
              }
              onRemove={
                f.images.panelUrl
                  ? () => setImages({ panelId: null, panelUrl: null, panelKind: null })
                  : undefined
              }
            />
          </>
        )}
      </div>

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
