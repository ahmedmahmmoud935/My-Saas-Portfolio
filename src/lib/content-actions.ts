'use server'

import { getDashboardContext, getTenantSettings } from './dashboard'
import type { ContentForm, Loc } from './content-types'

type IdMap = {
  expertise: (number | string | undefined)[]
  experience: (number | string | undefined)[]
  education: (number | string | undefined)[]
  tools: (number | string | undefined)[]
}

/** Build a single-locale `content` payload; inject array row ids on the 2nd pass. */
function buildContent(form: ContentForm, loc: 'ar' | 'en', ids?: IdMap) {
  const g = (l: Loc) => l[loc]
  const withId = (id: number | string | undefined) => (id ? { id } : {})
  return {
    hero: {
      name: g(form.hero.name),
      title: g(form.hero.title),
      btn1: g(form.hero.btn1),
      btn2: g(form.hero.btn2),
    },
    about: { text: g(form.about.text), tags: g(form.about.tags) },
    expertise: {
      title: g(form.expertise.title),
      items: form.expertise.items.map((it, i) => ({
        ...withId(ids?.expertise[i]),
        title: g(it.title),
        description: g(it.description),
        icon: it.iconId ?? null,
        image: it.imageId ?? null,
        bgZoom: it.bgZoom,
        bgOverlay: it.bgOverlay,
        bgPosX: it.bgPosX,
        bgPosY: it.bgPosY,
      })),
    },
    experience: {
      items: form.experience.items.map((it, i) => ({
        ...withId(ids?.experience[i]),
        company: it.company,
        role: g(it.role),
        period: it.period,
        description: g(it.description),
      })),
    },
    education: {
      items: form.education.items.map((it, i) => ({
        ...withId(ids?.education[i]),
        title: g(it.title),
        org: g(it.org),
        period: it.period,
        description: g(it.description),
      })),
    },
    skills: { items: g(form.skills.items) },
    tools: {
      items: form.tools.items.map((it, i) => ({
        ...withId(ids?.tools[i]),
        name: it.name,
        icon: it.iconId ?? null,
      })),
    },
    projects: { title: g(form.projects.title), subtitle: g(form.projects.subtitle) },
    contact: {
      title: g(form.contact.title),
      subtitle: g(form.contact.subtitle),
      email: form.contact.email,
      phone: form.contact.phone,
    },
  }
}

export async function saveContent(form: ContentForm) {
  const ctx = await getDashboardContext()
  if (!ctx) throw new Error('unauthorized')
  const settings = await getTenantSettings(ctx)

  // Pass 1 — Arabic (creates array rows, which get ids).
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    locale: 'ar',
    data: { content: buildContent(form, 'ar') as never },
  })

  // Re-read to capture the generated array-row ids (order preserved).
  const fresh = await ctx.payload.findByID({
    collection: 'site-settings',
    id: settings.id,
    locale: 'ar',
    depth: 0,
  })
  const c = (fresh.content ?? {}) as Record<string, { items?: { id?: number | string }[] }>
  const ids: IdMap = {
    expertise: (c.expertise?.items ?? []).map((x) => x.id),
    experience: (c.experience?.items ?? []).map((x) => x.id),
    education: (c.education?.items ?? []).map((x) => x.id),
    tools: (c.tools?.items ?? []).map((x) => x.id),
  }

  // Pass 2 — English, matched onto the same rows.
  await ctx.payload.update({
    collection: 'site-settings',
    id: settings.id,
    locale: 'en',
    data: { content: buildContent(form, 'en', ids) as never },
  })
  return { ok: true }
}
