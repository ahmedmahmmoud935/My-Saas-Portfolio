import React from 'react'
import LandingThemeToggle from './LandingThemeToggle'
import LandingMenu from './LandingMenu'
import '@/app/(frontend)/landing-reference.css'
import { resolveLink, type LandingCopy } from '@/lib/landing-copy'
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
function Logo({
  look,
  copy,
  home,
}: {
  look: LandingLook
  copy: LandingCopy
  home: string
}) {
  return (
    <a href={home} className="logo" dir="ltr" aria-label={copy.design.homeLabel}>
      {look.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={look.logoUrl} alt="ViralPX" className="lp-logo-img" />
      ) : (
        <>
          viral<span>px</span>
          <sup>®</sup>
          {copy.tagline && <small className="lp-tagline">{copy.tagline}</small>}
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
    <header className="vpx-header">
      <div className="shell nav">
        <Logo look={look} copy={copy} home={home} />
        <LandingMenu
          label={copy.design.menuLabel}
          openLabel={copy.design.menuOpen}
          closeLabel={copy.design.menuClose}
        >
          <a href={sec('features')}>{copy.nav.features}</a>
          <a href={sec('showcase')}>{copy.nav.showcase}</a>
          <a href={sec('how')}>{copy.nav.how}</a>
          <a href={sec('compare')}>{copy.nav.compare}</a>
          <a href={sec('pricing')}>{copy.nav.pricing}</a>
          <a href={sec('faq')}>{copy.nav.faq}</a>
          {/* The blog is the only part of this site that can rank for anything
            other than the product's own name. */}
          <a href={`/blog${q}`}>{copy.design.blogLabel}</a>
        </LandingMenu>
        <div className="nav-actions">
          <a className="lp-lang" href={otherLang}>
            {copy.design.languageLabel}
          </a>
          <LandingThemeToggle
            lightLabel={copy.design.themeLight}
            darkLabel={copy.design.themeDark}
          />
          <a className="lp-nav-login" href={resolveLink(copy.design.loginUrl)}>
            {copy.login}
          </a>
          <a className="button primary nav-cta" href={resolveLink(copy.ctaUrl)}>
            <span className="lp-btn-label">{copy.cta}</span>
          </a>
        </div>
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
    <footer className="vpx-footer">
      <div className="shell">
        <div className="footer-top">
          <Logo look={look} copy={copy} home={home} />
          <p>{copy.design.footerIntro}</p>
        </div>
        <div className="footer-grid">
          <div className="lp-footer-brand">
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
                  {i === 1 && <a href={`/blog${q}`}>{copy.design.blogLabel}</a>}
                  {g.links
                    .filter((l) => l.label && l.url)
                    .map((l) => (
                      <a
                        key={l.url + l.label}
                        href={
                          l.url.startsWith('#')
                            ? atHome
                              ? l.url
                              : `${home}${l.url}`
                            : resolveLink(l.url, l.url)
                        }
                      >
                        {l.label}
                      </a>
                    ))}
                </nav>
              ))}

            <div>
              <h3>{copy.design.footerContact}</h3>
              {copy.waNumber && (
                <a href={resolveLink(copy.waNumber)}>
                  {copy.design.footerWhatsapp}
                </a>
              )}
              {copy.phone && (
                <a href={`tel:${copy.phone.replace(/[^\d+]/g, "")}`} dir="ltr">
                  {copy.phone}
                </a>
              )}
            </div>
            {/* Listed by the page, and only the ones that have been written: a
              refund-policy link that opens nothing is worse than no link. */}
            {copy.legal.some((p) => p.body.trim()) && (
              <nav className="lp-footer-links">
                <strong>{copy.legalHeading}</strong>
                {copy.legal
                  .filter((p) => p.body.trim())
                  .map((p) => (
                    <a key={p.slug} href={`/legal/${p.slug}${q}`}>
                      {p.title}
                    </a>
                  ))}
              </nav>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} ViralPX — {copy.rights}
          <a href="#">{copy.design.backTop}</a>
        </div>
      </div>
    </footer>
  )
}
