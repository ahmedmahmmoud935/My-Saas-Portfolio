import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPortfolio, mediaUrl, tenantCssVars } from '@/lib/portfolio'
import Navbar from '@/components/portfolio/Navbar'
import MotionFx from '@/components/portfolio/MotionFx'
import Hero from '@/components/portfolio/Hero'
import About from '@/components/portfolio/About'
import ProjectsGrid from '@/components/portfolio/ProjectsGrid'
import Achievements from '@/components/portfolio/Achievements'
import Logos from '@/components/portfolio/Logos'
import Testimonials from '@/components/portfolio/Testimonials'
import Contact from '@/components/portfolio/Contact'
import Footer from '@/components/portfolio/Footer'
import TrackVisit from '@/components/portfolio/TrackVisit'
import MobileBar from '@/components/portfolio/MobileBar'
import {
  Expertise,
  Experience,
  Tools,
  Education,
  Skills,
} from '@/components/portfolio/MoreSections'

type Params = {
  params: Promise<{ username: string }>
  searchParams?: Promise<{ lang?: string }>
}

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
  const description = data.settings?.content?.about?.text || undefined
  const cover = mediaUrl(data.settings?.brand?.heroCover, 'card')
  const full = `${name} — ${title}`
  return {
    title: full,
    description,
    alternates: {
      languages: { ar: `/${username}?lang=ar`, en: `/${username}?lang=en` },
    },
    openGraph: {
      title: full,
      description,
      images: cover ? [cover] : undefined,
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', title: full, description },
  }
}

export default async function PortfolioPage({ params, searchParams }: Params) {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const data = await getPortfolio(username, locale)
  if (!data) notFound()
  // Suspended clients: hide the public site.
  if ((data.tenant as { suspended?: boolean }).suspended) notFound()

  const { tenant, settings, projects, achievements, logos, testimonials } = data
  const content = settings?.content ?? {}
  const brand = settings?.brand ?? {}

  // Navbar links
  const navLinks = [
    ...(settings?.navbarLinks ?? [])
      .filter((l) => l.visible !== false)
      .map((l) => ({ label: l.label || l.linkId || '', href: `#${l.linkId}` })),
    { label: locale === 'en' ? 'Articles' : 'المقالات', href: `/${tenant.slug}/articles` },
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
        variant={settings?.style?.hero || 'split'}
        coverSize={settings?.heroCover?.size || 'cover'}
        gradient={settings?.heroCover?.gradient || 'none'}
        posX={settings?.heroCover?.posX ?? 50}
        posY={settings?.heroCover?.posY ?? 50}
      />
    ),
    about: (
      <About
        title="About Me"
        photoUrl={mediaUrl(brand.photo)}
        text={content.about?.text || undefined}
        tags={splitTags(content.about?.tags)}
        variant={settings?.style?.about || 'classic'}
      />
    ),
    projects: (
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
        cols={{
          image: {
            d: settings?.gridCols?.imageDesktop,
            t: settings?.gridCols?.imageTablet,
            m: settings?.gridCols?.imageMobile,
          },
          video: {
            d: settings?.gridCols?.videoDesktop,
            t: settings?.gridCols?.videoTablet,
            m: settings?.gridCols?.videoMobile,
          },
        }}
        highlights={(settings?.highlights ?? []).map((h) => ({
          title: h.title || '',
          coverUrl: mediaUrl(h.cover, 'thumb'),
          items: (h.items ?? []).map((it) => ({
            type: it.type || 'image',
            // Images: serve the optimised 1024px WebP so stories load light;
            // videos fall back to the original file (no image size exists).
            url: mediaUrl(it.media, 'card'),
          })),
        }))}
        projects={projects.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          coverUrl: mediaUrl(p.cover, 'card'),
          mediaType: (p.mediaType as 'image' | 'video') || 'image',
          videoKind: p.videoKind,
          videoUrl: p.videoUrl,
          frames: (p.images ?? [])
            .map((im) => mediaUrl(im.image, 'card'))
            .filter((u): u is string => !!u),
        }))}
        variant={settings?.style?.projects || 'grid'}
      />
    ),
    expertise: (
      <Expertise
        title={content.expertise?.title || 'Key Expertise'}
        layout={settings?.style?.expertise || 'grid'}
        items={(content.expertise?.items ?? []).map((it) => ({
          title: it.title || '',
          description: it.description,
          iconUrl: mediaUrl(it.icon),
          imageUrl: mediaUrl(it.image, 'card'),
          bgZoom: it.bgZoom ?? 100,
          bgOverlay: it.bgOverlay ?? 45,
          bgPosX: it.bgPosX ?? 50,
          bgPosY: it.bgPosY ?? 50,
        }))}
      />
    ),
    experience: (
      <Experience
        title="Experience"
        variant={settings?.style?.exp || 'classic'}
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
        variant={settings?.style?.tools || 'classic'}
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
        variant={settings?.style?.skills || 'tags'}
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
        submitHref={`/testimonial/${tenant.slug}${locale === 'en' ? '?lang=en' : ''}`}
        submitLabel={locale === 'en' ? '+ Add your review' : '+ أضف رأيك'}
      />
    ),
    contact: (
      <Contact
        title={content.contact?.title || "Let's Work Together"}
        subtitle={content.contact?.subtitle || undefined}
        email={content.contact?.email || undefined}
        phone={content.contact?.phone || undefined}
        tenant={tenant.id}
        variant={settings?.style?.contact || 'classic'}
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

  // Design → runtime: fonts / motion / direction / decorative background.
  const st = (settings?.style ?? {}) as Record<string, string | undefined>
  const dirOverride: 'ltr' | 'rtl' =
    st.direction === 'ltr' ? 'ltr' : st.direction === 'rtl' ? 'rtl' : locale === 'en' ? 'ltr' : 'rtl'
  const bg = settings?.background
  const bgTints: Record<string, string> = {
    ocean: 'radial-gradient(1200px 640px at 82% -12%, rgba(56,189,248,0.16), transparent 60%)',
    sunset: 'radial-gradient(1200px 640px at 82% -12%, rgba(249,115,22,0.16), transparent 60%)',
    forest: 'radial-gradient(1200px 640px at 82% -12%, rgba(16,185,129,0.14), transparent 60%)',
    mono: 'radial-gradient(1200px 640px at 82% -12%, rgba(160,160,160,0.10), transparent 60%)',
    pearl: 'radial-gradient(1200px 640px at 82% -12%, rgba(120,120,120,0.08), transparent 60%)',
  }
  const bgLayer: React.CSSProperties | null =
    bg?.type === 'gradient' && bg.color1
      ? { background: `linear-gradient(160deg, ${bg.color1}, ${bg.color2 || 'transparent'})`, opacity: 0.6 }
      : bg?.preset && bgTints[bg.preset]
        ? { background: bgTints[bg.preset] }
        : null

  return (
    <div
      className="pf-root"
      style={cssVars}
      dir={dirOverride}
      lang={locale}
      data-font={st.font || 'default'}
      data-anim={st.anim || 'fade-up'}
      data-cursor={st.cursor || 'default'}
    >
      {bgLayer && <div className="pf-bg-layer" style={bgLayer} />}
      <MotionFx anim={st.anim || 'fade-up'} cursor={st.cursor || 'default'} />
      <TrackVisit tenant={tenant.id} page="home" />
      <Navbar
        logo={logoText}
        links={navLinks}
        langHref={`/${tenant.slug}?lang=${locale === 'en' ? 'ar' : 'en'}`}
        langLabel={locale === 'en' ? 'ع' : 'EN'}
      />
      {ordered.map((id) => (
        <React.Fragment key={id}>{sectionEls[id]}</React.Fragment>
      ))}
      <Footer logo={logoText} name={content.hero?.name || tenant.name} />

      {settings?.social?.whatsapp && (
        <a
          className="wa-float"
          href={`https://wa.me/${settings.social.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          💬
        </a>
      )}

      {settings?.mobileBar?.enabled !== false && (
        <MobileBar
          buttons={(settings?.mobileBar?.buttons ?? []).map((b) => ({
            pos: b.pos || 'left',
            type: b.type || 'section',
            target: b.target || '',
            icon: b.icon || '',
            label: b.label || '',
          }))}
          whatsapp={settings?.social?.whatsapp || undefined}
          username={tenant.slug}
        />
      )}
    </div>
  )
}
