import type { Payload } from 'payload'
import { mediaUrl } from './portfolio'

/** The picture a portfolio supplies for itself, in the two shapes a card uses. */
export type ShowcasePictures = { title: string | null; avatarUrl: string | null; coverUrl: string | null }

/**
 * Each portfolio's own pictures, read once for many.
 *
 * Shared by the landing page and the editor that frames them: the editor has to
 * show the same picture the page will, or framing it by hand is guesswork.
 */
export async function showcasePictures(payload: Payload, tenantIds: number[]): Promise<Map<number, ShowcasePictures>> {
  const out = new Map<number, ShowcasePictures>()
  if (!tenantIds.length) return out
  const settings = await payload.find({
    collection: 'site-settings',
    where: { tenant: { in: tenantIds } },
    limit: tenantIds.length,
    depth: 1,
  })
  for (const st of settings.docs) {
    const owner = st.tenant
    const id = typeof owner === 'object' ? owner?.id : owner
    if (typeof id !== 'number') continue
    const brand = (st.brand ?? {}) as Record<string, unknown>
    const hero = ((st.content as Record<string, unknown>)?.hero ?? {}) as Record<string, unknown>
    out.set(id, {
      title: (hero.title as string) || null,
      // Whichever picture of themselves they have set, in the order a person
      // would expect to be recognised by.
      avatarUrl:
        mediaUrl((brand.avatar as never) ?? null, 'thumb') ||
        mediaUrl((brand.photo as never) ?? null, 'thumb') ||
        mediaUrl((brand.brandLogo as never) ?? null, 'thumb'),
      coverUrl:
        mediaUrl((brand.heroCover as never) ?? null, 'card') ||
        mediaUrl((brand.photo as never) ?? null, 'card'),
    })
  }
  return out
}

export { orderShowcase } from './showcase-order'
