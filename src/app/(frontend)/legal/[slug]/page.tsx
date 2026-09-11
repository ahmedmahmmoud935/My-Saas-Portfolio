import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { alternatesFor } from '@/lib/seo'
import { getLandingChrome, landingTokensCss } from '@/lib/landing-look'
import { LandingNav, LandingFooter } from '@/components/portfolio/LandingChrome'
import Analytics from '@/components/portfolio/Analytics'
import '../../landing.css'

export const dynamic = 'force-dynamic'

type Params = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ lang?: string }>
}

/** The page, only once something has been written in it. */
async function load(slug: string, locale: 'ar' | 'en') {
  const chrome = await getLandingChrome(locale)
  const page = chrome.copy.legal.find((p) => p.slug === slug && p.body.trim())
  return { chrome, page }
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { slug } = await params
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const { page } = await load(slug, locale)
  if (!page) return { title: 'Not found' }
  return {
    title: `${page.title} — ViralPX`,
    description: page.body.trim().replace(/^#+\s*/gm, '').replace(/\s+/g, ' ').slice(0, 160),
    alternates: await alternatesFor(`/legal/${slug}`, { locale }),
  }
}

/**
 * Plain text from the dashboard, given just enough structure to read as a
 * policy: a blank line starts a paragraph, a line starting with "## " is a
 * heading, and lines starting with "- " are a list.
 */
function Prose({ text }: { text: string }) {
  const blocks = text
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((b) => b.length)

  return (
    <>
      {blocks.map((lines, i) => {
        const out: React.ReactNode[] = []
        let rest = lines
        if (rest[0].startsWith('## ')) {
          out.push(<h2 key="h">{rest[0].slice(3)}</h2>)
          rest = rest.slice(1)
        }
        if (rest.length && rest.every((l) => l.startsWith('- '))) {
          out.push(
            <ul key="l">
              {rest.map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>,
          )
        } else if (rest.length) {
          out.push(
            <p key="p">
              {rest.map((l, j) => (
                <React.Fragment key={j}>
                  {j > 0 && <br />}
                  {l}
                </React.Fragment>
              ))}
            </p>,
          )
        }
        return <React.Fragment key={i}>{out}</React.Fragment>
      })}
    </>
  )
}

export default async function LegalPage({ params, searchParams }: Params) {
  const { slug } = await params
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const { chrome, page } = await load(slug, locale)
  if (!page) notFound()
  const { look, copy: c, analyticsId } = chrome

  return (
    <div
      className="lp blog"
      data-card={look.cardStyle}
      data-font-ar={look.fontAr}
      data-font-latin={look.fontLatin}
      dir={locale === 'en' ? 'ltr' : 'rtl'}
      lang={locale}
    >
      <Analytics id={analyticsId} />
      <LandingNav
        look={look}
        copy={c}
        locale={locale}
        otherLang={`/legal/${slug}?lang=${locale === 'en' ? 'ar' : 'en'}`}
      />

      <article className="lp-sec blog-post">
        <h1 className="lp-h2" style={{ textAlign: 'start', marginBottom: 26 }}>
          {page.title}
        </h1>
        <div className="blog-body">
          <Prose text={page.body} />
        </div>
      </article>

      <LandingFooter look={look} copy={c} locale={locale} />

      <style>{landingTokensCss(look)}</style>
    </div>
  )
}
