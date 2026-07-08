// Client-safe types for the Content tab (no server imports).
// Each localized field carries both locales so AR + EN edit side by side.

export type Loc = { ar: string; en: string }

export type ExpertiseItem = { title: Loc; description: Loc; iconId: number | null; iconUrl: string | null }
export type ExperienceItem = { company: string; role: Loc; period: string; description: Loc }
export type EducationItem = { title: Loc; org: Loc; period: string; description: Loc }
export type ToolItem = { name: string; iconId: number | null; iconUrl: string | null }

export type ContentForm = {
  hero: { name: Loc; title: Loc; btn1: Loc; btn2: Loc }
  about: { text: Loc; tags: Loc }
  expertise: { title: Loc; items: ExpertiseItem[] }
  experience: { items: ExperienceItem[] }
  education: { items: EducationItem[] }
  skills: { items: Loc }
  tools: { items: ToolItem[] }
  projects: { title: Loc; subtitle: Loc }
  contact: { title: Loc; subtitle: Loc; email: string; phone: string }
}

export const emptyLoc = (): Loc => ({ ar: '', en: '' })

export const CONTENT_SECTIONS: { id: keyof ContentForm; label: string }[] = [
  { id: 'hero', label: 'الرئيسية' },
  { id: 'about', label: 'عن النفس' },
  { id: 'expertise', label: 'الخدمات' },
  { id: 'experience', label: 'الخبرات' },
  { id: 'education', label: 'التعليم' },
  { id: 'skills', label: 'المهارات' },
  { id: 'tools', label: 'الأدوات' },
  { id: 'projects', label: 'المشاريع' },
  { id: 'contact', label: 'التواصل' },
]
