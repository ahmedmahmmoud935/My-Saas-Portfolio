// Client-safe types + option lists for the Design tab (no server imports).

export type DesignForm = {
  colors: { accent: string; bg: string; bg2: string; text: string; subtext: string }
  background: { preset: string; type: string; color1: string; color2: string }
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
  heroCover: { size: string; posX: number; posY: number; overlay: number; height: number }
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

export const FONT_OPTIONS = [
  { value: 'default', label: 'Cairo · Montserrat' },
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

export const PALETTE_PRESETS: Palette[] = [
  { name: 'Orange Dark', accent: '#F97316', bg: '#0A0A0A', bg2: '#111111', text: '#FFFFFF', subtext: '#999999' },
  { name: 'Violet', accent: '#8B5CF6', bg: '#0A0A0A', bg2: '#121016', text: '#FFFFFF', subtext: '#9a93a8' },
  { name: 'Ocean', accent: '#38BDF8', bg: '#0A1628', bg2: '#0F1F3D', text: '#FFFFFF', subtext: '#9fb3c8' },
  { name: 'Emerald', accent: '#10B981', bg: '#0A1A0F', bg2: '#0F2A1F', text: '#FFFFFF', subtext: '#9fb3a8' },
  { name: 'Rose', accent: '#F43F5E', bg: '#1A0A14', bg2: '#3A1520', text: '#FFFFFF', subtext: '#c89fae' },
  { name: 'Pearl (light)', accent: '#F97316', bg: '#FAFAF5', bg2: '#FFFFFF', text: '#111111', subtext: '#666666' },
]

export const emptyDesign = (): DesignForm => ({
  colors: { accent: '#F97316', bg: '#0A0A0A', bg2: '#111111', text: '#FFFFFF', subtext: '#999999' },
  background: { preset: 'dark', type: 'solid', color1: '', color2: '' },
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
  heroCover: { size: 'cover', posX: 50, posY: 50, overlay: 45, height: 82 },
  heroCoverId: null,
  heroCoverUrl: null,
})
