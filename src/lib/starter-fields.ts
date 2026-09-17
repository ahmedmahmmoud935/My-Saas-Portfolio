// Client-safe: the new-client form offers these, the server fills from them.

export type StarterField = 'designer' | 'video' | 'photo' | 'general'

export const STARTER_FIELDS: { id: StarterField; ar: string; en: string }[] = [
  { id: 'designer', ar: 'مصمم جرافيك', en: 'Graphic designer' },
  { id: 'video', ar: 'مونتير وصانع محتوى', en: 'Video editor' },
  { id: 'photo', ar: 'مصوّر', en: 'Photographer' },
  { id: 'general', ar: 'فريلانسر (عام)', en: 'Freelancer (general)' },
]

export const isStarterField = (v: unknown): v is StarterField =>
  v === 'designer' || v === 'video' || v === 'photo' || v === 'general'
