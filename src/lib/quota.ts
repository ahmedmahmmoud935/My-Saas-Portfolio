/**
 * A portfolio's storage allowance.
 *
 * The limit used to be a number the admin set and the dashboard displayed, and
 * nothing else read: a client could go on uploading long after the bar was
 * full. It is a rule now, checked where every file comes in.
 *
 * Client-safe: the dashboard reads the same thresholds to warn before the
 * wall, and the same error code to say what the wall is.
 */

/** What a new portfolio is given. One gigabyte holds forty-odd reels. */
export const DEFAULT_STORAGE_MB = 1024

/** Past this share of the allowance, the dashboard starts saying so. */
export const WARN_AT = 0.8

/** The error an upload fails with when there is no room for it. */
export const QUOTA_FULL = 'quota-full'

export type QuotaState = 'ok' | 'warn' | 'full'

export function quotaState(usedMb: number, limitMb: number): QuotaState {
  if (!limitMb || limitMb <= 0) return 'ok'
  if (usedMb >= limitMb) return 'full'
  if (usedMb >= limitMb * WARN_AT) return 'warn'
  return 'ok'
}

/** What to tell someone whose upload was refused for room. */
export function quotaFullText(t: (ar: string, en: string) => string): string {
  return t(
    'المساحة المتاحة لموقعك خلصت. امسح صور أو فيديوهات مش محتاجها، أو حط الفيديوهات الطويلة كلينك يوتيوب، أو كلّم الإدارة عشان تزوّد المساحة.',
    'Your site has run out of storage. Delete pictures or videos you no longer need, link long videos from YouTube instead, or ask the admin for more room.',
  )
}
