import type { Payload } from 'payload'
import type { ContentForm, Loc } from './content-types'

/*
 * Writing a portfolio's texts, both languages.
 *
 * Kept out of the 'use server' file on purpose: every export there is an
 * endpoint a browser can call, and this takes a Payload instance and a
 * settings id from whoever calls it. The dashboard's action and the starter a
 * new client is given both come through here, so they write the same shape.
 */

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
      desc: g(form.hero.desc),
      btn1: g(form.hero.btn1),
      btn2: g(form.hero.btn2),
    },
    about: { title: g(form.about.title), text: g(form.about.text), tags: g(form.about.tags) },
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
        bgOverlayLight: it.bgOverlayLight,
        bgPosX: it.bgPosX,
        bgPosY: it.bgPosY,
      })),
    },
    experience: {
      title: g(form.experience.title),
      items: form.experience.items.map((it, i) => ({
        ...withId(ids?.experience[i]),
        company: it.company,
        role: g(it.role),
        period: it.period,
        description: g(it.description),
      })),
    },
    education: {
      title: g(form.education.title),
      items: form.education.items.map((it, i) => ({
        ...withId(ids?.education[i]),
        title: g(it.title),
        org: g(it.org),
        period: it.period,
        description: g(it.description),
      })),
    },
    skills: { title: g(form.skills.title), items: g(form.skills.items) },
    tools: {
      title: g(form.tools.title),
      items: form.tools.items.map((it, i) => ({
        ...withId(ids?.tools[i]),
        name: it.name,
        icon: it.iconId ?? null,
      })),
    },
    projects: { title: g(form.projects.title), subtitle: g(form.projects.subtitle) },
    clients: { title: g(form.clients.title) },
    testimonials: { title: g(form.testimonials.title) },
    contact: {
      title: g(form.contact.title),
      subtitle: g(form.contact.subtitle),
      email: form.contact.email,
      phone: form.contact.phone,
    },
  }
}

/** Both languages onto one settings document: Arabic creates the rows, English fills them. */
export async function writeContent(payload: Payload, settingsId: number, form: ContentForm) {
  // Pass 1 — Arabic (creates array rows, which get ids).
  await payload.update({
    collection: 'site-settings',
    id: settingsId,
    locale: 'ar',
    data: { content: buildContent(form, 'ar') as never },
  })

  // Re-read to capture the generated array-row ids (order preserved).
  const fresh = await payload.findByID({
    collection: 'site-settings',
    id: settingsId,
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
  await payload.update({
    collection: 'site-settings',
    id: settingsId,
    locale: 'en',
    data: { content: buildContent(form, 'en', ids) as never },
  })
}
