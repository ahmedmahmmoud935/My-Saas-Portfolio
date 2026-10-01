import type { Access, Where } from 'payload'
import { liveWhere } from './publish'

/*
 * Read access for the collections a public page shows.
 *
 * The pages ask the database through the server and filter for themselves, so
 * `read: () => true` looked harmless. But the same collections answer at
 * /api/<collection> to anyone, and there that filter does not run: a draft
 * project, an article scheduled for next week, a review still waiting for
 * approval — all readable with one URL. A visitor is now given exactly what a
 * page would show them. A signed-in user keeps full read, which the
 * multi-tenant plugin narrows to their own tenant.
 */
const forVisitors =
  (where: () => Where): Access =>
  ({ req }) =>
    req.user ? true : where()

/** Projects: anything not unpublished. */
export const publishedProjects = forVisitors(() => ({ published: { not_equals: false } }))

/** Articles and blog posts: published, or scheduled and their hour has come. */
export const livePieces = forVisitors(liveWhere)

/** Reviews: only the approved ones. */
export const approvedReviews = forVisitors(() => ({ approved: { not_equals: false } }))
