// Shared, client-safe types for project editing (no server imports).

/** A value in both site languages. Either side may be blank — the public page
 *  falls back to whichever is filled. */
export type Bi = { ar: string; en: string }

export const emptyBi = (): Bi => ({ ar: '', en: '' })

/** True when the HTML has no visible text. */
export const biEmpty = (html: string) => !html.replace(/<[^>]*>/g, '').trim()

export type ModuleInput =
  | { type: 'text'; textType: 'h1' | 'h2' | 'p'; value: Bi }
  | { type: 'image'; srcId: number | null }
  | { type: 'grid'; itemIds: number[] }
  | { type: 'carousel'; itemIds: number[] }
  | { type: 'video'; embedUrl: string; posterId: number | null }
  | {
      type: 'beforeafter'
      beforeId: number | null
      afterId: number | null
      labelBefore?: string
      labelAfter?: string
    }
  | { type: 'separator'; spacing: 'compact' | 'normal' | 'large' }

export type ProjectInput = {
  id?: number
  title: Bi
  category?: string
  description?: Bi
  mediaType: 'image' | 'video'
  projectType: 'grid' | 'free' | 'stacked'
  coverId?: number | null
  videoUrl?: string
  videoKind?: 'reel' | 'video'
  aspectRatio?: string
  imageIds?: number[]
  modules?: ModuleInput[]
  published?: boolean
}

/** Editor-side module: like ModuleInput but carries preview URLs for display. */
export type EditModule =
  | { type: 'text'; textType: 'h1' | 'h2' | 'p'; value: Bi }
  | { type: 'image'; srcId: number | null; srcUrl: string | null }
  | { type: 'grid'; items: { id: number; url: string | null }[] }
  | { type: 'carousel'; items: { id: number; url: string | null }[] }
  | { type: 'video'; embedUrl: string; posterId: number | null; posterUrl: string | null }
  | {
      type: 'beforeafter'
      beforeId: number | null
      beforeUrl: string | null
      afterId: number | null
      afterUrl: string | null
      labelBefore: string
      labelAfter: string
    }
  | { type: 'separator'; spacing: 'compact' | 'normal' | 'large' }

/** Strip preview URLs → the shape the save action expects. */
export function editModuleToInput(m: EditModule): ModuleInput {
  switch (m.type) {
    case 'text':
      return { type: 'text', textType: m.textType, value: m.value }
    case 'image':
      return { type: 'image', srcId: m.srcId }
    case 'grid':
      return { type: 'grid', itemIds: m.items.map((i) => i.id) }
    case 'carousel':
      return { type: 'carousel', itemIds: m.items.map((i) => i.id) }
    case 'video':
      return { type: 'video', embedUrl: m.embedUrl, posterId: m.posterId }
    case 'beforeafter':
      return {
        type: 'beforeafter',
        beforeId: m.beforeId,
        afterId: m.afterId,
        labelBefore: m.labelBefore,
        labelAfter: m.labelAfter,
      }
    case 'separator':
      return { type: 'separator', spacing: m.spacing }
  }
}

/** What happened to an uploaded video — surfaced in the dashboard so a file
 *  that couldn't be compressed doesn't go up unnoticed. */
export type VideoReport = {
  compressed: boolean
  fromMb: number
  toMb: number
  /** too-small | no-ffmpeg | ffmpeg-failed | no-gain */
  reason?: string
  /** Vertical resolution of the stored clip (1080, 720…). */
  height?: number
}
