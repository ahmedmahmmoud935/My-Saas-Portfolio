import React from 'react'
import { Icon } from './icons'
import StudioHeader, { Monogram } from './StudioHeader'
import StudioWork from './StudioWork'
import StudioContactForm from './StudioContactForm'
import StudioReviewText from './StudioReviewText'
import StudioChart from './StudioChart'
import StudioServices from './StudioServices'
import SectionBg from '@/components/portfolio/SectionBg'
import type { Heading, StudioData, StudioSection } from '@/lib/studio-data'
import '@/app/(frontend)/studio.css'

/**
 * The studio template: the owner's reference design, section for section,
 * filled from the client's own content. Markup and class names follow the
 * reference (with an "st-" prefix), so its stylesheet applies unchanged.
 */

function HeadingLines({ h }: { h: Heading }) {
  return (
    <>
      {h.lines.map((l, i) => {
        const last = i === h.lines.length - 1
        return (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {last && h.accentLast ? <em>{l}</em> : l}
          </React.Fragment>
        )
      })}
    </>
  )
}

/** The hero title: lines, with the last word of the last line in the accent. */
function HeroTitle({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => {
        const last = i === lines.length - 1
        const parts = line.split(/\s+/)
        const accent = last && (parts.length > 1 || lines.length > 1) ? parts.pop() : null
        return (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {parts.join(' ')}
            {accent && (
              <>
                {parts.length ? ' ' : ''}
                <em>{accent}</em>
              </>
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

const STAGES = ['st-viral-stage', 'st-learning-stage', 'st-dashboard-stage']

export default function StudioPortfolio({ d }: { d: StudioData }) {
  const isEn = d.lang === 'en'
  const ui = d.ui
  /* Which sections are on the page: a link, a button or a card arrow only
     points at a section that is there. */
  const present = new Set<string>(
    [
      d.order.includes('hero') && 'hero',
      d.about && 'about',
      d.work && 'projects',
      d.digital && 'products',
      d.services && 'expertise',
      d.reviews && 'testimonials',
      d.team && 'team',
      d.clients && 'logos',
      d.clients && d.clients.stats.length > 0 && 'achievements',
      d.experience && 'experience',
      d.tools && 'tools',
      d.education && 'education',
      d.skills && 'skills',
      d.contact && 'contact',
    ].filter((x): x is string => !!x),
  )
  const hasContact = present.has('contact')
  // A section with nothing to show is left out, background and all.
  const SHOWN: Record<StudioSection, unknown> = {
    hero: true, about: d.about, work: d.work, digital: d.digital, services: d.services, reviews: d.reviews,
    team: d.team, clients: d.clients, experience: d.experience, tools: d.tools, education: d.education,
    skills: d.skills, contact: d.contact,
  }
  const shown = (id: StudioSection) => !!SHOWN[id]
  const defaultLinks = [
    d.work && { id: 'projects', label: ui.nav.work },
    d.about && { id: 'about', label: ui.nav.about },
    d.services && { id: 'expertise', label: ui.nav.services },
    d.experience && { id: 'experience', label: ui.nav.experience },
    d.contact && { id: 'contact', label: ui.nav.contact },
  ].filter((l): l is { id: string; label: string } => !!l)
  // The bar editor's own links and labels, when the client has set them.
  const links = d.nav ? d.nav.filter((l) => present.has(l.id)) : defaultLinks

  const [feature, ...pair] = d.digital?.items ?? []

  /* Each section, so they can be laid out in the client's own order. */
  const blocks: Record<StudioSection, React.ReactNode> = {
    hero: (
      <>
        <section className={`st-hero${d.hero.cover ? ' st-has-cover' : ''}`} id="hero">
          {d.hero.cover && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="st-hero-cover"
                src={d.hero.cover.url}
                alt=""
                style={{ objectFit: d.hero.cover.fit as React.CSSProperties['objectFit'], objectPosition: `${d.hero.cover.posX}% ${d.hero.cover.posY}%` }}
              />
              <span
                className="st-hero-veil"
                style={{ ['--veil-d' as string]: d.hero.cover.dark / 100, ['--veil-l' as string]: d.hero.cover.light / 100 } as React.CSSProperties}
              />
            </>
          )}
          <div className="st-hero-content st-shell">
            {d.hero.kicker && (
              <div className="st-creator-label">
                <span className="st-creator-dot" />
                {d.hero.kicker}
              </div>
            )}
            <h1>
              <HeroTitle lines={d.hero.title} />
              <span className="st-hero-spark" aria-hidden="true">
                ✳︎
              </span>
            </h1>
            {d.hero.desc && <p className="st-hero-description">{d.hero.desc}</p>}
            <div className="st-hero-buttons">
              {d.work && (
                <a href="#projects" className="st-button st-primary">
                  {d.hero.btn1}
                  <Icon name="arrow-down" size={18} />
                </a>
              )}
              {d.hero.btn2 && present.has(d.hero.btn2Href.slice(1)) && (
                <a href={d.hero.btn2Href} className="st-button st-outline">
                  {d.hero.btn2}
                  <Icon name={d.hero.btn2Href === '#products' ? 'code-xml' : 'arrow-up-right'} size={19} />
                </a>
              )}
            </div>
            {d.hero.tiles.length > 0 && (
              <div className="st-hero-gallery" aria-label={ui.gallery}>
                {d.hero.tiles.map((t, i) =>
                  t.kind === 'digital' ? (
                    <a key={i} href={t.href} className="st-hero-tile st-digital-tile">
                      <div className="st-mini-top" dir="ltr">
                        <strong>{t.brand}</strong>
                        <span>↗</span>
                      </div>
                      <div className="st-mini-message">{t.message}</div>
                      {t.imgs.length > 0 && (
                        <div className="st-mini-gallery">
                          {t.imgs.map((src, j) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={j} src={src} alt="" />
                          ))}
                        </div>
                      )}
                      <span>
                        {t.caption}
                        <Icon name="arrow-up-right" />
                      </span>
                    </a>
                  ) : (
                    <a key={i} href={t.href} className={`st-hero-tile st-${t.cls}-tile`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.img} alt={t.caption} fetchPriority="high" />
                      <span>
                        {t.caption}
                        <Icon name="arrow-up-right" />
                      </span>
                    </a>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        {d.strip.length > 0 && (
          <div className="st-creative-strip">
            {d.strip.map((w, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="sparkles" />}
                <span>{w}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </>
    ),
    about: (
      <>
        {d.about && (
          <section className="st-about-section st-shell st-section" id="about">
            {d.about.photo && (
              <div className="st-about-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.about.photo}
                  alt={d.name}
                  width={460}
                  height={550}
                  loading="lazy"
                  style={{ objectFit: d.about.frame.fit as React.CSSProperties['objectFit'], objectPosition: `${d.about.frame.posX}% ${d.about.frame.posY}%` }}
                />
                {d.about.stat && (
                  <div className="st-photo-note">
                    <span dir="ltr">
                      {d.about.stat.number}
                      {d.about.stat.suffix && <span>{d.about.stat.suffix}</span>}
                    </span>
                    {d.about.stat.label && <p>{d.about.stat.label}</p>}
                    <Icon name="sparkles" />
                  </div>
                )}
              </div>
            )}
            <div className="st-about-copy">
              <h2>
                <HeadingLines h={d.about.heading} />
              </h2>
              {d.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {d.about.chips.length > 0 && (
                <div className="st-about-chips">
                  {d.about.chips.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </>
    ),
    work: (
      <>
        {d.work && <StudioWork work={d.work} ui={ui} ltr={d.dir === 'ltr'} />}
      </>
    ),
    digital: (
      <>
        {d.digital && (
          <section className="st-digital-section st-section" id="products">
            <div className="st-shell">
              <div className="st-digital-heading">
                <div className="st-digital-symbol" aria-hidden="true">
                  <Icon name="code-xml" />
                </div>
                <div className="st-section-title">
                  <h2>{d.digital.title}</h2>
                  {d.digital.subtitle && <p className="st-section-subtitle">{d.digital.subtitle}</p>}
                </div>
              </div>

              {feature && (
                <article className="st-digital-feature">
                  <ProductStage p={feature} i={0} ui={ui} isEn={isEn} />
                  <ProductCopy p={feature} ui={ui} feature />
                </article>
              )}

              {pair.length > 0 && (
                <div className="st-digital-pair">
                  {pair.map((p, i) => (
                    <article className="st-digital-project" key={p.id}>
                      <ProductStage p={p} i={i + 1} ui={ui} isEn={isEn} />
                      <ProductCopy p={p} ui={ui} />
                    </article>
                  ))}
                </div>
              )}

              {(d.digital.endText || d.digital.endBtn) && (
                <div className="st-digital-end">
                  {d.digital.endText && <p>{d.digital.endText}</p>}
                  {d.digital.endBtn && hasContact && (
                    <a href="#contact" className="st-button st-outline">
                      {d.digital.endBtn}
                      <Icon name="arrow-up-right" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </>
    ),
    services: (
      <>
        {d.services && (
          <section className="st-services-section st-shell st-section" id="expertise">
            <div className="st-services-heading">
              <div>
                <h2>
                  <HeadingLines h={d.services.heading} />
                </h2>
              </div>
              {d.services.subtitle && <p>{d.services.subtitle}</p>}
            </div>
            <StudioServices
              services={d.services}
              ui={ui}
              ltr={d.dir === 'ltr'}
              whatsapp={d.contact?.whatsapp?.href ?? null}
              phone={d.contact?.phone?.href ?? null}
              hasContact={hasContact}
            />
          </section>
        )}
      </>
    ),
    reviews: (
      <>
        {d.reviews && (
          <section className="st-reviews-section st-section" id="testimonials">
            <div className="st-shell">
              <div className="st-section-title st-reviews-heading">
                <h2>{d.reviews.title}</h2>
                {d.reviews.subtitle && <p className="st-section-subtitle">{d.reviews.subtitle}</p>}
              </div>
              <div className="st-review-grid">
                {d.reviews.items.map((r) => (
                  <article className="st-review-card" key={r.id}>
                    <div className="st-review-person">
                      {r.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.avatar} alt="" width={43} height={43} loading="lazy" />
                      ) : (
                        <span className="st-review-initials">{r.initials}</span>
                      )}
                      <div dir="auto">
                        <strong>{r.name}</strong>
                        {r.role && <span>{r.role}</span>}
                      </div>
                      <Icon name="quote" className="st-review-quote" />
                    </div>
                    <div className="st-review-stars">
                      {Array.from({ length: r.rating }, (_, i) => (
                        <Icon key={i} name="star" size={18} fill="currentColor" />
                      ))}
                    </div>
                    <StudioReviewText text={r.text} more={ui.readMore} less={ui.readLess} />
                  </article>
                ))}
              </div>
              <div className="st-reviews-foot">
                <a className="st-button st-outline st-small" href={d.reviews.addHref} target="_blank" rel="noopener noreferrer">
                  {ui.addReview}
                  <Icon name="arrow-up-right" />
                </a>
              </div>
            </div>
          </section>
        )}
      </>
    ),
    clients: (
      <>
        {d.clients && (
          <section className="st-clients-section st-shell st-section" id="logos">
            <div className="st-section-title">
              <h2>{d.clients.title}</h2>
            </div>
            {d.clients.logos.length > 0 && (
              <div className="st-client-logos">
                {d.clients.logos.map((l) =>
                  l.href ? (
                    <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.img} alt={l.name} loading="lazy" width={170} height={90} />
                    </a>
                  ) : (
                    <a key={l.id} aria-label={l.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.img} alt={l.name} loading="lazy" width={170} height={90} />
                    </a>
                  ),
                )}
              </div>
            )}
            {d.clients.stats.length > 0 && (
              <div className="st-stats-grid" id="achievements">
                {d.clients.stats.map((s, i) => (
                  <div className="st-stat" key={i}>
                    <strong dir="ltr">{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </>
    ),
    experience: (
      <>
        {d.experience && (
          <section className="st-experience-section st-section" id="experience">
            <div className="st-shell st-experience-grid">
              <div className="st-section-title">
                <h2>{d.experience.title}</h2>
                {d.experience.subtitle && <p className="st-section-subtitle">{d.experience.subtitle}</p>}
              </div>
              <div className="st-timeline">
                {d.experience.jobs.map((j, i) => (
                  <article className="st-job" key={i}>
                    <span className="st-timeline-dot" />
                    {j.date && (
                      <span className="st-job-date" dir="ltr">
                        {j.date}
                      </span>
                    )}
                    <h3 dir="auto">{j.company}</h3>
                    {j.role && <p>{j.role}</p>}
                    {j.place && <span className="st-job-location">{j.place}</span>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </>
    ),
    tools: (
      <>
        {d.tools && (
          <section className="st-tools-section st-shell st-section" id="tools">
            <div className="st-section-title">
              <h2>{d.tools.title}</h2>
            </div>
            <div className="st-tools-grid" dir="ltr">
              {d.tools.items.map((t, i) => (
                <div className="st-tool" key={i}>
                  {t.iconUrl ? (
                    <span className="st-tool-icon st-tool-img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.iconUrl} alt="" width={36} height={36} />
                    </span>
                  ) : (
                    <span className="st-tool-icon" style={{ background: t.bg, color: t.fg }}>
                      {t.letters}
                    </span>
                  )}
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    ),
    education: (
      <>
        {d.education && (
          <section className="st-education-section st-shell" id="education">
            <div>
              <h2>{d.education.title}</h2>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              {d.education.items.map((e, i) => (
                <div className="st-education-card" key={i}>
                  <span className="st-education-icon">
                    <Icon name="graduation-cap" />
                  </span>
                  <div>
                    <h3>{e.title}</h3>
                    {e.org && <p>{e.org}</p>}
                    {e.text && <span>{e.text}</span>}
                  </div>
                  {e.period && (
                    <span className="st-education-year" dir="ltr">
                      {e.period}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    ),
    team: (
      <>
        {d.team && (
          <section className="st-reviews-section st-section st-team-section" id="team">
            <div className="st-shell">
              <div className="st-section-title st-reviews-heading">
                <h2>{d.team.title}</h2>
              </div>
              <div className="st-review-grid">
                {d.team.members.map((m) => (
                  <article className="st-review-card st-team-card" key={m.id}>
                    <div className="st-review-person">
                      {m.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photo} alt="" width={43} height={43} loading="lazy" />
                      ) : (
                        <span className="st-review-initials">{m.initials}</span>
                      )}
                      <div dir="auto">
                        <strong>{m.name}</strong>
                        {m.role && <span>{m.role}</span>}
                      </div>
                    </div>
                    {m.bio && <p dir="auto">{m.bio}</p>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </>
    ),
    skills: (
      <>
        {d.skills && (
          <section className="st-tools-section st-shell st-section" id="skills">
            <div className="st-section-title">
              <h2>{d.skills.title}</h2>
            </div>
            <div className="st-about-chips st-skills-chips">
              {d.skills.items.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </section>
        )}
      </>
    ),
    contact: (
      <>
        {d.contact && (
          <section className="st-contact-section st-section" id="contact">
            <div className="st-shell st-contact-grid">
              <div className="st-contact-copy">
                <h2>
                  {d.contact.title}
                  <span>↗</span>
                </h2>
                {d.contact.subtitle && <h3>{d.contact.subtitle}</h3>}
                {d.contact.body && <p>{d.contact.body}</p>}
                {(d.contact.email || d.contact.phone || d.contact.whatsapp) && (
                  <div className="st-contact-details">
                    {d.contact.email && (
                      <a href={`mailto:${d.contact.email}`}>
                        <Icon name="mail" />
                        <div>
                          <small>{ui.email}</small>
                          <span dir="ltr">{d.contact.email}</span>
                        </div>
                        <Icon name="arrow-up-right" />
                      </a>
                    )}
                    {d.contact.phone && (
                      <a href={d.contact.phone.href}>
                        <Icon name="phone" />
                        <div>
                          <small>{ui.phone}</small>
                          <span dir="ltr">{d.contact.phone.display}</span>
                        </div>
                        <Icon name="arrow-up-right" />
                      </a>
                    )}
                    {d.contact.whatsapp && (
                      <a href={d.contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
                        <Icon name="phone" />
                        <div>
                          <small>WhatsApp</small>
                          <span dir="ltr">{d.contact.whatsapp.display}</span>
                        </div>
                        <Icon name="arrow-up-right" />
                      </a>
                    )}
                  </div>
                )}
                {d.contact.socials.length > 0 && (
                  <div className="st-socials" dir="ltr">
                    {d.contact.socials.map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                        {s.label}
                        <Icon name="arrow-up-right" size={15} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <StudioContactForm ui={ui} title={d.contact.formTitle} services={d.contact.services} tenant={d.contact.tenantId} />
            </div>
          </section>
        )}
      </>
    ),
  }

  return (
    <div id="top" className={`st-root st-portfolio st-lang-${d.lang}`} style={d.vars as React.CSSProperties} dir={d.dir} lang={d.lang} {...d.attrs}>
      <a className="st-skip-link" href={d.work ? '#projects' : '#main'}>
        {ui.seeWork}
      </a>
      <StudioHeader ui={ui} name={d.name} monogram={d.monogram} links={links} digital={!d.nav && !!d.digital} contact={hasContact} langHref={d.langHref} isEn={isEn} ltr={d.dir === 'ltr'} />

      <main id="main">
        {d.order.filter(shown).map((id) =>
          d.sectionBg[id] ? (
            <SectionBg key={id} config={d.sectionBg[id]}>
              {blocks[id]}
            </SectionBg>
          ) : (
            <React.Fragment key={id}>{blocks[id]}</React.Fragment>
          ),
        )}
      </main>

      <footer className="st-site-footer">
        <div className="st-shell">
          <div className="st-footer-main">
            <Monogram monogram={d.monogram} as="a" href="#top" />
            {d.footer && <p>{d.footer}</p>}
            <a href="#top">
              {ui.top}
              <Icon name="arrow-up-right" size={16} />
            </a>
          </div>
          <div className="st-footer-bottom">
            <span>
              © {new Date().getFullYear()} {d.name}
            </span>
          </div>
        </div>
      </footer>

      {d.call && (
        <a className="st-floating-call" href={d.call} aria-label={`${ui.call} ${d.name}`}>
          <Icon name="phone" size={20} />
        </a>
      )}
    </div>
  )
}

type Product = NonNullable<StudioData['digital']>['items'][number]

/** A product's picture, drawn the way the reference draws its three. */
function ProductStage({ p, i, ui, isEn }: { p: Product; i: number; ui: StudioData['ui']; isEn: boolean }) {
  const headline = p.mock.headline.join('\n')
  if (p.preview === 'chart') {
    return (
      <div className="st-product-stage st-dashboard-stage">
        <StudioChart title={p.mock.brand} isEn={isEn} />
      </div>
    )
  }
  if (p.preview === 'landing') {
    return (
      <div className="st-product-stage st-learning-stage">
        <div className="st-learning-preview">
          <div className="st-learning-nav">
            <strong dir="auto">{p.mock.brand || p.title}</strong>
            {p.mock.tagline && <span>{p.mock.tagline}</span>}
          </div>
          <div className="st-learning-content">
            <div>
              {headline && <h3>{headline}</h3>}
              {p.mock.cta && (
                <span className="st-preview-cta">
                  {p.mock.cta}
                  <Icon name="arrow-up-right" size={15} />
                </span>
              )}
            </div>
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.title} loading="lazy" />
            )}
          </div>
        </div>
        <span className="st-preview-label">{ui.previewIdea}</span>
      </div>
    )
  }
  if (p.preview === 'site') {
    return (
      <div className="st-product-stage st-viral-stage">
        <div className="st-browser-frame">
          <div className="st-browser-bar">
            <span aria-hidden="true">● ● ●</span>
            <strong dir="auto">{p.title}</strong>
            <Icon name="code-xml" />
          </div>
          <div className="st-viral-preview">
            <div className="st-viral-preview-head">
              <strong dir="ltr">{p.mock.brand || p.host || p.title}</strong>
              {p.mock.tagline && <span>{p.mock.tagline}</span>}
            </div>
            {headline && <h3>{headline}</h3>}
            {p.mock.imgs.length > 0 && (
              <div className="st-preview-image-grid">
                {p.mock.imgs.map((src, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={j} src={src} alt="" loading="lazy" />
                ))}
              </div>
            )}
          </div>
        </div>
        <span className="st-preview-label">{ui.previewLabel}</span>
      </div>
    )
  }
  return (
    <div className={`st-product-stage ${STAGES[i % STAGES.length]}`}>
      <div className={`st-browser-frame${i ? ' st-tilt' : ''}`}>
        <div className="st-browser-bar">
          <span aria-hidden="true">● ● ●</span>
          <strong dir="auto">{p.host || p.title}</strong>
          <Icon name="code-xml" />
        </div>
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="st-stage-shot" src={p.image} alt={p.title} loading="lazy" />
        )}
      </div>
      <span className="st-preview-label">{ui.previewLabel}</span>
    </div>
  )
}

function ProductCopy({ p, ui, feature }: { p: Product; ui: StudioData['ui']; feature?: boolean }) {
  const detailLines = p.details.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  return (
    <div className="st-digital-copy">
      {p.tag && <span className={`st-project-status${p.preview === 'chart' ? ' st-concept' : ''}`}>{p.tag}</span>}
      {/* A Latin name sets large and left-to-right with its arrow at the far
          end, as the reference's product name does. */}
      <h3 dir={/^[\x00-\x7F]+$/.test(p.title) ? 'ltr' : undefined}>
        {p.title}
        {feature && p.url && <span>↗</span>}
      </h3>
      {p.description && <p>{p.description}</p>}
      {/* On the large card several detail lines read as a list, as the
          reference has; elsewhere the details open in place. */}
      {feature && detailLines.length > 1 ? (
        <ul>
          {detailLines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      ) : p.details ? (
        <details>
          <summary>
            {p.detailsLabel}
            <Icon name="arrow-down" size={18} />
          </summary>
          <p>{p.details}</p>
        </details>
      ) : null}
      {p.url && (
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="st-button st-digital-link" style={feature ? undefined : { marginTop: 24 }}>
          {p.btn}
          <Icon name="arrow-up-right" />
        </a>
      )}
    </div>
  )
}
