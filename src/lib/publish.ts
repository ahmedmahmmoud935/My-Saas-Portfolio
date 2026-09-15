import type { Where } from 'payload'

/**
 * When a piece is on the site.
 *
 * Two ways to be live: it was published, or it was scheduled and that time has
 * come. Writing is done in the evening and read in the morning, and an author
 * who has to be awake to press a button either publishes at the wrong hour or
 * forgets — so the hour is a thing you set, not a thing you attend.
 *
 * The switch is never flipped in the database when the time passes: a moment
 * in the future becomes a moment in the past on its own, and a job that has to
 * run to make that true is a job that can fail to run.
 */

/** Whether this piece is readable now. */
export function isLive(
  published?: boolean | null,
  publishAt?: string | null,
  now: number = Date.now(),
): boolean {
  if (published === true) return true
  return dueAt(publishAt) !== null && Date.parse(publishAt as string) <= now
}

/** Whether it is waiting for its hour. */
export function isScheduled(
  published?: boolean | null,
  publishAt?: string | null,
  now: number = Date.now(),
): boolean {
  if (published === true) return false
  const t = dueAt(publishAt)
  return t !== null && t > now
}

/** The moment it goes live, when there is one. */
function dueAt(publishAt?: string | null): number | null {
  if (!publishAt) return null
  const t = Date.parse(publishAt)
  return Number.isFinite(t) ? t : null
}

/**
 * The same question as a Payload filter, for the queries that ask the database
 * rather than a document it already has.
 */
export function liveWhere(): Where {
  return {
    or: [
      { published: { equals: true } },
      { publishAt: { less_than_equal: new Date().toISOString() } },
    ],
  }
}
