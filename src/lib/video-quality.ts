// Client-safe: the dashboard picker and the server encoder share these.

export type VideoQuality = 'high' | 'balanced' | 'small'

export const VIDEO_QUALITY_DEFAULT: VideoQuality = 'balanced'

export const VIDEO_QUALITY_OPTIONS: {
  id: VideoQuality
  ar: string
  en: string
  hintAr: string
  hintEn: string
}[] = [
  {
    id: 'high',
    ar: 'جودة عالية',
    en: 'High quality',
    hintAr: 'أوضح صورة — ملف أكبر وتحميل أبطأ',
    hintEn: 'Sharpest — bigger file, slower to load',
  },
  {
    id: 'balanced',
    ar: 'متوازنة',
    en: 'Balanced',
    hintAr: 'جودة عالية بحجم معقول (المُفضّل)',
    hintEn: 'Good quality at a sane size (recommended)',
  },
  {
    id: 'small',
    ar: 'أصغر حجم',
    en: 'Smallest',
    hintAr: 'أسرع تحميل — تفاصيل أقل',
    hintEn: 'Fastest to load — softer detail',
  },
]

export const isVideoQuality = (v: unknown): v is VideoQuality =>
  v === 'high' || v === 'balanced' || v === 'small'
