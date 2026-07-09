import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPortfolio, mediaUrl, tenantCssVars } from '@/lib/portfolio'
import Navbar from '@/components/portfolio/Navbar'
import Hero from '@/components/portfolio/Hero'
import About from '@/components/portfolio/About'
import ProjectsGrid from '@/components/portfolio/ProjectsGrid'
import Achievements from '@/components/portfolio/Achievements'
import Logos from '@/components/portfolio/Logos'
import Testimonials from '@/components/portfolio/Testimonials'
import Contact from '@/components/portfolio/Contact'
import Footer from '@/components/portfolio/Footer'
import TrackVisit from '@/components/portfolio/TrackVisit'
import StoryHighlights from '@/components/portfolio/StoryHighlights'
import {
  Expertise,
  Experience,
  Tools,
  Education,
  Skills,
} from '@/components/portfolio/MoreSections'

type Params = { params: Promise<{ username: string }> }

const splitTags = (s?: string | null): string[] =>
  (s || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params
  const data = await getPortfolio(username)
  if (!data) return { title: 'Not found' }
  const name = data.settings?.content?.hero?.name || data.tenant.name
  const title = data.settings?.content?.hero?.title || 'Portfolio'
  return { title: `${name} — ${title}` }
}

export default async function PortfolioPage({ params }: Params) {
  const { username } = await params
  const data = await getPortfolio(username)
  if (!data) notFound()

  const { tenant, settings, projects, achievements, logos, testimonials } = data
  const content = settings?.content ?? {}
  const brand = settings?.brand ?? {}

  // Navbar links
  const navLinks = [
    ...(settings?.navbarLinks ?? [])
      .filter((l) => l.visible !== false)
      .map((l) => ({ label: l.label || l.linkId || '', href: `#${l.linkId}` })),
    { label: 'المقالات', href: `/${tenant.slug}/articles` },
  ]

  const logoText = tenant.name?.[0]?.toUpperCase() || 'V'

  // Section components keyed by id
  const sectionEls: Record<string, React.ReactNode> = {
    hero: (
      <Hero
        eyebrow={content.hero?.title || undefined}
        name={content.hero?.name || tenant.name}
        btn1={content.hero?.btn1 || undefined}
        btn2={content.hero?.btn2 || undefined}
        coverUrl={mediaUrl(brand.heroCover)}
        overlay={settings?.heroCover?.overlay ?? 45}
        heightVh={settings?.heroCover?.height ?? 82}
      />
    ),
    about: (
      <About
        title="About Me"
        photoUrl={mediaUrl(brand.photo)}
        text={content.about?.text || undefined}
        tags={splitTags(content.about?.tags)}
      />
    ),
    projects: (
      <>
        <StoryHighlights
          stories={(settings?.highlights ?? []).map((h) => ({
            title: h.title || '',
            coverUrl: mediaUrl(h.cover, 'thumb'),
            items: (h.items ?? []).map((it) => ({
              type: it.type || 'image',
              url: mediaUrl(it.media),
            })),
          }))}
        />
        <ProjectsGrid
          title={content.projects?.title || 'Selected Work'}
          subtitle={content.projects?.subtitle || undefined}
          imageCategories={(settings?.categories?.image ?? []).map((c) => c.name || '').filter(Boolean)}
          videoCategories={(settings?.categories?.video ?? []).map((c) => c.name || '').filter(Boolean)}
          username={tenant.slug}
          tabLabels={{
            designs: settings?.projTabs?.designs?.label || undefined,
            reels: settings?.projTabs?.reels?.label || undefined,
            videos: settings?.projTabs?.videos?.label || undefined,
          }}
          projects={projects.map((p) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            coverUrl: mediaUrl(p.cover, 'card'),
            mediaType: (p.mediaType as 'image' | 'video') || 'image',
            videoKind: p.videoKind,
            videoUrl: p.videoUrl,
          }))}
        />
      </>
    ),
    expertise: (
      <Expertise
        title={content.expertise?.title || 'Key Expertise'}
        items={(content.expertise?.items ?? []).map((it) => ({
          title: it.title || '',
          description: it.description,
          iconUrl: mediaUrl(it.icon),
        }))}
      />
    ),
    experience: (
      <Experience
        title="Experience"
        items={(content.experience?.items ?? []).map((it) => ({
          company: it.company,
          role: it.role,
          period: it.period,
          description: it.description,
        }))}
      />
    ),
    tools: (
      <Tools
        title="Tools & Software"
        items={(content.tools?.items ?? []).map((it) => ({
          name: it.name,
          iconUrl: mediaUrl(it.icon),
        }))}
      />
    ),
    education: (
      <Education
        title="Education"
        items={(content.education?.items ?? []).map((it) => ({
          title: it.title,
          org: it.org,
          period: it.period,
          description: it.description,
        }))}
      />
    ),
    skills: (
      <Skills
        title="Soft Skills"
        items={(content.skills?.items || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)}
      />
    ),
    achievements: (
      <Achievements
        items={achievements.map((a) => ({ id: a.id, title: a.title, value: a.value }))}
      />
    ),
    logos: (
      <Logos
        title="Our Clients"
        items={logos.map((l) => ({
          id: l.id,
          name: l.name,
          logoUrl: mediaUrl(l.logo),
          websiteUrl: l.websiteUrl,
        }))}
      />
    ),
    testimonials: (
      <Testimonials
        title="Testimonials"
        items={testimonials.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          company: t.company,
          content: t.content,
          avatarUrl: mediaUrl(t.avatar),
          rating: t.rating,
        }))}
      />
    ),
    contact: (
      <Contact
        title={content.contact?.title || "Let's Work Together"}
        subtitle={content.contact?.subtitle || undefined}
        email={content.contact?.email || undefined}
        phone={content.contact?.phone || undefined}
      />
    ),
  }

  // Order + visibility from settings.sections; fall back to a sensible default.
  const defaultOrder = [
    'hero',
    'about',
    'projects',
    'achievements',
    'expertise',
    'testimonials',
    'logos',
    'experience',
    'tools',
    'education',
    'skills',
    'contact',
  ]
  const ordered =
    settings?.sections && settings.sections.length > 0
      ? [...settings.sections]
          .filter((s) => s.visible !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((s) => String(s.sectionId))
          .filter((id) => id in sectionEls)
      : defaultOrder

  const cssVars = tenantCssVars(settings) as React.CSSProperties

  return (
    <div style={cssVars}>
      <TrackVisit tenant={tenant.id} page="home" />
      <Navbar logo={logoText} links={navLinks} />
      {ordered.map((id) => (
        <React.Fragment key={id}>{sectionEls[id]}</React.Fragment>
      ))}
      <Footer logo={logoText} name={content.hero?.name || tenant.name} />
    </div>
  )
}
