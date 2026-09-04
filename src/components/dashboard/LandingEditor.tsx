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
  { id: 'faq', ar: 'الأسئلة', en: 'FAQ' },
  { id: 'cta', ar: 'دعوة الفعل', en: 'Call to action' },
  { id: 'footer', ar: 'الفوتر', en: 'Footer' },
  { id: 'style', ar: 'الألوان', en: 'Colours' },
  { id: 'cards', ar: 'شكل الكروت', en: 'Card style' },
  { id: 'backgrounds', ar: 'خلفيات الأقسام', en: 'Section backgrounds' },
  { id: 'images', ar: 'الصور', en: 'Images' },
  { id: 'tools', ar: 'أدوات جوجل', en: 'Google tools' },
] as const

/* A starting point, not a limit — the field takes any emoji or short text. */
const ICON_SUGGESTIONS = [
  '🎨', '🖼️', '✍️', '🌐', '⚡', '📩', '🚀', '📱', '💼', '🔒',
  '📊', '⭐', '🎬', '🛠️', '💡', '🏆', '🔗', '📈', '✅', '🎯',
]

/**
 * One icon. Shared by both languages on purpose: an emoji doesn't get
 * translated, and keeping a copy per locale means setting it twice and
 * watching the Arabic and English pages drift apart.
 */
function IconInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="lbl" style={{ display: 'block' }}>{label}</label>
      <div className="icon-picker">
        <input
          className="field icon-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={8}
        />
        <div className="icon-chips">
          {ICON_SUGGESTIONS.map((e) => (
            <button
              key={e}
              type="button"
              className={`icon-chip ${value === e ? 'active' : ''}`}
              onClick={() => onChange(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
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
                <IconInput label={t('الأيقونة', 'Icon')} value={f.ar.features[i].icon} onChange={(v) => setArrBoth('features', i, 'icon', v)} />
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
                <IconInput label={t('العلامة (رقم أو أيقونة)', 'Marker (number or icon)')} value={f.ar.how[i].n} onChange={(v) => setArrBoth('how', i, 'n', v)} />
                <Field label={t('العنوان', 'Title')} ar={f.ar.how[i].t} en={f.en.how[i].t} onAr={(v) => setArr('how', i, 't', v, 'ar')} onEn={(v) => setArr('how', i, 't', v, 'en')} />
                <Field label={t('الوصف', 'Description')} ar={f.ar.how[i].d} en={f.en.how[i].d} onAr={(v) => setArr('how', i, 'd', v, 'ar')} onEn={(v) => setArr('how', i, 'd', v, 'en')} multiline />
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
          </>
        )}
      </div>

      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
