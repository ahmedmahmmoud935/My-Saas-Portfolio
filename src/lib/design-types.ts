// Client-safe types + option lists for the Design tab (no server imports).

/** One theme's page background. */
export type BgForm = {
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

/**
 * Ready-made gradients, offered per background type.
 *
 * The light halves used to be two near-whites each, which is why every
 * suggestion looked like the same pale smudge: a gradient needs somewhere to
 * travel. Each light pair now moves from a tinted stop to a paler one, and the
 * dark pairs open up too.
 */
export const GRADIENT_SUGGESTIONS: { name: string; dark: string[]; light: string[] }[] = [
  { name: 'Midnight', dark: ['#0B1024', '#243B6B'], light: ['#E7ECF7', '#FFFFFF'] },
  { name: 'Ember', dark: ['#1A0A05', '#8A3B12'], light: ['#FFE7D2', '#FFF6EC'] },
  { name: 'Ocean', dark: ['#04202E', '#0B6E8C'], light: ['#C9E9F5', '#F0FBFF'] },
  { name: 'Forest', dark: ['#04180E', '#1B5E3A'], light: ['#CFE8D8', '#F3FBF6'] },
  { name: 'Plum', dark: ['#1A0A2E', '#6B21A8'], light: ['#E2D2F7', '#F8F3FF'] },
  { name: 'Mono', dark: ['#000000', '#2E2E2E'], light: ['#D8D8D8', '#FFFFFF'] },
]

/** Three-stop sets that read well once they're moving. */
export const ANIMATED_SUGGESTIONS: { name: string; dark: string[]; light: string[] }[] = [
  { name: 'Aurora', dark: ['#0B1024', '#7C3AED', '#0EA5E9'], light: ['#DCE7FF', '#EFD9FF', '#CFF3FF'] },
  { name: 'Sunset', dark: ['#1E1B4B', '#B91C1C', '#F97316'], light: ['#FFD9C7', '#FFC9D6', '#FFE9B8'] },
  { name: 'Lagoon', dark: ['#022C22', '#0F766E', '#0284C7'], light: ['#CFF0E4', '#BFE9F5', '#D8E6FF'] },
  { name: 'Nebula', dark: ['#111827', '#4C1D95', '#BE185D'], light: ['#E4E6F5', '#D9CBF5', '#F8CFE4'] },
]

/** Flat page colours — one per palette above, so the two pickers agree. */
export const SOLID_SUGGESTIONS: { name: string; dark: string; light: string }[] = [
  { name: 'Ink', dark: '#0A0A0A', light: '#FFFFFF' },
  { name: 'Ash', dark: '#16181D', light: '#E7E9EE' },
  { name: 'Midnight', dark: '#0B1024', light: '#EEF2F7' },
  { name: 'Forest', dark: '#08150F', light: '#F0F5F1' },
  { name: 'Plum', dark: '#140A1E', light: '#FDF2F4' },
  { name: 'Espresso', dark: '#16100C', light: '#FBF6EC' },
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
    hero: string
    about: string
    projects: string
    expertise: string
    contact: string
    skills: string
    tools: string
    exp: string
    font: string
    fontAr: string
    fontLatin: string
    direction: string
    cursor: string
    anim: string
  }
  components: { card: string; navbar: string; button: string }
  heroCover: {
    size: string
    posX: number
    posY: number
    /** Veil strength over the cover in the dark theme. */
    overlay: number
    /** …and in the light theme, where the veil is white, not black. */
    overlayLight: number
    height: number
    gradient: string
  }
  heroCoverId: number | null
  /** The mark shown in the navbar. Without one the site falls back to the
   *  first letter of the name. */
  brandLogoId: number | null
  brandLogoUrl: string | null
  heroCoverUrl: string | null
}

export const LAYOUT_OPTIONS = {
  hero: ['centered', 'split', 'massive', 'cover-full', 'minimal'],
  about: ['classic', 'visual', 'simple'],
  projects: ['grid', 'masonry', 'list'],
  expertise: ['grid', 'stack'],
  contact: ['classic', 'split'],
  skills: ['tags', 'inline', 'bars'],
  tools: ['classic', 'compact'],
  exp: ['classic', 'timeline'],
} as const

/**
 * The two faces are picked separately.
 *
 * They used to come as six fixed pairs, which meant six combinations out of the
 * nine faces already being loaded. Choosing each side gives twenty from exactly
 * the same downloads — Arabic and Latin type are chosen for different reasons
 * anyway, and pairing them was someone else's decision baked into a list.
 */
export const FONT_AR_OPTIONS = [
  { value: 'tajawal', label: 'Tajawal · تجوّل' },
  { value: 'cairo', label: 'Cairo · القاهرة' },
  { value: 'almarai', label: 'Almarai · المراعي' },
  { value: 'markazi', label: 'Markazi · مركزي' },
]

export const FONT_LATIN_OPTIONS = [
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'inter', label: 'Inter' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'cormorant', label: 'Cormorant' },
  { value: 'bebas', label: 'Bebas Neue' },
]

/**
 * The old fixed pairs, kept only to read tenants saved before the split.
 * Nothing writes `style.font` any more.
 */
export const LEGACY_FONT_PAIRS: Record<string, { ar: string; latin: string }> = {
  default: { ar: 'tajawal', latin: 'montserrat' },
  cairo: { ar: 'cairo', latin: 'montserrat' },
  modern: { ar: 'tajawal', latin: 'inter' },
  editorial: { ar: 'almarai', latin: 'playfair' },
  elegant: { ar: 'markazi', latin: 'cormorant' },
  bold: { ar: 'cairo', latin: 'bebas' },
}

export const COMPONENT_OPTIONS = {
  card: ['solid', 'glass', 'outline'],
  navbar: ['blur', 'solid', 'transparent'],
  button: ['rounded', 'sharp', 'pill'],
} as const

export const ANIM_OPTIONS = ['fade-up', 'fade', 'none']
export const CURSOR_OPTIONS = ['default', 'dot-ring']
export const DIRECTION_OPTIONS = ['auto', 'rtl', 'ltr']

export type Palette = { name: string; accent: string; bg: string; bg2: string; text: string; subtext: string }

/**
 * The two palette sets, paired by position: the first dark option and the first
 * light option are the same idea in two keys, and so on down the row.
 *
 * The previous sets read as one palette six times over. Every dark option was
 * near-black and every light one near-white, so the only thing that actually
 * changed was the accent — which is what the swatches showed: six identical
 * chips with a different dot. These vary on the two things the eye reads first,
 * temperature (neutral / cool / blue / green / violet / warm) and value: Ash and
 * Fog are deliberately several steps off the extremes, so the page reads as grey
 * rather than as black or as white.
 *
 * Card colour separates from the page colour in every option — a card that is
 * the same colour as the page behind it can only be found by its border.
 *
 * Body text clears 4.5:1 against its own page colour in all twelve, and muted
 * text clears it too rather than settling for the 3:1 large-text allowance.
 */

/** Dark-mode ready palettes (set the accent/bg/bg2/text/subtext dark colours). */
export const DARK_PALETTES: Palette[] = [
  // Neutral black — the default, and the one that lets the work carry the page.
  { name: 'Ink', accent: '#F97316', bg: '#0A0A0A', bg2: '#161616', text: '#FFFFFF', subtext: '#A3A3A3' },
  // Lifted grey. Not black: softer under long reading, and photographs sit in
  // it instead of floating on it.
  { name: 'Ash', accent: '#7C9CFF', bg: '#16181D', bg2: '#212530', text: '#F2F4F8', subtext: '#A7AFC0' },
  // Deep navy — cold, editorial.
  { name: 'Midnight', accent: '#4DA3FF', bg: '#0B1024', bg2: '#161E3C', text: '#EAF0FF', subtext: '#96A5C9' },
  // Deep green — calm, and kind to warm photography.
  { name: 'Forest', accent: '#34D399', bg: '#08150F', bg2: '#102618', text: '#ECFDF5', subtext: '#92B8A5' },
  // Violet-magenta — the loudest of the six.
  { name: 'Plum', accent: '#C084FC', bg: '#140A1E', bg2: '#221134', text: '#F5EDFF', subtext: '#B29EC9' },
  // Warm brown — reads as paper's opposite rather than as a screen.
  { name: 'Espresso', accent: '#F0A868', bg: '#16100C', bg2: '#251B14', text: '#FBF3EA', subtext: '#C1AA92' },
]

/** Light-mode ready palettes (set the *Light colours). */
export const LIGHT_PALETTES: Palette[] = [
  // White page, grey cards.
  // #EA6C0A was the old default and only reached 3.2:1 on white — orange has
  // to be taken down a long way before it holds up as a link colour there.
  { name: 'Paper', accent: '#B4530A', bg: '#FFFFFF', bg2: '#F4F5F7', text: '#14161C', subtext: '#5A6172' },
  // Mid grey page, white cards — the light theme with actual contrast in it.
  { name: 'Fog', accent: '#4338CA', bg: '#E7E9EE', bg2: '#F8F9FB', text: '#111318', subtext: '#4C5261' },
  // Cool blue-grey.
  { name: 'Mist', accent: '#1D4ED8', bg: '#EEF2F7', bg2: '#FFFFFF', text: '#0E1726', subtext: '#4A5568' },
  // Green tint.
  { name: 'Sage', accent: '#15803D', bg: '#F0F5F1', bg2: '#FFFFFF', text: '#10201A', subtext: '#4A6155' },
  // Pink tint.
  { name: 'Blush', accent: '#BE123C', bg: '#FDF2F4', bg2: '#FFFFFF', text: '#2A0E15', subtext: '#6E4A52' },
  // Warm cream.
  { name: 'Cream', accent: '#B45309', bg: '#FBF6EC', bg2: '#FFFCF6', text: '#221A10', subtext: '#6E6152' },
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
  backgroundLight: emptyBg(),
  sectionBg: [],
  style: {
    hero: 'centered',
    about: 'classic',
    projects: 'grid',
    expertise: 'grid',
    contact: 'classic',
    skills: 'tags',
    tools: 'classic',
    exp: 'classic',
    font: 'default',
    fontAr: 'tajawal',
    fontLatin: 'montserrat',
    direction: 'auto',
    cursor: 'default',
    anim: 'fade-up',
  },
  components: { card: 'solid', navbar: 'blur', button: 'rounded' },
  heroCover: { size: 'cover', posX: 50, posY: 50, overlay: 45, overlayLight: 25, height: 82, gradient: 'none' },
  heroCoverId: null,
  brandLogoId: null,
  brandLogoUrl: null,
  heroCoverUrl: null,
})
