// Client-safe types + option lists for the Design tab (no server imports).

/** One theme's page background. */
export type BgForm = {
  preset: string
  /** solid | gradient | animated | image */
  type: string
  color1: string
  color2: string
  color3: string
  imageId: number | null
  imageUrl: string | null
  imageFixed: boolean
  dim: number
}

/** A backdrop for a single section, overriding the page background.
 *  Each row belongs to one theme, so light and dark are fully independent. */
export type SectionBgForm = {
  /** dark | light */
  theme: string
  section: string
  /** color | image | video */
  mode: string
  color: string
  imageId: number | null
  imageUrl: string | null
  videoUrl: string
  fixed: boolean
  dim: number
}

export const emptyBg = (): BgForm => ({
  preset: 'dark',
  type: 'solid',
  color1: '',
  color2: '',
  color3: '',
  imageId: null,
  imageUrl: null,
  imageFixed: true,
  dim: 55,
})

export const emptySectionBg = (theme = 'dark'): SectionBgForm => ({
  theme,
  section: 'about',
  mode: 'color',
  color: '',
  imageId: null,
  imageUrl: null,
  videoUrl: '',
  fixed: false,
  dim: 45,
})

/** Sections a backdrop can be attached to (matches SECTION_IDS server-side). */
export const BG_SECTIONS: { id: string; ar: string; en: string }[] = [
  { id: 'hero', ar: 'الرئيسية', en: 'Hero' },
  { id: 'about', ar: 'عن النفس', en: 'About' },
  { id: 'projects', ar: 'المشاريع', en: 'Projects' },
  { id: 'achievements', ar: 'الإنجازات', en: 'Achievements' },
  { id: 'expertise', ar: 'الخدمات', en: 'Services' },
  { id: 'testimonials', ar: 'الآراء', en: 'Testimonials' },
  { id: 'logos', ar: 'العملاء', en: 'Clients' },
  { id: 'experience', ar: 'الخبرات', en: 'Experience' },
  { id: 'tools', ar: 'الأدوات', en: 'Tools' },
  { id: 'education', ar: 'التعليم', en: 'Education' },
  { id: 'skills', ar: 'المهارات', en: 'Skills' },
  { id: 'contact', ar: 'التواصل', en: 'Contact' },
]

/** Ready-made gradients, offered per background type. */
export const GRADIENT_SUGGESTIONS: { name: string; dark: string[]; light: string[] }[] = [
  { name: 'Midnight', dark: ['#0F172A', '#1E293B'], light: ['#E2E8F0', '#F8FAFC'] },
  { name: 'Ember', dark: ['#1C0A00', '#7C2D12'], light: ['#FFF7ED', '#FFEDD5'] },
  { name: 'Ocean', dark: ['#082F49', '#0E7490'], light: ['#ECFEFF', '#CFFAFE'] },
  { name: 'Forest', dark: ['#052E16', '#166534'], light: ['#F0FDF4', '#DCFCE7'] },
  { name: 'Violet', dark: ['#2E1065', '#6D28D9'], light: ['#F5F3FF', '#EDE9FE'] },
  { name: 'Mono', dark: ['#000000', '#1F1F1F'], light: ['#FFFFFF', '#F1F1F1'] },
]

/** Three-stop sets that read well once they're moving. */
export const ANIMATED_SUGGESTIONS: { name: string; dark: string[]; light: string[] }[] = [
  { name: 'Aurora', dark: ['#0F172A', '#7C3AED', '#0EA5E9'], light: ['#EDE9FE', '#DBEAFE', '#FAE8FF'] },
  { name: 'Sunset', dark: ['#1E1B4B', '#B91C1C', '#F97316'], light: ['#FFE4E6', '#FFEDD5', '#FEF3C7'] },
  { name: 'Lagoon', dark: ['#022C22', '#0F766E', '#0284C7'], light: ['#ECFDF5', '#CFFAFE', '#E0F2FE'] },
  { name: 'Nebula', dark: ['#111827', '#4C1D95', '#BE185D'], light: ['#F3F4F6', '#EDE9FE', '#FCE7F3'] },
]

/** Flat page colours. */
export const SOLID_SUGGESTIONS: { name: string; dark: string; light: string }[] = [
  { name: 'Ink', dark: '#0A0A0A', light: '#FFFFFF' },
  { name: 'Slate', dark: '#0F172A', light: '#F8FAFC' },
  { name: 'Coffee', dark: '#1C1917', light: '#FAF9F7' },
  { name: 'Navy', dark: '#0B1120', light: '#F1F5F9' },
]

export type DesignForm = {
  colors: {
    accent: string
    bg: string
    bg2: string
    text: string
    subtext: string
    accentLight: string
    bgLight: string
    bg2Light: string
    textLight: string
    subtextLight: string
  }
  background: BgForm
  backgroundLight: BgForm
  sectionBg: SectionBgForm[]
  style: {
    theme: string
    hero: string
    about: string
    projects: string
    expertise: string
    contact: string
    skills: string
    tools: string
    exp: string
    font: string
    direction: string
    cursor: string
    anim: string
  }
  components: { card: string; navbar: string; button: string }
  heroCover: {
    size: string
    posX: number
    posY: number
    overlay: number
    height: number
    gradient: string
  }
  heroCoverId: number | null
  heroCoverUrl: string | null
}

export const LAYOUT_OPTIONS = {
  hero: ['centered', 'split', 'massive', 'cover-full', 'minimal'],
  about: ['classic', 'visual', 'simple'],
  projects: ['grid', 'masonry', 'list', 'freegrid'],
  expertise: ['grid', 'stack'],
  contact: ['classic', 'split'],
  skills: ['tags', 'inline', 'bars'],
  tools: ['classic', 'compact'],
  exp: ['classic', 'timeline'],
} as const

// Labels name the faces that actually render. `default` used to claim Cairo
// while the variable held Tajawal, which is why the dashboard and the site
// disagreed; Cairo is now its own option.
export const FONT_OPTIONS = [
  { value: 'default', label: 'Tajawal · Montserrat' },
  { value: 'cairo', label: 'Cairo · Montserrat' },
  { value: 'modern', label: 'Tajawal · Inter' },
  { value: 'editorial', label: 'Almarai · Playfair' },
  { value: 'elegant', label: 'Markazi · Cormorant' },
  { value: 'bold', label: 'Cairo · Bebas Neue' },
]

export const COMPONENT_OPTIONS = {
  card: ['solid', 'glass', 'outline'],
  navbar: ['blur', 'solid', 'transparent'],
  button: ['rounded', 'sharp', 'pill'],
} as const

export const BG_PRESETS = ['dark', 'ocean', 'sunset', 'forest', 'mono', 'pearl']
export const ANIM_OPTIONS = ['fade-up', 'fade', 'none']
export const CURSOR_OPTIONS = ['default', 'dot-ring']
export const DIRECTION_OPTIONS = ['auto', 'rtl', 'ltr']

export type Palette = { name: string; accent: string; bg: string; bg2: string; text: string; subtext: string }

/** Dark-mode ready palettes (set the accent/bg/bg2/text/subtext dark colours). */
export const DARK_PALETTES: Palette[] = [
  { name: 'Orange', accent: '#F97316', bg: '#0A0A0A', bg2: '#111111', text: '#FFFFFF', subtext: '#999999' },
  { name: 'Violet', accent: '#8B5CF6', bg: '#0A0A0A', bg2: '#121016', text: '#FFFFFF', subtext: '#9a93a8' },
  { name: 'Ocean', accent: '#38BDF8', bg: '#0A1628', bg2: '#0F1F3D', text: '#FFFFFF', subtext: '#9fb3c8' },
  { name: 'Emerald', accent: '#10B981', bg: '#0A1A0F', bg2: '#0F2A1F', text: '#FFFFFF', subtext: '#9fb3a8' },
  { name: 'Rose', accent: '#F43F5E', bg: '#1A0A14', bg2: '#3A1520', text: '#FFFFFF', subtext: '#c89fae' },
  { name: 'Slate', accent: '#60A5FA', bg: '#0B0F1A', bg2: '#141B2D', text: '#FFFFFF', subtext: '#9aa7bd' },
]

/** Light-mode ready palettes (set the *Light colours). */
export const LIGHT_PALETTES: Palette[] = [
  { name: 'Pearl', accent: '#EA6C0A', bg: '#FFFFFF', bg2: '#F3F5F8', text: '#0C0F16', subtext: '#495265' },
  { name: 'Cream', accent: '#C2410C', bg: '#FBF8F2', bg2: '#FFFFFF', text: '#1A140C', subtext: '#6B5E4E' },
  { name: 'Sky', accent: '#0284C7', bg: '#F6FAFF', bg2: '#FFFFFF', text: '#0B1B2B', subtext: '#3E5468' },
  { name: 'Mint', accent: '#047857', bg: '#F5FBF7', bg2: '#FFFFFF', text: '#0B1F16', subtext: '#3F5A4E' },
  { name: 'Blush', accent: '#BE123C', bg: '#FFF7F9', bg2: '#FFFFFF', text: '#2A0E15', subtext: '#6B4550' },
  { name: 'Graphite', accent: '#4F46E5', bg: '#F4F5F7', bg2: '#FFFFFF', text: '#14161C', subtext: '#4A5060' },
]

/** Back-compat alias (was a single flat list). */
export const PALETTE_PRESETS: Palette[] = DARK_PALETTES

export const emptyDesign = (): DesignForm => ({
  colors: {
    accent: '#F97316',
    bg: '#0A0A0A',
    bg2: '#111111',
    text: '#FFFFFF',
    subtext: '#999999',
    accentLight: '#EA6C0A',
    bgLight: '#FFFFFF',
    bg2Light: '#F3F5F8',
    textLight: '#0C0F16',
    subtextLight: '#495265',
  },
  background: emptyBg(),
  backgroundLight: { ...emptyBg(), preset: 'pearl' },
  sectionBg: [],
  style: {
    theme: 'default',
    hero: 'centered',
    about: 'classic',
    projects: 'grid',
    expertise: 'grid',
    contact: 'classic',
    skills: 'tags',
    tools: 'classic',
    exp: 'classic',
    font: 'default',
    direction: 'auto',
    cursor: 'default',
    anim: 'fade-up',
  },
  components: { card: 'solid', navbar: 'blur', button: 'rounded' },
  heroCover: { size: 'cover', posX: 50, posY: 50, overlay: 45, height: 82, gradient: 'none' },
  heroCoverId: null,
  heroCoverUrl: null,
})
