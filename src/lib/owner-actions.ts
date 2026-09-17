'use server'

import type { PayloadRequest } from 'payload'
import { getDashboardContext } from './dashboard'
import { sendActivation } from './activation'
import { recordSlugRedirect } from './record-redirect'
import { cleanSlug, slugProblem } from './slug-rules'
import { seedStarter } from './starter'
import { isStarterField, type StarterField } from './starter-fields'

/**
 * What an action says when it declines. Returned rather than thrown: a
 * production build replaces a thrown error's message with a generic one before
 * it reaches the browser, so a coded throw arrived as "something went wrong"
 * and the dashboard could never say which thing it was.
 */
export type Refusal = { ok: false; code: string }

async function ownerCtx() {
  const ctx = await getDashboardContext()
  if (!ctx || !ctx.user.isOwner) throw new Error('forbidden')
  return ctx
}

export async function createClient(input: {
  name: string
  slug: string
  email: string
  storageLimitMb: number
  /** Which starting texts the portfolio is given. */
  field?: StarterField
}) {
  const ctx = await ownerCtx()
  const tenant = await ctx.payload.create({
    collection: 'tenants',
    data: { name: input.name, slug: input.slug, storageLimitMb: input.storageLimitMb },
  })
  const user = await ctx.payload.create({
    collection: 'users',
    data: {
      email: input.email,
      // Unusable random password — the client sets their own via the emailed link/code.
      password: `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}A9!`,
      name: input.name,
      activated: false,
      tenants: [{ tenant: tenant.id }],
    },
  })
  /* A portfolio that opens with something in it: texts for their line of
     work, in both languages, ready to rewrite. Never fatal — a client with an
     empty page is still a client. */
  try {
    await seedStarter(ctx.payload, tenant.id, isStarterField(input.field) ? input.field : 'general', input.name)
  } catch (e) {
    console.error('[createClient] starter content failed:', e)
  }
  // Email the client a set-password link + 6-digit code (proves email ownership).
  await sendActivation(ctx.payload, { id: user.id, email: input.email })
  return { ok: true, id: tenant.id }
}

/** Re-send the set-password link + code to an existing client. */
export async function resendActivation(email: string) {
  const ctx = await ownerCtx()
  const res = await ctx.payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  const u = res.docs[0]
  if (u) await sendActivation(ctx.payload, { id: u.id, email: u.email })
  return { ok: true }
}

export async function updateTenant(
  id: number,
  data: { storageLimitMb?: number; domain?: string | null; slug?: string },
): Promise<{ ok: true } | Refusal> {
  const ctx = await ownerCtx()
  const { slug, ...rest } = data

  /* A username is the address people were given. Changing it is allowed —
     a client who signed up as "kamal" may want "kamal-semeta" — but the old
     one has to keep working, so the rename is recorded as a redirect and the
     middleware sends every path under it to the new name. */
  if (slug !== undefined) {
    const next = cleanSlug(slug)
    const problem = slugProblem(next)
    if (problem) return { ok: false, code: problem }

    const before = await ctx.payload.findByID({ collection: 'tenants', id, depth: 0 })
    if (before.slug !== next) {
      const taken = await ctx.payload.find({
        collection: 'tenants',
        where: { slug: { equals: next } },
        limit: 1,
        depth: 0,
      })
      if (taken.docs.length) return { ok: false, code: 'taken' }

      await ctx.payload.update({ collection: 'tenants', id, data: { slug: next } })
      await recordSlugRedirect({
        // The action has no request of its own; the helper only ever reaches
        // for `payload` on it.
        req: { payload: ctx.payload } as unknown as PayloadRequest,
        from: `/${before.slug}`,
        to: `/${next}`,
      })
    }
  }

  if (Object.keys(rest).length) await ctx.payload.update({ collection: 'tenants', id, data: rest })
  return { ok: true }
}

/** Suspend or re-enable a client (blocks login + hides their public site). */
export async function setSuspended(tenantId: number, suspended: boolean) {
  const ctx = await ownerCtx()
  await ctx.payload.update({ collection: 'tenants', id: tenantId, data: { suspended } })
  return { ok: true }
}

/** Permanently delete a client: all their content, media, users, then the tenant. */
export async function deleteClient(tenantId: number) {
  const ctx = await ownerCtx()
  const scoped = [
    'projects',
    'logos',
    'achievements',
    'testimonials',
    'articles',
    'visits',
    'site-settings',
    'media',
  ] as const
  for (const collection of scoped) {
    try {
      await ctx.payload.delete({ collection, where: { tenant: { equals: tenantId } } })
    } catch (e) {
      console.error(`[deleteClient] ${collection}`, e)
    }
  }
  // Users linked to this tenant.
  try {
    await ctx.payload.delete({ collection: 'users', where: { 'tenants.tenant': { equals: tenantId } } })
  } catch (e) {
    console.error('[deleteClient] users', e)
  }
  await ctx.payload.delete({ collection: 'tenants', id: tenantId })
  return { ok: true }
}

export async function setClientPassword(userId: number, password: string) {
  const ctx = await ownerCtx()
  await ctx.payload.update({ collection: 'users', id: userId, data: { password } })
  return { ok: true }
}

/**
 * A client's login address, changed from the admin.
 *
 * The address is how they sign in, so the new one is checked before anything
 * is written: shaped like an email, and not already someone else's — Payload
 * would refuse a duplicate anyway, but with an error nobody could act on.
 *
 * A client's, or the owner's own — the owner's portfolio is a row in this list
 * like any other, and its login is theirs to change. Another owner's is not:
 * that is someone else's way in.
 */
export async function setClientEmail(
  userId: number,
  email: string,
): Promise<{ ok: true; changed: boolean; self: boolean } | Refusal> {
  const ctx = await ownerCtx()
  const next = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(next)) return { ok: false, code: 'invalid' }

  const user = await ctx.payload.findByID({ collection: 'users', id: userId, depth: 0 }).catch(() => null)
  if (!user) return { ok: false, code: 'missing' }
  const self = user.id === ctx.user.id
  if (user.isOwner && !self) return { ok: false, code: 'owner' }
  if ((user.email ?? '').toLowerCase() === next) return { ok: true, changed: false, self }

  const taken = await ctx.payload.find({
    collection: 'users',
    where: { email: { equals: next } },
    limit: 1,
    depth: 0,
  })
  if (taken.docs.length) return { ok: false, code: 'taken' }

  await ctx.payload.update({ collection: 'users', id: userId, data: { email: next } })
  return { ok: true, changed: true, self }
}
