'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import LayoutPicker from './LayoutPicker'
import { saveDesign } from '@/lib/design-actions'
import { useDashLang } from './DashLang'
import {
  LAYOUT_OPTIONS,
  FONT_OPTIONS,
  COMPONENT_OPTIONS,
  BG_PRESETS,
  ANIM_OPTIONS,
  CURSOR_OPTIONS,
  DIRECTION_OPTIONS,
  DARK_PALETTES,
  LIGHT_PALETTES,
  type DesignForm,
} from '@/lib/design-types'

// Cover gradient presets (swatch previews; the hero renders richer, animated,
// theme-aware versions of the same ids). Shown when there's no cover image.
const HERO_GRADIENTS: { id: string; label: string; css: string }[] = [
  { id: 'none', label: 'بدون', css: '' },
  { id: 'aurora', label: 'Aurora', css: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' },
  { id: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg,#f97316,#ec4899)' },
  { id: 'ocean', label: 'Ocean', css: 'linear-gradient(135deg,#2563eb,#06b6d4)' },
  { id: 'candy', label: 'Candy', css: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  { id: 'mint', label: 'Mint', css: 'linear-gradient(135deg,#10b981,#14b8a6)' },
  { id: 'ember', label: 'Ember', css: 'linear-gradient(135deg,#ef4444,#f59e0b)' },
  { id: 'dusk', label: 'Dusk', css: 'linear-gradient(135deg,#6366f1,#ec4899)' },
]

const clampPct = (v: number) => Math.max(0, Math.min(100, v))

/** A scaled, live preview of the hero cover (layout + image/gradient + position + overlay). */
function CoverPreview({ f }: { f: DesignForm }) {
  const g = f.heroCover.gradient
  const usingGradient = g !== 'none'
  const gradCss = HERO_GRADIENTS.find((x) => x.id === g)?.css
  const variant = f.style.hero || 'split'
  const bgStyle: React.CSSProperties = usingGradient
    ? { background: gradCss }
    : f.heroCoverUrl
      ? {
          backgroundImage: `url(${f.heroCoverUrl})`,
          backgroundSize: f.heroCover.size === 'contain' ? 'contain' : 'cover',
          backgroundPosition: `${f.heroCover.posX}% ${f.heroCover.posY}%`,
          backgroundRepeat: 'no-repeat',
        }
      : { background: 'var(--bg-3)' }
  return (
    <div className={`cvp cvp-${variant}`}>
      <div className="cvp-bg" style={bgStyle} />
      <div className="cvp-overlay" style={{ opacity: (f.heroCover.overlay || 0) / 100 }} />
      <div className="cvp-content">
        <span className="cvp-name" />
        <span className="cvp-name cvp-name-2" />
        <span className="cvp-sub" />
        <span className="cvp-btn" />
      </div>
    </div>
  )
}

// Top-level tabs: the shared Theme, then one tab per page section.
const TOP_TABS = [
  { id: 'theme', ar: 'الثيم', en: 'Theme', icon: '🎨' },
  { id: 'hero', ar: 'الرئيسية', en: 'Hero', icon: '🏠' },
  { id: 'about', ar: 'عن النفس', en: 'About', icon: '👤' },
  { id: 'projects', ar: 'المشاريع', en: 'Projects', icon: '🗂️' },
  { id: 'expertise', ar: 'الخدمات', en: 'Services', icon: '⭐' },
  { id: 'exp', ar: 'الخبرات', en: 'Experience', icon: '💼' },
  { id: 'tools', ar: 'الأدوات', en: 'Tools', icon: '🧰' },
  { id: 'skills', ar: 'المهارات', en: 'Skills', icon: '📊' },
  { id: 'contact', ar: 'التواصل', en: 'Contact', icon: '✉️' },
] as const

type TopTab = (typeof TOP_TABS)[number]['id']

const THEME_SUBS = [
  { id: 'colors', ar: 'الألوان', en: 'Colors', icon: '🎨' },
  { id: 'background', ar: 'الخلفيات', en: 'Backgrounds', icon: '🖼️' },
  { id: 'components', ar: 'المكوّنات', en: 'Components', icon: '🔘' },
  { id: 'fonts', ar: 'الخطوط', en: 'Fonts', icon: '🔤' },
  { id: 'motion', ar: 'الحركة', en: 'Motion', icon: '✨' },
] as const

type ThemeSub = (typeof THEME_SUBS)[number]['id']

// Which style-key each section tab drives.
const SECTION_STYLE_KEY: Record<Exclude<TopTab, 'theme'>, keyof DesignForm['style']> = {
  hero: 'hero',
  about: 'about',
  projects: 'projects',
  expertise: 'expertise',
  exp: 'exp',
  tools: 'tools',
  skills: 'skills',
  contact: 'contact',
}

/* A row of option buttons (radio group). */
function Opt({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[] | { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <div className="opt-field">
      <div className="opt-field-label">{label}</div>
      <div className="opt-opts">
        {opts.map((o) => (
          <button
            key={o.value}
            className={`pill ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* A titled group of related controls. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="de-group">
      <div className="de-group-title">{title}</div>
      {children}
    </div>
  )
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="color-input">
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
        <input className="field" value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" style={{ width: 110, textAlign: 'start' }} />
      </span>
      <span style={{ color: 'var(--sub)', fontSize: 13 }}>{label}</span>
    </label>
  )
}

function Slider({ label, value, min, max, onChange, suffix }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="lbl" style={{ marginBottom: 4 }}>{label}: {value}{suffix}</div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%' }} />
    </div>
  )
}

export default function DesignEditor({ initial }: { initial: DesignForm }) {
  const [f, setF] = useState<DesignForm>(initial)
  const [tab, setTab] = useState<TopTab>('theme')
  const [sub, setSub] = useState<ThemeSub>('colors')
  const [busy, setBusy] = useState(false)
  const { t: tr } = useDashLang()
  const [toast, setToast] = useState(false)

  const set = (patch: Partial<DesignForm>) => setF((p) => ({ ...p, ...patch }))
  const setColors = (p: Partial<DesignForm['colors']>) => set({ colors: { ...f.colors, ...p } })
  const setStyle = (p: Partial<DesignForm['style']>) => set({ style: { ...f.style, ...p } })
  const setBg = (p: Partial<DesignForm['background']>) => set({ background: { ...f.background, ...p } })
  const setComp = (p: Partial<DesignForm['components']>) => set({ components: { ...f.components, ...p } })
  const setCover = (p: Partial<DesignForm['heroCover']>) => set({ heroCover: { ...f.heroCover, ...p } })

  async function save() {
    setBusy(true)
    await saveDesign(f)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  const usingGradient = f.heroCover.gradient !== 'none'

  // The layout picker that leads every section tab.
  const sectionLayout = (id: Exclude<TopTab, 'theme'>, label: string) => {
    const key = SECTION_STYLE_KEY[id]
    return (
      <LayoutPicker
        section={id}
        label={label}
        value={f.style[key]}
        options={LAYOUT_OPTIONS[id as keyof typeof LAYOUT_OPTIONS]}
        onChange={(v) => setStyle({ [key]: v })}
      />
    )
  }

  return (
    <div>
      <PageHeader
        icon="🎨"
        title={tr('التصميم', 'Design')}
        subtitle={tr('غيّر تخطيط وتصميم كل قسم على حدة', 'Change the layout & design of each section independently')}
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : tr('💾 حفظ التصميم', '💾 Save design')}
          </button>
        }
      />

      {/* Top-level tabs: Theme + one per section */}
      <div className="design-tabs de-toptabs">
        {TOP_TABS.map((t) => (
          <button key={t.id} className={`dt ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {tr(t.ar, t.en)}
          </button>
        ))}
      </div>

      {/* ═══ THEME TAB (shared look) ═══ */}
      {tab === 'theme' && (
        <>
          <div className="design-subtabs">
            {THEME_SUBS.map((s) => (
              <button key={s.id} className={`dst ${sub === s.id ? 'active' : ''}`} onClick={() => setSub(s.id)}>
                <span aria-hidden>{s.icon}</span>
                {tr(s.ar, s.en)}
              </button>
            ))}
          </div>

          <div className="panel">
            {sub === 'colors' && (
              <div className="de-cols">
                <Group title={tr('🌙 الوضع الداكن', '🌙 Dark mode')}>
                  <div className="palette-row">
                    {DARK_PALETTES.map((p) => (
                      <button key={p.name} className="palette-chip" onClick={() => setColors({ accent: p.accent, bg: p.bg, bg2: p.bg2, text: p.text, subtext: p.subtext })}>
                        <span className="palette-swatch">
                          <i style={{ background: p.accent }} />
                          <i style={{ background: p.bg }} />
                          <i style={{ background: p.bg2 }} />
                        </span>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 14 }} />
                  <ColorInput label={tr('المميّز', 'Accent')} value={f.colors.accent} onChange={(v) => setColors({ accent: v })} />
                  <ColorInput label={tr('الخلفية', 'Background')} value={f.colors.bg} onChange={(v) => setColors({ bg: v })} />
                  <ColorInput label={tr('خلفية الكروت', 'Cards')} value={f.colors.bg2} onChange={(v) => setColors({ bg2: v })} />
                  <ColorInput label={tr('النص', 'Text')} value={f.colors.text} onChange={(v) => setColors({ text: v })} />
                  <ColorInput label={tr('النص الخافت', 'Muted')} value={f.colors.subtext} onChange={(v) => setColors({ subtext: v })} />
                </Group>
                <Group title={tr('☀️ الوضع الفاتح', '☀️ Light mode')}>
                  <div className="palette-row">
                    {LIGHT_PALETTES.map((p) => (
                      <button key={p.name} className="palette-chip" onClick={() => setColors({ accentLight: p.accent, bgLight: p.bg, bg2Light: p.bg2, textLight: p.text, subtextLight: p.subtext })}>
                        <span className="palette-swatch">
                          <i style={{ background: p.accent }} />
                          <i style={{ background: p.bg }} />
                          <i style={{ background: p.bg2 }} />
                        </span>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 14 }} />
                  <ColorInput label={tr('المميّز', 'Accent')} value={f.colors.accentLight} onChange={(v) => setColors({ accentLight: v })} />
                  <ColorInput label={tr('الخلفية', 'Background')} value={f.colors.bgLight} onChange={(v) => setColors({ bgLight: v })} />
                  <ColorInput label={tr('خلفية الكروت', 'Cards')} value={f.colors.bg2Light} onChange={(v) => setColors({ bg2Light: v })} />
                  <ColorInput label={tr('النص', 'Text')} value={f.colors.textLight} onChange={(v) => setColors({ textLight: v })} />
                  <ColorInput label={tr('النص الخافت', 'Muted')} value={f.colors.subtextLight} onChange={(v) => setColors({ subtextLight: v })} />
                </Group>
              </div>
            )}

            {sub === 'background' && (
              <div className="de-cols">
                <Opt label={tr('خلفية جاهزة', 'Preset background')} value={f.background.preset} options={BG_PRESETS} onChange={(v) => setBg({ preset: v })} />
                <div>
                  <Opt label={tr('النوع', 'Type')} value={f.background.type} options={['solid', 'gradient']} onChange={(v) => setBg({ type: v })} />
                  <ColorInput label={tr('لون 1', 'Color 1')} value={f.background.color1} onChange={(v) => setBg({ color1: v })} />
                  {f.background.type === 'gradient' && <ColorInput label={tr('لون 2', 'Color 2')} value={f.background.color2} onChange={(v) => setBg({ color2: v })} />}
                </div>
              </div>
            )}

            {sub === 'components' && (
              <div className="de-grid">
                <Opt label={tr('شكل الكروت', 'Card style')} value={f.components.card} options={COMPONENT_OPTIONS.card} onChange={(v) => setComp({ card: v })} />
                <Opt label={tr('الشريط العلوي', 'Navbar')} value={f.components.navbar} options={COMPONENT_OPTIONS.navbar} onChange={(v) => setComp({ navbar: v })} />
                <Opt label={tr('الأزرار', 'Buttons')} value={f.components.button} options={COMPONENT_OPTIONS.button} onChange={(v) => setComp({ button: v })} />
              </div>
            )}

            {sub === 'fonts' && (
              <Opt label={tr('الخط (عربي · لاتيني)', 'Font (Arabic · Latin)')} value={f.style.font} options={FONT_OPTIONS} onChange={(v) => setStyle({ font: v })} />
            )}

            {sub === 'motion' && (
              <div className="de-grid">
                <Opt label={tr('الحركات', 'Animations')} value={f.style.anim} options={ANIM_OPTIONS} onChange={(v) => setStyle({ anim: v })} />
                <Opt label={tr('المؤشر', 'Cursor')} value={f.style.cursor} options={CURSOR_OPTIONS} onChange={(v) => setStyle({ cursor: v })} />
                <Opt label={tr('الاتجاه', 'Direction')} value={f.style.direction} options={DIRECTION_OPTIONS} onChange={(v) => setStyle({ direction: v })} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ HERO SECTION TAB ═══ */}
      {tab === 'hero' && (
        <div className="panel cover-tab">
          <div className="cover-preview-col">
            <div className="lbl" style={{ marginBottom: 8 }}>{tr('معاينة حيّة', 'Live preview')}</div>
            <CoverPreview f={f} />
            <p className="cover-hint">{tr('شكل القسم الرئيسي بعد الحفظ.', 'How the hero looks after saving.')}</p>
          </div>
          <div className="cover-ctrl-col">
            {sectionLayout('hero', tr('تخطيط القسم الرئيسي', 'Hero layout'))}

            <div className="lbl" style={{ marginTop: 16 }}>{tr('مصدر الغلاف', 'Cover source')}</div>
            <div className="seg2">
              <button type="button" className={!usingGradient ? 'active' : ''} onClick={() => setCover({ gradient: 'none' })}>
                {tr('صورة', 'Image')}
              </button>
              <button type="button" className={usingGradient ? 'active' : ''} onClick={() => setCover({ gradient: f.heroCover.gradient !== 'none' ? f.heroCover.gradient : 'aurora' })}>
                {tr('تدرّج لوني', 'Gradient')}
              </button>
            </div>

            {usingGradient ? (
              <div className="hgp" style={{ marginTop: 12 }}>
                {HERO_GRADIENTS.filter((g) => g.id !== 'none').map((g) => (
                  <button key={g.id} type="button" className={`hgp-swatch ${f.heroCover.gradient === g.id ? 'active' : ''}`} style={{ background: g.css }} onClick={() => setCover({ gradient: g.id })} title={g.label} />
                ))}
              </div>
            ) : (
              <>
                <div style={{ marginTop: 12 }} />
                <MediaUploader previewUrl={f.heroCoverUrl} onUploaded={(m) => set({ heroCoverId: m.id, heroCoverUrl: m.thumbUrl })} />
                {f.heroCoverUrl && (
                  <button type="button" className="btn btn-danger" style={{ marginTop: 8 }} onClick={() => set({ heroCoverId: null, heroCoverUrl: null })}>
                    {tr('حذف الصورة', 'Remove image')}
                  </button>
                )}
                <Opt label={tr('ملء الإطار', 'Fit')} value={f.heroCover.size} options={['cover', 'contain']} onChange={(v) => setCover({ size: v })} />
                <div className="lbl">{tr('موضع الصورة', 'Image position')}</div>
                <div className="pos-pad">
                  <button type="button" onClick={() => setCover({ posY: clampPct(f.heroCover.posY - 5) })} aria-label="up">↑</button>
                  <div className="pos-pad-row">
                    <button type="button" onClick={() => setCover({ posX: clampPct(f.heroCover.posX - 5) })} aria-label="left">←</button>
                    <button type="button" className="pos-center" onClick={() => setCover({ posX: 50, posY: 50 })}>
                      {f.heroCover.posX}% · {f.heroCover.posY}%
                    </button>
                    <button type="button" onClick={() => setCover({ posX: clampPct(f.heroCover.posX + 5) })} aria-label="right">→</button>
                  </div>
                  <button type="button" onClick={() => setCover({ posY: clampPct(f.heroCover.posY + 5) })} aria-label="down">↓</button>
                </div>
              </>
            )}

            <Slider label={tr('شدّة الطبقة السوداء', 'Overlay strength')} value={f.heroCover.overlay} min={0} max={100} suffix="%" onChange={(v) => setCover({ overlay: v })} />
            <Slider label={tr('ارتفاع القسم', 'Section height')} value={f.heroCover.height} min={40} max={100} suffix="vh" onChange={(v) => setCover({ height: v })} />
          </div>
        </div>
      )}

      {/* ═══ OTHER SECTION TABS (layout only, for now) ═══ */}
      {tab !== 'theme' && tab !== 'hero' && (
        <div className="panel">
          {tab === 'about' && sectionLayout('about', tr('تخطيط قسم «عن النفس»', 'About layout'))}
          {tab === 'projects' && sectionLayout('projects', tr('تخطيط قسم المشاريع', 'Projects layout'))}
          {tab === 'expertise' && sectionLayout('expertise', tr('تخطيط قسم الخدمات', 'Services layout'))}
          {tab === 'exp' && sectionLayout('exp', tr('تخطيط قسم الخبرات', 'Experience layout'))}
          {tab === 'tools' && sectionLayout('tools', tr('تخطيط قسم الأدوات', 'Tools layout'))}
          {tab === 'skills' && sectionLayout('skills', tr('تخطيط قسم المهارات', 'Skills layout'))}
          {tab === 'contact' && sectionLayout('contact', tr('تخطيط قسم التواصل', 'Contact layout'))}
          <p className="cover-hint" style={{ marginTop: 14 }}>
            {tr('اختر تخطيطًا لهذا القسم — التغيير يظهر على موقعك بعد الحفظ.', 'Pick a layout for this section — it shows on your site after saving.')}
          </p>
        </div>
      )}

      {toast && <div className="toast">{tr('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
