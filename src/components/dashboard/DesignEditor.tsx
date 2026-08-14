'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import LayoutPicker from './LayoutPicker'
import NavIcon from './icons'
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
  BG_SECTIONS,
  GRADIENT_SUGGESTIONS,
  ANIMATED_SUGGESTIONS,
  SOLID_SUGGESTIONS,
  emptySectionBg,
  type BgForm,
  type SectionBgForm,
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
  { id: 'theme', ar: 'الثيم', en: 'Theme', icon: 'gem' },
  { id: 'hero', ar: 'الرئيسية', en: 'Hero', icon: 'home' },
  { id: 'about', ar: 'عن النفس', en: 'About', icon: 'users' },
  { id: 'projects', ar: 'المشاريع', en: 'Projects', icon: 'projects' },
  { id: 'expertise', ar: 'الخدمات', en: 'Services', icon: 'star' },
  { id: 'exp', ar: 'الخبرات', en: 'Experience', icon: 'briefcase' },
  { id: 'tools', ar: 'الأدوات', en: 'Tools', icon: 'wrench' },
  { id: 'skills', ar: 'المهارات', en: 'Skills', icon: 'analytics' },
  { id: 'contact', ar: 'التواصل', en: 'Contact', icon: 'mail' },
] as const

type TopTab = (typeof TOP_TABS)[number]['id']

// One tab per theme (each owns its palette, page background and per-section
// backdrops), plus the settings that are shared by both.
const THEME_SUBS = [
  { id: 'light', ar: 'ثيم فاتح', en: 'Light theme', icon: 'sun' },
  { id: 'dark', ar: 'ثيم داكن', en: 'Dark theme', icon: 'moon' },
  { id: 'general', ar: 'إعدادات عامة', en: 'General', icon: 'design' },
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
  // Label above, swatch and hex fused into one control — side-by-side they
  // drifted to opposite ends of the grid column and read as unrelated.
  return (
    <label className="color-input">
      <span className="ci-label">{label}</span>
      <span className="ci-control">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
        <input
          className="ci-hex"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          placeholder="#000000"
          spellCheck={false}
        />
      </span>
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

/**
 * Everything that belongs to one theme: its palette, the page background, and
 * any per-section backdrops. Rendered twice — once for light, once for dark —
 * so the two can be styled completely independently.
 */
function ThemePanel({
  mode,
  f,
  tr,
  setColors,
  setBgFor,
  setSectionBg,
}: {
  mode: 'light' | 'dark'
  f: DesignForm
  tr: (ar: string, en: string) => string
  setColors: (p: Partial<DesignForm['colors']>) => void
  setBgFor: (mode: 'dark' | 'light', p: Partial<BgForm>) => void
  setSectionBg: (rows: SectionBgForm[]) => void
}) {
  const dark = mode === 'dark'
  const bg = dark ? f.background : f.backgroundLight
  const setBg = (p: Partial<BgForm>) => setBgFor(mode, p)
  const palettes = dark ? DARK_PALETTES : LIGHT_PALETTES

  // Colour keys differ between the two halves of the palette.
  const c = dark
    ? { accent: 'accent', bg: 'bg', bg2: 'bg2', text: 'text', sub: 'subtext' }
    : { accent: 'accentLight', bg: 'bgLight', bg2: 'bg2Light', text: 'textLight', sub: 'subtextLight' }
  const cv = (k: string) => (f.colors as unknown as Record<string, string>)[k] || ''

  // Only this theme's rows — light and dark keep entirely separate lists, so
  // one theme's image or video can't leak into the other.
  const all = f.sectionBg
  const rows = all.filter((r) => (r.theme || 'dark') === mode)
  const idxOf = (i: number) => all.indexOf(rows[i])
  const patchRow = (i: number, p: Partial<SectionBgForm>) => {
    const target = idxOf(i)
    setSectionBg(all.map((r, j) => (j === target ? { ...r, ...p } : r)))
  }
  const removeRow = (i: number) => {
    const target = idxOf(i)
    setSectionBg(all.filter((_, j) => j !== target))
  }

  const suggestions =
    bg.type === 'animated' ? ANIMATED_SUGGESTIONS : bg.type === 'gradient' ? GRADIENT_SUGGESTIONS : []

  return (
    <>
      <Group title={dark ? tr('🌙 ألوان الثيم الداكن', '🌙 Dark palette') : tr('☀️ ألوان الثيم الفاتح', '☀️ Light palette')}>
        <div className="palette-row">
          {palettes.map((p) => (
            <button
              key={p.name}
              className="palette-chip"
              onClick={() =>
                setColors({
                  [c.accent]: p.accent,
                  [c.bg]: p.bg,
                  [c.bg2]: p.bg2,
                  [c.text]: p.text,
                  [c.sub]: p.subtext,
                } as Partial<DesignForm['colors']>)
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
        <div style={{ marginTop: 14 }} />
        <div className="de-colors">
          <ColorInput label={tr('المميّز', 'Accent')} value={cv(c.accent)} onChange={(v) => setColors({ [c.accent]: v } as Partial<DesignForm['colors']>)} />
          <ColorInput label={tr('الخلفية', 'Background')} value={cv(c.bg)} onChange={(v) => setColors({ [c.bg]: v } as Partial<DesignForm['colors']>)} />
          <ColorInput label={tr('خلفية الكروت', 'Cards')} value={cv(c.bg2)} onChange={(v) => setColors({ [c.bg2]: v } as Partial<DesignForm['colors']>)} />
          <ColorInput label={tr('النص', 'Text')} value={cv(c.text)} onChange={(v) => setColors({ [c.text]: v } as Partial<DesignForm['colors']>)} />
          <ColorInput label={tr('النص الخافت', 'Muted')} value={cv(c.sub)} onChange={(v) => setColors({ [c.sub]: v } as Partial<DesignForm['colors']>)} />
        </div>
      </Group>

      <Group title={tr('خلفية الصفحة', 'Page background')}>
        <Opt
          label={tr('النوع', 'Type')}
          value={bg.type}
          options={[
            { value: 'solid', label: tr('لون', 'Solid') },
            { value: 'gradient', label: tr('تدرّج', 'Gradient') },
            { value: 'animated', label: tr('تدرّج متحرك', 'Animated') },
            { value: 'image', label: tr('صورة', 'Image') },
          ]}
          onChange={(v) => setBg({ type: v })}
        />

        {bg.type === 'solid' && (
          <>
            <div className="bg-suggestions">
              {SOLID_SUGGESTIONS.map((s) => (
                <button key={s.name} className="bg-sugg" onClick={() => setBg({ color1: dark ? s.dark : s.light })}>
                  <span className="bg-sugg-swatch" style={{ background: dark ? s.dark : s.light }} />
                  {s.name}
                </button>
              ))}
            </div>
            <Opt label={tr('لمسة جاهزة', 'Preset tint')} value={bg.preset} options={BG_PRESETS} onChange={(v) => setBg({ preset: v })} />
            <ColorInput label={tr('اللون', 'Colour')} value={bg.color1} onChange={(v) => setBg({ color1: v })} />
          </>
        )}

        {(bg.type === 'gradient' || bg.type === 'animated') && (
          <>
            <div className="bg-suggestions">
              {suggestions.map((s) => {
                const cols = dark ? s.dark : s.light
                return (
                  <button
                    key={s.name}
                    className="bg-sugg"
                    onClick={() => setBg({ color1: cols[0], color2: cols[1], color3: cols[2] || '' })}
                  >
                    <span
                      className="bg-sugg-swatch"
                      style={{ background: `linear-gradient(135deg, ${cols.join(', ')})` }}
                    />
                    {s.name}
                  </button>
                )
              })}
            </div>
            <div className="de-colors">
              <ColorInput label={tr('لون 1', 'Colour 1')} value={bg.color1} onChange={(v) => setBg({ color1: v })} />
              <ColorInput label={tr('لون 2', 'Colour 2')} value={bg.color2} onChange={(v) => setBg({ color2: v })} />
              {bg.type === 'animated' && (
                <ColorInput label={tr('لون 3', 'Colour 3')} value={bg.color3} onChange={(v) => setBg({ color3: v })} />
              )}
            </div>
            <div
              className="bg-preview"
              style={{
                background: `linear-gradient(135deg, ${[bg.color1, bg.color2, bg.color3].filter(Boolean).join(', ') || 'transparent'})`,
              }}
            />
          </>
        )}

        {bg.type === 'image' && (
          // Image beside its settings: stacked, the preview pushed the controls
          // so far down you couldn't see what you were adjusting.
          <div className="bg-image-row">
            <MediaUploader
              big
              dim={bg.dim}
              previewUrl={bg.imageUrl}
              label={tr('صورة الخلفية', 'Background image')}
              onUploaded={(m) => setBg({ imageId: m.id, imageUrl: m.url ?? m.thumbUrl })}
              onRemove={() => setBg({ imageId: null, imageUrl: null })}
            />
            <div>
              <Opt
                label={tr('السلوك عند التمرير', 'Scroll behaviour')}
                value={bg.imageFixed ? 'fixed' : 'scroll'}
                options={[
                  { value: 'fixed', label: tr('ثابتة (بارالاكس)', 'Fixed (parallax)') },
                  { value: 'scroll', label: tr('تتحرك مع الصفحة', 'Scrolls with page') },
                ]}
                onChange={(v) => setBg({ imageFixed: v === 'fixed' })}
              />
              <Slider label={tr('التعتيم', 'Dim')} value={bg.dim} min={0} max={100} suffix="%" onChange={(v) => setBg({ dim: v })} />
            </div>
          </div>
        )}
      </Group>

      <Group title={tr('خلفيات الأقسام', 'Section backgrounds')}>
        <p style={{ color: 'var(--sub)', fontSize: 13, margin: '0 0 12px' }}>
          {tr(
            `أي قسم مش مضاف هنا بياخد خلفية الصفحة. دي خلفيات ${dark ? 'الثيم الداكن' : 'الثيم الفاتح'} وحده — مستقلة تمامًا عن الثيم التاني.`,
            `Sections not listed here use the page background. These belong to the ${dark ? 'dark' : 'light'} theme only — completely separate from the other one.`,
          )}
        </p>
        {rows.map((r, i) => (
          <div className="de-group" key={i} style={{ marginBottom: 12 }}>
            <div className="mod-card-head">
              <button className="icon-btn del" style={{ width: 30, height: 30 }} onClick={() => removeRow(i)}>
                <NavIcon id="trash" size={14} />
              </button>
              <span style={{ color: 'var(--sub)', fontSize: 12 }}>
                {BG_SECTIONS.find((s) => s.id === r.section)?.[tr('ar', 'en') as 'ar' | 'en'] || r.section}
              </span>
            </div>
            <div className="de-grid">
              <div>
                <label className="lbl">{tr('القسم', 'Section')}</label>
                <select className="field" value={r.section} onChange={(e) => patchRow(i, { section: e.target.value })}>
                  {BG_SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{tr(s.ar, s.en)}</option>
                  ))}
                </select>
              </div>
              <Opt
                label={tr('النوع', 'Type')}
                value={r.mode}
                options={[
                  { value: 'color', label: tr('لون', 'Colour') },
                  { value: 'image', label: tr('صورة', 'Image') },
                  { value: 'video', label: tr('فيديو', 'Video') },
                ]}
                onChange={(v) => patchRow(i, { mode: v })}
              />
            </div>

            {r.mode === 'color' && (
              <ColorInput
                label={tr('اللون', 'Colour')}
                value={r.color}
                onChange={(v) => patchRow(i, { color: v })}
              />
            )}

            {r.mode === 'image' && (
              <div className="bg-image-row">
                <MediaUploader
                  big
                  dim={r.dim}
                  previewUrl={r.imageUrl}
                  label={tr('صورة', 'Image')}
                  onUploaded={(m) => patchRow(i, { imageId: m.id, imageUrl: m.url ?? m.thumbUrl })}
                  onRemove={() => patchRow(i, { imageId: null, imageUrl: null })}
                />
                <div>
                <Opt
                  label={tr('السلوك عند التمرير', 'Scroll behaviour')}
                  value={r.fixed ? 'fixed' : 'scroll'}
                  options={[
                    { value: 'fixed', label: tr('ثابتة (بارالاكس)', 'Fixed (parallax)') },
                    { value: 'scroll', label: tr('تتحرك', 'Scrolls') },
                  ]}
                  onChange={(v) => patchRow(i, { fixed: v === 'fixed' })}
                />
                <Slider label={tr('التعتيم', 'Dim')} value={r.dim} min={0} max={100} suffix="%" onChange={(v) => patchRow(i, { dim: v })} />
                </div>
              </div>
            )}

            {r.mode === 'video' && (
              <>
                <label className="lbl">{tr('رابط الفيديو (mp4 مباشر)', 'Video URL (direct mp4)')}</label>
                <input className="field" dir="ltr" value={r.videoUrl} onChange={(e) => patchRow(i, { videoUrl: e.target.value })} style={{ textAlign: 'start' }} />
                <Slider label={tr('التعتيم', 'Dim')} value={r.dim} min={0} max={100} suffix="%" onChange={(v) => patchRow(i, { dim: v })} />
              </>
            )}
          </div>
        ))}
        <button className="btn btn-ghost" onClick={() => setSectionBg([...all, emptySectionBg(mode)])}>
          + {tr('خلفية قسم', 'Section background')}
        </button>
      </Group>
    </>
  )
}

export default function DesignEditor({ initial }: { initial: DesignForm }) {
  const [f, setF] = useState<DesignForm>(initial)
  const [tab, setTab] = useState<TopTab>('theme')
  const [sub, setSub] = useState<ThemeSub>('dark')
  const [busy, setBusy] = useState(false)
  const { t: tr } = useDashLang()
  const [toast, setToast] = useState(false)

  const set = (patch: Partial<DesignForm>) => setF((p) => ({ ...p, ...patch }))
  const setColors = (p: Partial<DesignForm['colors']>) => set({ colors: { ...f.colors, ...p } })
  const setStyle = (p: Partial<DesignForm['style']>) => set({ style: { ...f.style, ...p } })
  // Each theme edits its own background group.
  const setBgFor = (mode: 'dark' | 'light', p: Partial<BgForm>) =>
    mode === 'dark'
      ? set({ background: { ...f.background, ...p } })
      : set({ backgroundLight: { ...f.backgroundLight, ...p } })
  const setSectionBg = (rows: SectionBgForm[]) => set({ sectionBg: rows })
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
            <NavIcon id={t.icon} size={16} />
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
                <NavIcon id={s.icon} size={15} />
                {tr(s.ar, s.en)}
              </button>
            ))}
          </div>

          <div className="panel">
            {(sub === 'light' || sub === 'dark') && (
              <ThemePanel
                mode={sub}
                f={f}
                tr={tr}
                setColors={setColors}
                setBgFor={setBgFor}
                setSectionBg={setSectionBg}
              />
            )}

            {sub === 'general' && (
              <>
                <Group title={tr('المكوّنات', 'Components')}>
                  <div className="de-grid">
                    <Opt label={tr('شكل الكروت', 'Card style')} value={f.components.card} options={COMPONENT_OPTIONS.card} onChange={(v) => setComp({ card: v })} />
                    <Opt label={tr('الشريط العلوي', 'Navbar')} value={f.components.navbar} options={COMPONENT_OPTIONS.navbar} onChange={(v) => setComp({ navbar: v })} />
                    <Opt label={tr('الأزرار', 'Buttons')} value={f.components.button} options={COMPONENT_OPTIONS.button} onChange={(v) => setComp({ button: v })} />
                  </div>
                </Group>
                <Group title={tr('الخطوط', 'Fonts')}>
                  <Opt label={tr('الخط (عربي · لاتيني)', 'Font (Arabic · Latin)')} value={f.style.font} options={FONT_OPTIONS} onChange={(v) => setStyle({ font: v })} />
                </Group>
                <Group title={tr('الحركة', 'Motion')}>
                  <div className="de-grid">
                    <Opt label={tr('الحركات', 'Animations')} value={f.style.anim} options={ANIM_OPTIONS} onChange={(v) => setStyle({ anim: v })} />
                    <Opt label={tr('المؤشر', 'Cursor')} value={f.style.cursor} options={CURSOR_OPTIONS} onChange={(v) => setStyle({ cursor: v })} />
                    <Opt label={tr('الاتجاه', 'Direction')} value={f.style.direction} options={DIRECTION_OPTIONS} onChange={(v) => setStyle({ direction: v })} />
                  </div>
                </Group>
              </>
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
