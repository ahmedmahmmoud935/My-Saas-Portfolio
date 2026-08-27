/**
 * Categories, shared by the dashboard and the public site.
 *
 * Client-safe on purpose: `dashboard-actions.ts` is a `'use server'` module and
 * may only export async functions, so a plain helper cannot live there.
 */

/**
 * `name` is the KEY — it is what a project stores in its `category` field, so
 * it never changes with language. The two labels are what people see.
 */
export type CategoryRow = { name: string; nameAr?: string; nameEn?: string }

/** The label for a language, falling back to the key when that side is blank. */
export const catLabel = (c: CategoryRow, lang: 'ar' | 'en') =>
  (lang === 'ar' ? c.nameAr : c.nameEn) || c.name

/** Payload rows → the shape both sides use, dropping unnamed and duplicate rows. */
export function toCategoryRows(
  rows: { name?: string | null; nameAr?: string | null; nameEn?: string | null }[],
): CategoryRow[] {
  return rows
    .filter((c) => c.name)
    .map((c) => ({
      name: c.name as string,
      nameAr: c.nameAr ?? undefined,
      nameEn: c.nameEn ?? undefined,
    }))
    .filter((c, i, all) => all.findIndex((x) => x.name === c.name) === i)
}
