import React from 'react'
import LandingThemeToggle from './LandingThemeToggle'
import type { LandingCopy } from '@/lib/landing-copy'
import type { LandingLook } from '@/lib/landing-look'

/**
 * The nav and the footer that every page of this site wears.
 *
 * They used to be written inside the landing page, and the blog had a short
 * hand-made copy of the nav and no footer at all — so following a link to the
 * blog felt like arriving somewhere else. One definition now, used by both.
 *
 * The section links are anchors on the landing page, so away from it they are
 * addressed absolutely: on the blog, "Pricing" has to go home first.
 */
function Logo({ look, copy, home }: { look: LandingLook; copy: LandingCopy; home: string }) {
  return (
    <a href={home} className="lp-logo">
      {look.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={look.logoUrl} alt="ViralPX" className="lp-logo-img" />
      ) : (
        <>
          <span className="lp-logo-mark" aria-hidden="true">
            <i />
          </span>
          <span className="lp-logo-text">
            <span>
              Viral<span>PX</span>
            </span>
            <span className="lp-tagline">{copy.tagline}</span>
          </span>
        </>
      )}
    </a>
  )
}

export function LandingNav({
  look,
  copy,
  locale,
  /** True on the landing page itself, where the section links are anchors. */
  atHome = false,
  /** Where the language button should go — the same page in the other tongue. */
  otherLang,
}: {
  look: LandingLook
  copy: LandingCopy
  locale: 'ar' | 'en'
  atHome?: boolean
  otherLang: string
}) {
  const q = locale === 'en' ? '?lang=en' : ''
  const home = `/${q}`
  const sec = (id: string) => (atHome ? `#${id}` : `/${q}#${id}`)

  return (
    <header className="lp-nav">
      <Logo look={look} copy={copy} home={home} />
      <nav className="lp-nav-links">
        <a href={sec('features')}>{copy.nav.features}</a>
        <a href={sec('showcase')}>{copy.nav.showcase}</a>
        <a href={sec('compare')}>{copy.nav.compare}</a>
        <a href={sec('pricing')}>{copy.nav.pricing}</a>
        <a href={sec('faq')}>{copy.nav.faq}</a>
        {/* The blog is the only part of this site that can rank for anything
            other than the product's own name. */}
        <a href={`/blog?lang=${locale}`}>{locale === 'en' ? 'Blog' : 'المدوّنة'}</a>
      </nav>
      <div className="lp-nav-actions">
        <a className="lp-lang" href={otherLang}>
          {locale === 'en' ? 'ع' : 'EN'}
        </a>
        <LandingThemeToggle />
        <a className="lp-nav-login" href="/login">
          {copy.login}
        </a>
        <a className="lp-btn lp-btn-primary lp-arrow" href={copy.ctaUrl || '/login'}>
          <span className="lp-btn-label">{copy.cta}</span>
        </a>
      </div>
    </header>
  )
}

export function LandingFooter({
  look,
  copy,
  locale,
  atHome = false,
}: {
  look: LandingLook
  copy: LandingCopy
  locale: 'ar' | 'en'
  atHome?: boolean
}) {
  const q = locale === 'en' ? '?lang=en' : ''
  const home = `/${q}`

  return (
    <footer className="lp-footer">
      <div className="lp-footer-top">
        <div className="lp-footer-brand">
          <Logo look={look} copy={copy} home={home} />
          {copy.footerNote && <p>{copy.footerNote}</p>}
        </div>

        <div className="lp-footer-cols">
          {copy.footerGroups
            .filter((g) => g.links.some((l) => l.label && l.url))
            .map((g, i) => (
              <nav className="lp-footer-links" key={g.title + i}>
                <strong>{g.title}</strong>
                {/* The blog is listed by the page, not by the owner: it is the
                    one part of this site that can rank for something other than
                    the product's own name, so it should not be one edit away
                    from having nothing pointing at it. */}
                {i === 0 && (
                  <a href={`/blog?lang=${locale}`}>{locale === 'en' ? 'Blog' : 'المدوّنة'}</a>
                )}
                {g.links
                  .filter((l) => l.label && l.url)
                  .map((l) => (
                    <a
                      key={l.url + l.label}
                      href={l.url.startsWith('#') ? (atHome ? l.url : `${home}${l.url}`) : l.url}
                    >
                      {l.label}
                    </a>
                  ))}
              </nav>
            ))}

          {/* Listed by the page, and only the ones that have been written: a
              refund-policy link that opens nothing is worse than no link. */}
          {copy.legal.some((p) => p.body.trim()) && (
            <nav className="lp-footer-links">
              <strong>{copy.legalHeading}</strong>
              {copy.legal
                .filter((p) => p.body.trim())
                .map((p) => (
                  <a key={p.slug} href={`/legal/${p.slug}?lang=${locale}`}>
                    {p.title}
                  </a>
                ))}
            </nav>
          )}
        </div>
      </div>

      <div className="lp-footer-base">
        © {new Date().getFullYear()} ViralPX — {copy.rights}
      </div>
    </footer>
  )
}
