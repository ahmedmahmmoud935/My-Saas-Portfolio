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
  PALETTE_PRESETS,
  type DesignForm,
} from '@/lib/design-types'

const SUBTABS = [
  { id: 'colors', label: 'الألوان', labelEn: 'Colors', icon: '🎨' },
  { id: 'background', label: 'الخلفية', labelEn: 'Background', icon: '🖼️' },
  { id: 'layouts', label: 'التخطيطات', labelEn: 'Layouts', icon: '🧩' },
  { id: 'components', label: 'المكوّنات', labelEn: 'Components', icon: '🔘' },
  { id: 'fonts', label: 'الخطوط', labelEn: 'Fonts', icon: '🔤' },
  { id: 'motion', label: 'الحركة', labelEn: 'Motion', icon: '✨' },
  { id: 'cover', label: 'الغلاف', labelEn: 'Cover', icon: '🌄' },
] as const

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
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} style={{ width: 40, height: 32, border: 'none', background: 'none', cursor: 'pointer' }} />
        <input className="field" value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" style={{ width: 120, textAlign: 'start' }} />
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
  const [tab, setTab] = useState<(typeof SUBTABS)[number]['id']>('colors')
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

  return (
    <div>
      <PageHeader
        icon="🎨"
        title={tr('التصميم', 'Design')}
        subtitle={tr('خصّص شكل موقعك بالكامل — ألوان، خطوط، تخطيطات', 'Fully customize your site — colors, fonts, layouts')}
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : tr('💾 حفظ التصميم', '💾 Save design')}
          </button>
        }
      />

      {/* Live preview — a miniature of the site's look */}
      <div className="de-preview" style={{ background: f.colors.bg, color: f.colors.text }}>
        <div className="de-preview-bar">
          <i style={{ background: f.colors.accent }} />
          <i style={{ background: f.colors.subtext }} />
          <i style={{ background: f.colors.bg2 }} />
        </div>
        <div className="de-preview-body">
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {tr('اسمك', 'Your name')} <span style={{ color: f.colors.accent }}>{tr('هنا', 'here')}</span>
          </div>
          <div style={{ color: f.colors.subtext, fontSize: 14 }}>
            {tr('نص وصفي خافت يوضّح شكل النص الثانوي في موقعك.', 'A muted line showing how secondary text looks on your site.')}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                background: f.colors.accent, color: '#fff', padding: '9px 20px', fontWeight: 700,
                borderRadius: f.components.button === 'pill' ? 999 : f.components.button === 'sharp' ? 0 : 8,
              }}
            >
              {tr('زر', 'Button')}
            </span>
            <span
              className="de-preview-card"
              style={{
                background: f.colors.bg2, color: f.colors.subtext, fontSize: 13,
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: f.components.card === 'sharp' ? 0 : f.components.card === 'round' ? 16 : 8,
              }}
            >
              {tr('كارت', 'Card')}
            </span>
          </div>
        </div>
      </div>

      <div className="design-tabs">
        {SUBTABS.map((t) => (
          <button key={t.id} className={`dt ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {tr(t.label, t.labelEn)}
          </button>
        ))}
      </div>

      <div className="panel">
        {tab === 'colors' && (
          <>
            <Group title={tr('لوحات جاهزة', 'Ready palettes')}>
              <div className="palette-row">
                {PALETTE_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    className="palette-chip"
                    onClick={() => setColors({ accent: p.accent, bg: p.bg, bg2: p.bg2, text: p.text, subtext: p.subtext })}
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
            </Group>
            <Group title={tr('ألوان مخصّصة', 'Custom colors')}>
              <ColorInput label={tr('اللون المميّز (accent)', 'Accent color')} value={f.colors.accent} onChange={(v) => setColors({ accent: v })} />
              <ColorInput label={tr('الخلفية (bg)', 'Background (bg)')} value={f.colors.bg} onChange={(v) => setColors({ bg: v })} />
              <ColorInput label={tr('خلفية الكروت (bg2)', 'Card background (bg2)')} value={f.colors.bg2} onChange={(v) => setColors({ bg2: v })} />
              <ColorInput label={tr('النص (text)', 'Text')} value={f.colors.text} onChange={(v) => setColors({ text: v })} />
              <ColorInput label={tr('النص الخافت (subtext)', 'Muted text')} value={f.colors.subtext} onChange={(v) => setColors({ subtext: v })} />
            </Group>
          </>
        )}

        {tab === 'background' && (
          <>
            <Opt label={tr('خلفية جاهزة', 'Preset background')} value={f.background.preset} options={BG_PRESETS} onChange={(v) => setBg({ preset: v })} />
            <Opt label={tr('النوع', 'Type')} value={f.background.type} options={['solid', 'gradient']} onChange={(v) => setBg({ type: v })} />
            <ColorInput label={tr('لون 1', 'Color 1')} value={f.background.color1} onChange={(v) => setBg({ color1: v })} />
            {f.background.type === 'gradient' && <ColorInput label={tr('لون 2', 'Color 2')} value={f.background.color2} onChange={(v) => setBg({ color2: v })} />}
          </>
        )}

        {tab === 'layouts' && (
          <>
            <Group title={tr('الأقسام الرئيسية', 'Main sections')}>
              <LayoutPicker section="hero" label={tr('القسم الرئيسي (Hero)', 'Hero section')} value={f.style.hero} options={LAYOUT_OPTIONS.hero} onChange={(v) => setStyle({ hero: v })} />
              <LayoutPicker section="about" label={tr('عن النفس', 'About')} value={f.style.about} options={LAYOUT_OPTIONS.about} onChange={(v) => setStyle({ about: v })} />
              <LayoutPicker section="projects" label={tr('المشاريع', 'Projects')} value={f.style.projects} options={LAYOUT_OPTIONS.projects} onChange={(v) => setStyle({ projects: v })} />
            </Group>
            <Group title={tr('أقسام إضافية', 'Other sections')}>
              <Opt label={tr('الخدمات', 'Services')} value={f.style.expertise} options={LAYOUT_OPTIONS.expertise} onChange={(v) => setStyle({ expertise: v })} />
              <Opt label={tr('التواصل', 'Contact')} value={f.style.contact} options={LAYOUT_OPTIONS.contact} onChange={(v) => setStyle({ contact: v })} />
              <Opt label={tr('المهارات', 'Skills')} value={f.style.skills} options={LAYOUT_OPTIONS.skills} onChange={(v) => setStyle({ skills: v })} />
              <Opt label={tr('الأدوات', 'Tools')} value={f.style.tools} options={LAYOUT_OPTIONS.tools} onChange={(v) => setStyle({ tools: v })} />
              <Opt label={tr('الخبرات', 'Experience')} value={f.style.exp} options={LAYOUT_OPTIONS.exp} onChange={(v) => setStyle({ exp: v })} />
            </Group>
          </>
        )}

        {tab === 'components' && (
          <>
            <Opt label={tr('شكل الكروت', 'Card style')} value={f.components.card} options={COMPONENT_OPTIONS.card} onChange={(v) => setComp({ card: v })} />
            <Opt label={tr('الشريط العلوي', 'Navbar')} value={f.components.navbar} options={COMPONENT_OPTIONS.navbar} onChange={(v) => setComp({ navbar: v })} />
            <Opt label={tr('الأزرار', 'Buttons')} value={f.components.button} options={COMPONENT_OPTIONS.button} onChange={(v) => setComp({ button: v })} />
          </>
        )}

        {tab === 'fonts' && (
          <Opt label={tr('الخط (عربي · لاتيني)', 'Font (Arabic · Latin)')} value={f.style.font} options={FONT_OPTIONS} onChange={(v) => setStyle({ font: v })} />
        )}

        {tab === 'motion' && (
          <>
            <Opt label={tr('الحركات', 'Animations')} value={f.style.anim} options={ANIM_OPTIONS} onChange={(v) => setStyle({ anim: v })} />
            <Opt label={tr('المؤشر', 'Cursor')} value={f.style.cursor} options={CURSOR_OPTIONS} onChange={(v) => setStyle({ cursor: v })} />
            <Opt label={tr('الاتجاه', 'Direction')} value={f.style.direction} options={DIRECTION_OPTIONS} onChange={(v) => setStyle({ direction: v })} />
          </>
        )}

        {tab === 'cover' && (
          <>
            <div className="lbl" style={{ marginBottom: 6 }}>{tr('صورة الغلاف', 'Cover image')}</div>
            <MediaUploader previewUrl={f.heroCoverUrl} onUploaded={(m) => set({ heroCoverId: m.id, heroCoverUrl: m.thumbUrl })} />
            <div style={{ marginTop: 14 }} />
            <Opt label={tr('الحجم', 'Size')} value={f.heroCover.size} options={['cover', 'contain']} onChange={(v) => setCover({ size: v })} />
            <Slider label={tr('الموضع الأفقي', 'Horizontal position')} value={f.heroCover.posX} min={0} max={100} suffix="%" onChange={(v) => setCover({ posX: v })} />
            <Slider label={tr('الموضع العمودي', 'Vertical position')} value={f.heroCover.posY} min={0} max={100} suffix="%" onChange={(v) => setCover({ posY: v })} />
            <Slider label={tr('شدّة الطبقة السوداء', 'Overlay strength')} value={f.heroCover.overlay} min={0} max={100} suffix="%" onChange={(v) => setCover({ overlay: v })} />
            <Slider label={tr('ارتفاع القسم', 'Section height')} value={f.heroCover.height} min={40} max={100} suffix="vh" onChange={(v) => setCover({ height: v })} />
          </>
        )}
      </div>

      {toast && <div className="toast">{tr('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
