'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import LayoutPicker from './LayoutPicker'
import NavIcon from './icons'
import SectionBgRows from './SectionBgRows'
import { Group, Opt } from './controls'
import { saveDesign } from '@/lib/design-actions'
import { saveFailureText } from '@/lib/action-error'
import { useDashLang } from './DashLang'
import {
  LAYOUT_OPTIONS,
  FONT_AR_OPTIONS,
  FONT_LATIN_OPTIONS,
  COMPONENT_OPTIONS,
  ANIM_OPTIONS,
  CURSOR_OPTIONS,
  DIRECTION_OPTIONS,
  DARK_PALETTES,
  LIGHT_PALETTES,
  BG_SECTIONS,
  GRADIENT_SUGGESTIONS,
  ANIMATED_SUGGESTIONS,
  SOLID_SUGGESTIONS,
  type BgForm,
  type SectionBgForm,
  type DesignForm,
} from '@/lib/design-types'

// Cover gradients, a set per theme: soft ones that dark text reads on, deep
// ones that white text reads on. The site animates the same ids slowly.
const LIGHT_GRADIENTS = [
  { id: 'peach', ar: 'خوخي', en: 'Peach', css: 'linear-gradient(120deg,#ffe4d2,#fcd5e5,#fff1c9)' },
  { id: 'sky', ar: 'سماوي', en: 'Sky', css: 'linear-gradient(120deg,#d6e8ff,#dff4fb,#e8e2ff)' },
  { id: 'fresh', ar: 'نعناعي', en: 'Mint', css: 'linear-gradient(120deg,#d3f5e4,#d2f3f0,#e6f6d6)' },
  { id: 'lilac', ar: 'ليلكي', en: 'Lilac', css: 'linear-gradient(120deg,#ebe4ff,#fbe1ef,#dfe6ff)' },
]
const DARK_GRADIENTS = [
  { id: 'midnight', ar: 'كحلي', en: 'Midnight', css: 'linear-gradient(120deg,#0b1026,#17245c,#2a1f5c)' },
  { id: 'embers', ar: 'جمري', en: 'Embers', css: 'linear-gradient(120deg,#140806,#5a1d0c,#7a2e0e)' },
  { id: 'forest', ar: 'غابة', en: 'Forest', css: 'linear-gradient(120deg,#03140f,#0b3b2e,#0d3440)' },
  { id: 'nebula', ar: 'بنفسجي', en: 'Nebula', css: 'linear-gradient(120deg,#120b2b,#3b1560,#5c1540)' },
]
// Ids from before the per-theme sets, still drawn for the sites that use them.
const OLD_GRADIENTS: Record<string, string> = {
  aurora: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
  sunset: 'linear-gradient(135deg,#f97316,#ec4899)',
  ocean: 'linear-gradient(135deg,#2563eb,#06b6d4)',
  candy: 'linear-gradient(135deg,#ec4899,#8b5cf6)',
  mint: 'linear-gradient(135deg,#10b981,#14b8a6)',
  ember: 'linear-gradient(135deg,#ef4444,#f59e0b)',
  dusk: 'linear-gradient(135deg,#6366f1,#ec4899)',
}
const gradientCss = (id: string) =>
  [...LIGHT_GRADIENTS, ...DARK_GRADIENTS].find((g) => g.id === id)?.css ?? OLD_GRADIENTS[id]

const clampPct = (v: number) => Math.max(0, Math.min(100, v))

/** The hero as it will look: layout, background, focus, veil, text size and place. */
function CoverPreview({ f, theme }: { f: DesignForm; theme: 'dark' | 'light' }) {
  const usingGradient = f.heroCover.gradient !== 'none'
  const light = theme === 'light'
  const gradCss = gradientCss(light ? f.heroCover.gradient : f.heroCover.gradientDark || f.heroCover.gradient)
  const variant = f.style.hero || 'split'
  const c = f.heroCover
  const bgStyle: React.CSSProperties = usingGradient
    ? { background: gradCss }
    : f.heroCoverUrl
      ? {
          backgroundImage: `url(${f.heroCoverUrl})`,
          backgroundSize: c.size === 'contain' ? 'contain' : 'cover',
          backgroundPosition: `${c.posX}% ${c.posY}%`,
          backgroundRepeat: 'no-repeat',
        }
      : {}
  const veil = (light ? c.overlayLight : c.overlay) || 0
  // A desk screen is 16:9; the section takes `height` of it.
  const ratio = `16 / ${(9 * c.height) / 100}`
  return (
    <div
      className={`cvp cvp-${variant}${light ? ' cvp-light' : ''}`}
      data-ha={c.align !== 'auto' ? c.align : undefined}
      data-va={c.valign !== 'auto' ? c.valign : undefined}
      style={{
        aspectRatio: ratio,
        ['--t' as string]: c.titleScale / 100,
        ['--d' as string]: c.descScale / 100,
      }}
    >
      <div className="cvp-bg" style={bgStyle} />
      <div className="cvp-overlay" style={{ opacity: veil / 100, background: light ? '#fff' : '#000' }} />
      <div className="cvp-content">
        <span className="cvp-name" />
        <span className="cvp-name cvp-name-2" />
        <span className="cvp-sub" />
        <span className="cvp-btn" />
      </div>
    </div>
  )
}

/** The whole picture, uncropped: a click marks the point that must stay in view. */
function FocusPicker({ url, x, y, onChange }: { url: string; x: number; y: number; onChange: (x: number, y: number) => void }) {
  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onChange(
      Math.round(clampPct(((e.clientX - r.left) / r.width) * 100)),
      Math.round(clampPct(((e.clientY - r.top) / r.height) * 100)),
    )
  }
  return (
    <div
      className="hx-focus"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        pick(e)
      }}
      onPointerMove={(e) => {
        if (e.buttons) pick(e)
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" draggable={false} />
      <span className="hx-dot" style={{ left: `${x}%`, top: `${y}%` }} />
    </div>
  )
}

/** A slider whose value is said in words next to its name. */
function Range({ label, value, min, max, shown, onChange }: { label: string; value: number; min: number; max: number; shown: string; onChange: (v: number) => void }) {
  return (
    <label className="hx-range">
      <span className="hx-range-top">
        <span>{label}</span>
        <b>{shown}</b>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

const HERO_STEPS = [
  { id: 'layout', ar: 'الشكل', en: 'Layout' },
  { id: 'cover', ar: 'الخلفية', en: 'Background' },
  { id: 'text', ar: 'الكلام', en: 'Text' },
] as const
type HeroStep = (typeof HERO_STEPS)[number]['id']
const V_POS = ['top', 'center', 'bottom'] as const
const H_POS = ['start', 'center', 'end'] as const

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

/** Arabic names for the ready-made colour sets. */
const SET_NAMES: Record<string, string> = {
  Midnight: 'كحلي', Ember: 'جمري', Ocean: 'محيط', Forest: 'غابة', Plum: 'برقوقي', Mono: 'أبيض وأسود',
  Aurora: 'شفق', Sunset: 'غروب', Lagoon: 'بحيرة', Nebula: 'سديم', Ink: 'حبر', Ash: 'رمادي',
  Espresso: 'قهوة', Harbour: 'ميناء', Salt: 'ملح', Paper: 'ورق', Fog: 'ضباب', Mist: 'شبورة',
  Sage: 'ميرمية', Blush: 'وردي', Cream: 'كريمي',
}

const THEME_STEPS = [
  { id: 'colors', ar: 'الألوان', en: 'Colours' },
  { id: 'page', ar: 'الخلفية', en: 'Background' },
  { id: 'sections', ar: 'الأقسام', en: 'Sections' },
] as const
type ThemeStep = (typeof THEME_STEPS)[number]['id']

type ThemeColors = { accent: string; bg: string; bg2: string; text: string; sub: string; heading: string }

/** A small page in this theme's colours, so each colour is seen where it goes. */
function ThemePreview({ col, bg, dark, tr }: { col: ThemeColors; bg: BgForm; dark: boolean; tr: (ar: string, en: string) => string }) {
  const stops = [bg.color1, bg.color2, bg.color3].filter(Boolean)
  const page: React.CSSProperties =
    bg.type === 'image' && bg.imageUrl
      ? { backgroundImage: `url(${bg.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : (bg.type === 'gradient' || bg.type === 'animated') && bg.color1
        ? { backgroundImage: `linear-gradient(135deg, ${(bg.type === 'gradient' ? stops.slice(0, 2) : stops).join(', ')})` }
        : { background: (bg.type === 'solid' && bg.color1) || col.bg }
  const heading = col.heading || col.text
  return (
    <div className="tp" style={{ ...page, color: col.text, backgroundColor: col.bg }}>
      {bg.type === 'image' && bg.imageUrl && (
        <div className="tp-dim" style={{ background: dark ? '#000' : '#fff', opacity: bg.dim / 100 }} />
      )}
      <div className="tp-in">
        <div className="tp-nav">
          <b style={{ background: col.accent }} />
          <span style={{ color: col.sub }}>{tr('أعمالي', 'Work')}</span>
          <span style={{ color: col.sub }}>{tr('عنّي', 'About')}</span>
          <span style={{ color: col.sub }}>{tr('تواصل', 'Contact')}</span>
        </div>
        <div className="tp-hero">
          <div className="tp-h1" style={{ color: heading }}>
            {tr('اسمك ', 'Your ')}
            <span style={{ color: col.accent }}>{tr('هنا', 'name')}</span>
          </div>
          <p style={{ color: col.sub }}>{tr('مصمم جرافيك بيحوّل الأفكار لصور بتتفهم من أول نظرة.', 'A designer who turns ideas into pictures that read at a glance.')}</p>
          <span className="tp-btn" style={{ background: col.accent }}>{tr('تواصل معايا', 'Get in touch')}</span>
        </div>
        <div className="tp-h2" style={{ color: heading }}>{tr('أعمالي', 'My work')}</div>
        <div className="tp-cards">
          {[0, 1, 2].map((i) => (
            <div key={i} className="tp-card" style={{ background: col.bg2 }}>
              <i style={{ background: `color-mix(in srgb, ${col.accent} 30%, ${col.bg2})` }} />
              <b style={{ color: col.text }}>{tr(`مشروع ${i + 1}`, `Project ${i + 1}`)}</b>
              <small style={{ color: col.sub }}>{tr('هوية بصرية', 'Branding')}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** One colour, with where it shows on the site under its name. */
function ColorRow({ label, hint, value, onChange, reset }: { label: string; hint: string; value: string; onChange: (v: string) => void; reset?: { label: string; start: string; onClick: () => void } }) {
  return (
    <div className="tc-row">
      {/* Unset, it shows the colour actually in use. */}
      <input type="color" value={value || reset?.start || '#000000'} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <div className="tc-txt">
        <b>{label}</b>
        <small>{hint}</small>
      </div>
      {reset && !value ? (
        <button type="button" className="tc-same" onClick={() => onChange(reset.start || '#888888')}>
          {reset.label}
        </button>
      ) : (
        <input className="tc-hex" value={value} dir="ltr" spellCheck={false} placeholder="#000000" onChange={(e) => onChange(e.target.value)} />
      )}
      {reset && value && (
        <button type="button" className="tc-clear" title={reset.label} onClick={reset.onClick}>
          ↺
        </button>
      )}
    </div>
  )
}

/**
 * Everything that belongs to one theme: its palette, the page background, and
 * any per-section backdrops — a step at a time, beside a page painted in it.
 * Rendered for light and for dark, so the two are styled independently.
 */
function ThemePanel({
  mode,
  f,
  tr,
  setColors,
  setBgFor,
  setSectionBg,
  save,
  busy,
}: {
  mode: 'light' | 'dark'
  f: DesignForm
  tr: (ar: string, en: string) => string
  setColors: (p: Partial<DesignForm['colors']>) => void
  setBgFor: (mode: 'dark' | 'light', p: Partial<BgForm>) => void
  setSectionBg: (rows: SectionBgForm[]) => void
  save: () => void
  busy: boolean
}) {
  const [step, setStep] = useState<ThemeStep>('colors')
  const dark = mode === 'dark'
  const bg = dark ? f.background : f.backgroundLight
  const setBg = (p: Partial<BgForm>) => setBgFor(mode, p)
  const palettes = dark ? DARK_PALETTES : LIGHT_PALETTES

  // Colour keys differ between the two halves of the palette.
  const k = dark
    ? { accent: 'accent', bg: 'bg', bg2: 'bg2', text: 'text', sub: 'subtext', heading: 'heading' }
    : { accent: 'accentLight', bg: 'bgLight', bg2: 'bg2Light', text: 'textLight', sub: 'subtextLight', heading: 'headingLight' }
  const cv = (key: string) => (f.colors as unknown as Record<string, string | null>)[key] || ''
  const setC = (key: string, v: string) => setColors({ [key]: v } as Partial<DesignForm['colors']>)
  const col: ThemeColors = { accent: cv(k.accent), bg: cv(k.bg), bg2: cv(k.bg2), text: cv(k.text), sub: cv(k.sub), heading: cv(k.heading) }

  const suggestions =
    bg.type === 'animated' ? ANIMATED_SUGGESTIONS : bg.type === 'gradient' ? GRADIENT_SUGGESTIONS : []
  const wide = step === 'sections'

  return (
    <div className={`hx${wide ? ' hx-wide' : ''}`}>
      <div className="panel hx-side">
        <div className="hx-steps">
          {THEME_STEPS.map((s, i) => (
            <button key={s.id} type="button" className={step === s.id ? 'on' : ''} onClick={() => setStep(s.id)}>
              <span className="hx-num">{i + 1}</span>
              {tr(s.ar, s.en)}
            </button>
          ))}
        </div>

        {step === 'colors' && (
          <>
            <p className="hx-lead">
              {dark
                ? tr('ألوان موقعك لما الزائر يختار الثيم الداكن. ابدأ بمجموعة جاهزة وعدّل عليها.', 'Your site’s colours in the dark theme. Start from a set, then adjust.')
                : tr('ألوان موقعك لما الزائر يختار الثيم الفاتح. ابدأ بمجموعة جاهزة وعدّل عليها.', 'Your site’s colours in the light theme. Start from a set, then adjust.')}
            </p>
            <div className="hx-block">
              <div className="hx-label">{tr('مجموعات جاهزة', 'Ready-made sets')}</div>
              <div className="tc-sets">
                {palettes.map((p) => {
                  const on = col.accent.toLowerCase() === p.accent.toLowerCase() && col.bg.toLowerCase() === p.bg.toLowerCase()
                  return (
                    <button
                      key={p.name}
                      type="button"
                      className={`tc-set${on ? ' on' : ''}`}
                      style={{ background: p.bg, color: p.text }}
                      onClick={() =>
                        setColors({
                          [k.accent]: p.accent,
                          [k.bg]: p.bg,
                          [k.bg2]: p.bg2,
                          [k.text]: p.text,
                          [k.sub]: p.subtext,
                          [k.heading]: '',
                        } as Partial<DesignForm['colors']>)
                      }
                    >
                      <span className="tc-dots">
                        <i style={{ background: p.accent }} />
                        <i style={{ background: p.bg2 }} />
                      </span>
                      {tr(SET_NAMES[p.name] ?? p.name, p.name)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="hx-block tc-list">
              <div className="hx-label">{tr('الألوان بالتفصيل', 'Each colour')}</div>
              <ColorRow label={tr('اللون المميّز', 'Accent')} hint={tr('الأزرار والروابط وجزء من اسمك', 'Buttons, links, part of your name')} value={col.accent} onChange={(v) => setC(k.accent, v)} />
              <ColorRow
                label={tr('العناوين', 'Headings')}
                hint={tr('اسمك وعناوين الأقسام', 'Your name and section titles')}
                value={col.heading}
                onChange={(v) => setC(k.heading, v)}
                reset={{ label: tr('زي لون النص — اختار لون', 'Same as text — pick one'), start: col.text, onClick: () => setC(k.heading, '') }}
              />
              <ColorRow label={tr('النص', 'Text')} hint={tr('الكلام العادي', 'Body text')} value={col.text} onChange={(v) => setC(k.text, v)} />
              <ColorRow label={tr('النص الخافت', 'Muted text')} hint={tr('الأوصاف والتفاصيل الصغيرة', 'Descriptions and small details')} value={col.sub} onChange={(v) => setC(k.sub, v)} />
              <ColorRow label={tr('الخلفية', 'Background')} hint={tr('لون الصفحة', 'The page colour')} value={col.bg} onChange={(v) => setC(k.bg, v)} />
              <ColorRow label={tr('الكروت', 'Cards')} hint={tr('خلفية كروت المشاريع والخدمات', 'Behind project and service cards')} value={col.bg2} onChange={(v) => setC(k.bg2, v)} />
            </div>
          </>
        )}

        {step === 'page' && (
          <>
            <p className="hx-lead">{tr('اللي بيبان ورا الموقع كله. سيبها «لون واحد» علشان تاخد لون الخلفية من الألوان.', 'What sits behind the whole site. Leave it on “one colour” to use the background colour.')}</p>
            <div className="hx-block">
              <Opt
                label={tr('النوع', 'Type')}
                value={bg.type}
                options={[
                  { value: 'solid', label: tr('لون واحد', 'One colour') },
                  { value: 'gradient', label: tr('تدرّج', 'Gradient') },
                  { value: 'animated', label: tr('تدرّج متحرّك', 'Moving gradient') },
                  { value: 'image', label: tr('صورة', 'Image') },
                ]}
                onChange={(v) => setBg({ type: v })}
              />
            </div>

            {bg.type === 'solid' && (
              <div className="hx-block">
                <div className="hx-label">
                  {tr('اللون', 'Colour')}
                  <small>{bg.color1 ? tr('لون مختلف عن «الخلفية» في الألوان.', 'A colour other than the palette’s background.') : tr('بياخد «الخلفية» من خطوة الألوان.', 'Uses the background from the colours step.')}</small>
                </div>
                <div className="bg-suggestions">
                  {SOLID_SUGGESTIONS.map((s) => (
                    <button key={s.name} type="button" className="bg-sugg" onClick={() => setBg({ color1: dark ? s.dark : s.light })}>
                      <span className="bg-sugg-swatch" style={{ background: dark ? s.dark : s.light }} />
                      {tr(SET_NAMES[s.name] ?? s.name, s.name)}
                    </button>
                  ))}
                </div>
                <ColorRow
                  label={tr('لون الصفحة', 'Page colour')}
                  hint={tr('ورا كل الأقسام', 'Behind every section')}
                  value={bg.color1}
                  onChange={(v) => setBg({ color1: v })}
                  reset={{ label: tr('زي الألوان — اختار لون', 'Same as palette — pick one'), start: col.bg, onClick: () => setBg({ color1: '' }) }}
                />
              </div>
            )}

            {(bg.type === 'gradient' || bg.type === 'animated') && (
              <div className="hx-block">
                <div className="hx-label">{tr('اختار تدرّج', 'Pick a blend')}</div>
                <div className="bg-suggestions">
                  {suggestions.map((s) => {
                    const cols = dark ? s.dark : s.light
                    return (
                      <button key={s.name} type="button" className="bg-sugg" onClick={() => setBg({ color1: cols[0], color2: cols[1], color3: cols[2] || '' })}>
                        <span className="bg-sugg-swatch" style={{ background: `linear-gradient(135deg, ${cols.join(', ')})` }} />
                        {tr(SET_NAMES[s.name] ?? s.name, s.name)}
                      </button>
                    )
                  })}
                </div>
                <div className="hx-label">{tr('أو اختار الألوان بنفسك', 'Or set the colours yourself')}</div>
                <ColorRow label={tr('اللون الأول', 'First colour')} hint="" value={bg.color1} onChange={(v) => setBg({ color1: v })} />
                <ColorRow label={tr('اللون التاني', 'Second colour')} hint="" value={bg.color2} onChange={(v) => setBg({ color2: v })} />
                {bg.type === 'animated' && (
                  <ColorRow label={tr('اللون التالت', 'Third colour')} hint="" value={bg.color3} onChange={(v) => setBg({ color3: v })} />
                )}
              </div>
            )}

            {bg.type === 'image' && (
              <div className="hx-block">
                <MediaUploader
                  big
                  dim={bg.dim}
                  previewUrl={bg.imageUrl}
                  label={tr('ارفع صورة الخلفية', 'Upload a background image')}
                  onUploaded={(m) => setBg({ imageId: m.id, imageUrl: m.url ?? m.thumbUrl })}
                  onRemove={() => setBg({ imageId: null, imageUrl: null })}
                />
                <Opt
                  label={tr('لما الزائر ينزل في الصفحة', 'When the visitor scrolls')}
                  value={bg.imageFixed ? 'fixed' : 'scroll'}
                  options={[
                    { value: 'fixed', label: tr('الصورة ثابتة', 'Picture stays put') },
                    { value: 'scroll', label: tr('بتتحرك مع الصفحة', 'Moves with the page') },
                  ]}
                  onChange={(v) => setBg({ imageFixed: v === 'fixed' })}
                />
                <Range label={tr('تعتيم الصورة', 'Dim the picture')} value={bg.dim} min={0} max={100} shown={`${bg.dim}%`} onChange={(v) => setBg({ dim: v })} />
              </div>
            )}
          </>
        )}

        {step === 'sections' && (
          <>
            <p className="hx-lead">{tr('لو عايز قسم معيّن بخلفية مختلفة عن باقي الصفحة: لون، صورة، أو فيديو.', 'Give one section a background of its own: a colour, a picture or a video.')}</p>
            <div className="hx-block">
              <SectionBgRows rows={f.sectionBg} sections={BG_SECTIONS} tr={tr} onChange={setSectionBg} />
            </div>
          </>
        )}

        <div className="hx-foot">
          {step !== 'sections' ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(step === 'colors' ? 'page' : 'sections')}>
              {tr('الخطوة الجاية ←', 'Next step →')}
            </button>
          ) : (
            <span />
          )}
          <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
            {busy ? '…' : tr('حفظ', 'Save')}
          </button>
        </div>
      </div>

      {!wide && (
        <div className="panel hx-stage">
          <div className="hx-stage-head">
            <span className="lbl">{tr('معاينة', 'Preview')}</span>
            <span className="cover-hint">
              {dark ? tr('الثيم الداكن — ومش بيتنشر غير لما تحفظ.', 'Dark theme — nothing is published until you save.') : tr('الثيم الفاتح — ومش بيتنشر غير لما تحفظ.', 'Light theme — nothing is published until you save.')}
            </span>
          </div>
          <ThemePreview col={col} bg={bg} dark={dark} tr={tr} />
        </div>
      )}
    </div>
  )
}

export default function DesignEditor({ initial }: { initial: DesignForm }) {
  const [f, setF] = useState<DesignForm>(initial)
  const [tab, setTab] = useState<TopTab>('theme')
  const [sub, setSub] = useState<ThemeSub>('dark')
  const [heroStep, setHeroStep] = useState<HeroStep>('layout')
  const [pvTheme, setPvTheme] = useState<'dark' | 'light'>('dark')
  const [busy, setBusy] = useState(false)
  const { t: tr } = useDashLang()
  const [toast, setToast] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
    try {
      const r = await saveDesign(f)
      if (!r.ok) return setError(saveFailureText(r, tr))
      setToast(true)
      setTimeout(() => setToast(false), 1800)
    } catch (e) {
      // Without this the button sat on "…" for ever and the failure was
      // invisible — which is exactly how a rejected field looked.
      setError(saveFailureText(e, tr))
    } finally {
      setBusy(false)
    }
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

          {(sub === 'light' || sub === 'dark') && (
            <ThemePanel
              key={sub}
              mode={sub}
              f={f}
              tr={tr}
              setColors={setColors}
              setBgFor={setBgFor}
              setSectionBg={setSectionBg}
              save={save}
              busy={busy}
            />
          )}

          {sub === 'general' && (
          <div className="panel">
              <>
                <Group title={tr('شعار الموقع', 'Site logo')}>
                  {/* The mark in the navbar. There was no way to set it at all
                      before — the site showed the first letter of the name and
                      that was that. */}
                  <div className="logo-row">
                    <MediaUploader
                      big
                      previewUrl={f.brandLogoUrl}
                      label={tr('ارفع الشعار', 'Upload logo')}
                      onUploaded={(u) => set({ brandLogoId: u.id, brandLogoUrl: u.thumbUrl })}
                    />
                    <div className="logo-note">
                      <p>
                        {tr(
                          'بيظهر في الشريط العلوي. من غيره بيظهر أول حرف من اسمك.',
                          'Shown in the navbar. Without one, the first letter of your name is used.',
                        )}
                      </p>
                      {f.brandLogoUrl && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => set({ brandLogoId: null, brandLogoUrl: null })}
                        >
                          {tr('حذف الشعار', 'Remove logo')}
                        </button>
                      )}
                    </div>
                  </div>
                </Group>

                <Group title={tr('المكوّنات', 'Components')}>
                  <div className="de-grid">
                    <Opt label={tr('شكل الكروت', 'Card style')} value={f.components.card} options={COMPONENT_OPTIONS.card} onChange={(v) => setComp({ card: v })} />
                    <Opt label={tr('الشريط العلوي', 'Navbar')} value={f.components.navbar} options={COMPONENT_OPTIONS.navbar} onChange={(v) => setComp({ navbar: v })} />
                    <Opt label={tr('الأزرار', 'Buttons')} value={f.components.button} options={COMPONENT_OPTIONS.button} onChange={(v) => setComp({ button: v })} />
                  </div>
                </Group>
                <Group title={tr('الخطوط', 'Fonts')}>
                  <Opt label={tr('الخط العربي', 'Arabic font')} value={f.style.fontAr} options={FONT_AR_OPTIONS} onChange={(v) => setStyle({ fontAr: v })} />
                  <Opt label={tr('الخط اللاتيني (العناوين)', 'Latin font (headings)')} value={f.style.fontLatin} options={FONT_LATIN_OPTIONS} onChange={(v) => setStyle({ fontLatin: v })} />
                </Group>
                <Group title={tr('الحركة', 'Motion')}>
                  <div className="de-grid">
                    <Opt label={tr('الحركات', 'Animations')} value={f.style.anim} options={ANIM_OPTIONS} onChange={(v) => setStyle({ anim: v })} />
                    <Opt label={tr('المؤشر', 'Cursor')} value={f.style.cursor} options={CURSOR_OPTIONS} onChange={(v) => setStyle({ cursor: v })} />
                    <Opt label={tr('الاتجاه', 'Direction')} value={f.style.direction} options={DIRECTION_OPTIONS} onChange={(v) => setStyle({ direction: v })} />
                  </div>
                </Group>
              </>
          </div>
          )}
        </>
      )}

      {/* ═══ HERO SECTION TAB ═══ */}
      {tab === 'hero' && (
        /* The settings in one column beside the preview, a step at a time.
           Four columns of every setting under the preview meant scrolling away
           from the thing each control changes, and no clue where to start. */
        <div className="hx">
          <div className="panel hx-side">
            <div className="hx-steps">
              {HERO_STEPS.map((s, i) => (
                <button key={s.id} type="button" className={heroStep === s.id ? 'on' : ''} onClick={() => setHeroStep(s.id)}>
                  <span className="hx-num">{i + 1}</span>
                  {tr(s.ar, s.en)}
                </button>
              ))}
            </div>

            {heroStep === 'layout' && (
              <>
                <p className="hx-lead">{tr('اختار شكل أول جزء بيشوفه الزائر.', 'Pick how the first screen a visitor sees is laid out.')}</p>
                <div className="hx-layouts">{sectionLayout('hero', '')}</div>
              </>
            )}

            {heroStep === 'cover' && (
              <>
                <p className="hx-lead">{tr('الخلفية اللي ورا اسمك: صورة أو ألوان متدرّجة.', 'What sits behind your name: a picture or a colour blend.')}</p>
                <div className="seg2">
                  <button type="button" className={!usingGradient ? 'active' : ''} onClick={() => setCover({ gradient: 'none' })}>
                    {tr('🖼 صورة', '🖼 Image')}
                  </button>
                  <button type="button" className={usingGradient ? 'active' : ''} onClick={() => {
                      if (!usingGradient) setCover({ gradient: 'peach', gradientDark: f.heroCover.gradientDark || 'midnight' })
                    }}>
                    {tr('🎨 ألوان متدرّجة', '🎨 Gradient')}
                  </button>
                </div>

                {usingGradient ? (
                  <div className="hx-block">
                    {(
                      [
                        { key: 'gradient', list: LIGHT_GRADIENTS, theme: 'light', title: tr('☀️ للثيم الفاتح', '☀️ Light theme') },
                        { key: 'gradientDark', list: DARK_GRADIENTS, theme: 'dark', title: tr('🌙 للثيم الغامق', '🌙 Dark theme') },
                      ] as const
                    ).map((set) => (
                      <div key={set.key}>
                        <div className="hx-label">{set.title}</div>
                        <div className="hgp hx-grads">
                          {set.list.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              className={`hgp-swatch ${f.heroCover[set.key] === g.id ? 'active' : ''}`}
                              style={{ background: g.css }}
                              onClick={() => {
                                setPvTheme(set.theme)
                                setCover({ [set.key]: g.id })
                              }}
                            >
                              <span>{tr(g.ar, g.en)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !f.heroCoverUrl ? (
                  <div className="hx-block">
                    <MediaUploader key="none" label={tr('ارفع صورة الخلفية', 'Upload a cover image')} onUploaded={(m) => set({ heroCoverId: m.id, heroCoverUrl: m.thumbUrl })} />
                  </div>
                ) : (
                  <>
                    <div className="hx-block">
                      <div className="hx-label">
                        {tr('دوس على أهم جزء في الصورة', 'Click the part of the picture that matters most')}
                        <small>{tr('زي وشّك — علشان يفضل ظاهر لما الصورة تتقص', 'like a face — it stays in view when the picture is cropped')}</small>
                      </div>
                      <FocusPicker
                        url={f.heroCoverUrl}
                        x={f.heroCover.posX}
                        y={f.heroCover.posY}
                        onChange={(posX, posY) => setCover({ posX, posY })}
                      />
                      <div className="hx-row">
                        <MediaUploader key={f.heroCoverUrl} compact label={tr('غيّر الصورة', 'Replace image')} onUploaded={(m) => set({ heroCoverId: m.id, heroCoverUrl: m.thumbUrl })} />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => set({ heroCoverId: null, heroCoverUrl: null })}>
                          {tr('شيل الصورة', 'Remove')}
                        </button>
                      </div>
                    </div>
                    <div className="hx-block">
                      <Opt
                        label={tr('الصورة تظهر إزاي؟', 'How the picture fits')}
                        value={f.heroCover.size}
                        options={[
                          { value: 'cover', label: tr('تملا المساحة (بتتقص)', 'Fill the space (crops)') },
                          { value: 'contain', label: tr('كاملة من غير قص', 'Whole, uncropped') },
                        ]}
                        onChange={(v) => setCover({ size: v })}
                      />
                    </div>
                  </>
                )}

                <div className="hx-block">
                  <div className="hx-label">
                    {tr('تعتيم الخلفية', 'Dim the background')}
                    <small>{tr('علشان الكلام يبان فوق الصورة. المعاينة بتوريك الثيم اللي بتعدّله.', 'So the text reads over the picture. The preview follows the theme you adjust.')}</small>
                  </div>
                  <Range label={tr('🌙 في الثيم الداكن', '🌙 Dark theme')} value={f.heroCover.overlay} min={0} max={100} shown={`${f.heroCover.overlay}%`} onChange={(v) => { setPvTheme('dark'); setCover({ overlay: v }) }} />
                  <Range label={tr('☀️ في الثيم الفاتح', '☀️ Light theme')} value={f.heroCover.overlayLight} min={0} max={100} shown={`${f.heroCover.overlayLight}%`} onChange={(v) => { setPvTheme('light'); setCover({ overlayLight: v }) }} />
                </div>
              </>
            )}

            {heroStep === 'text' && (
              <>
                <p className="hx-lead">{tr('حجم الكلام ومكانه، وطول القسم.', 'How big the text is, where it sits, and how tall the section is.')}</p>
                <div className="hx-block">
                  <div className="hx-label">{tr('مكان الكلام', 'Where the text sits')}</div>
                  <div className="hx-place">
                    <div className="hx-grid" role="radiogroup">
                      {V_POS.map((v) =>
                        H_POS.map((h) => {
                          const on = f.heroCover.valign === v && f.heroCover.align === h
                          return (
                            <button
                              key={`${v}-${h}`}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              className={on ? 'on' : ''}
                              onClick={() => setCover({ valign: v, align: h })}
                            >
                              <span />
                            </button>
                          )
                        }),
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        className={`pill ${f.heroCover.align === 'auto' && f.heroCover.valign === 'auto' ? 'active' : ''}`}
                        onClick={() => setCover({ align: 'auto', valign: 'auto' })}
                      >
                        {tr('تلقائي حسب الشكل', 'Automatic')}
                      </button>
                      <p className="hx-note">{tr('أو دوس على المربع اللي عايز الكلام فيه.', 'Or click the square you want the text in.')}</p>
                    </div>
                  </div>
                </div>
                <div className="hx-block">
                  <Range label={tr('حجم العنوان', 'Heading size')} value={f.heroCover.titleScale} min={50} max={160} shown={`${f.heroCover.titleScale}%`} onChange={(v) => setCover({ titleScale: v })} />
                  <Range label={tr('حجم الوصف', 'Description size')} value={f.heroCover.descScale} min={50} max={200} shown={`${f.heroCover.descScale}%`} onChange={(v) => setCover({ descScale: v })} />
                  <Range
                    label={tr('طول القسم', 'Section height')}
                    value={f.heroCover.height}
                    min={40}
                    max={100}
                    shown={f.heroCover.height >= 100 ? tr('الشاشة كلها', 'Full screen') : tr(`${f.heroCover.height}% من الشاشة`, `${f.heroCover.height}% of the screen`)}
                    onChange={(v) => setCover({ height: v })}
                  />
                </div>
              </>
            )}

            <div className="hx-foot">
              {heroStep !== 'text' ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHeroStep(heroStep === 'layout' ? 'cover' : 'text')}>
                  {tr('الخطوة الجاية ←', 'Next step →')}
                </button>
              ) : (
                <span />
              )}
              <button className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
                {busy ? '…' : tr('حفظ', 'Save')}
              </button>
            </div>
          </div>

          <div className="panel hx-stage">
            <div className="hx-stage-head">
              <span className="lbl">{tr('معاينة', 'Preview')}</span>
              <span className="cover-hint">{tr('بتتغيّر وانت بتعدّل — ومش بتتنشر غير لما تحفظ.', 'Changes as you edit — nothing is published until you save.')}</span>
              <div className="lx-seg">
                <button type="button" className={pvTheme === 'dark' ? 'on' : ''} onClick={() => setPvTheme('dark')} title={tr('داكن', 'Dark')}>🌙</button>
                <button type="button" className={pvTheme === 'light' ? 'on' : ''} onClick={() => setPvTheme('light')} title={tr('فاتح', 'Light')}>☀️</button>
              </div>
            </div>
            <CoverPreview f={f} theme={pvTheme} />
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
      {error && (
        <div className="toast toast-error" onClick={() => setError(null)}>
          {tr('الحفظ فشل: ', 'Save failed: ')}
          {error}
        </div>
      )}
    </div>
  )
}
