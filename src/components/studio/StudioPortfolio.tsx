import React from 'react'
import { Icon } from './icons'
import StudioHeader, { Monogram } from './StudioHeader'
import StudioWork from './StudioWork'
import StudioContactForm from './StudioContactForm'
import type { Heading, StudioData } from '@/lib/studio-data'
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
  const links = [
    d.work && { id: 'work', label: ui.nav.work },
    d.about && { id: 'about', label: ui.nav.about },
    d.services && { id: 'services', label: ui.nav.services },
    d.experience && { id: 'experience', label: ui.nav.experience },
    d.contact && { id: 'contact', label: ui.nav.contact },
  ].filter((l): l is { id: string; label: string } => !!l)

  const [feature, ...pair] = d.digital?.items ?? []

  return (
    <div className={`st-root st-portfolio st-lang-${d.lang}`} style={d.vars as React.CSSProperties} dir={isEn ? 'ltr' : 'rtl'} lang={d.lang}>
      <a className="st-skip-link" href="#work">
        {ui.seeWork}
      </a>
      <StudioHeader ui={ui} name={d.name} monogram={d.monogram} links={links} digital={!!d.digital} langHref={d.langHref} isEn={isEn} />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="st-hero" id="home">
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
              <a href="#work" className="st-button st-primary">
                {d.hero.btn1}
                <Icon name="arrow-down" size={18} />
              </a>
              {d.hero.btn2 && (
                <a href={d.hero.btn2Href} className="st-button st-outline">
                  {d.hero.btn2}
                  <Icon name={d.hero.btn2Href === '#digital' ? 'code-xml' : 'arrow-up-right'} size={19} />
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

        {/* ── About ────────────────────────────────────────────────────── */}
        {d.about && (
          <section className="st-about-section st-shell st-section" id="about">
            {d.about.photo && (
              <div className="st-about-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.about.photo} alt={d.name} width={460} height={550} loading="lazy" />
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

        {d.work && <StudioWork work={d.work} ui={ui} isEn={isEn} />}

        {/* ── Beyond the image ─────────────────────────────────────────── */}
        {d.digital && (
          <section className="st-digital-section st-section" id="digital">
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
                  <div className={`st-product-stage ${STAGES[0]}`}>
                    <div className="st-browser-frame">
                      <div className="st-browser-bar">
                        <span aria-hidden="true">● ● ●</span>
                        <strong dir="auto">{feature.host || feature.title}</strong>
                        <Icon name="code-xml" />
                      </div>
                      {feature.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="st-stage-shot" src={feature.image} alt={feature.title} loading="lazy" />
                      )}
                    </div>
                    <span className="st-preview-label">{ui.previewLabel}</span>
                  </div>
                  <ProductCopy p={feature} ui={ui} feature />
                </article>
              )}

              {pair.length > 0 && (
                <div className="st-digital-pair">
                  {pair.map((p, i) => (
                    <article className="st-digital-project" key={p.id}>
                      <div className={`st-product-stage ${STAGES[(i + 1) % STAGES.length]}`}>
                        <div className="st-browser-frame st-tilt">
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
                      <ProductCopy p={p} ui={ui} />
                    </article>
                  ))}
                </div>
              )}

              {(d.digital.endText || d.digital.endBtn) && (
                <div className="st-digital-end">
                  {d.digital.endText && <p>{d.digital.endText}</p>}
                  {d.digital.endBtn && (
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

        {/* ── Services ─────────────────────────────────────────────────── */}
        {d.services && (
          <section className="st-services-section st-shell st-section" id="services">
            <div className="st-services-heading">
              <div>
                <h2>
                  <HeadingLines h={d.services.heading} />
                </h2>
              </div>
              {d.services.subtitle && <p>{d.services.subtitle}</p>}
            </div>
            <div className="st-services-grid">
              {d.services.items.map((s, i) => (
                <article className="st-service-card" key={i}>
                  <div className="st-service-top">
                    {s.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.iconUrl} alt="" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    ) : (
                      <Icon name={s.icon} />
                    )}
                  </div>
                  <h3>{s.title}</h3>
                  {s.desc && <p>{s.desc}</p>}
                  <a href="#contact" aria-label={`${ui.discuss}: ${s.title}`}>
                    <Icon name={isEn ? 'arrow-right' : 'arrow-left'} />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Reviews ──────────────────────────────────────────────────── */}
        {d.reviews && (
          <section className="st-reviews-section st-section" id="testimonials">
            <div className="st-shell">
              <div className="st-split-heading">
                <div className="st-section-title">
                  <h2>{d.reviews.title}</h2>
                  {d.reviews.subtitle && <p className="st-section-subtitle">{d.reviews.subtitle}</p>}
                </div>
                <a className="st-button st-outline st-small" href={d.reviews.addHref} target="_blank" rel="noopener noreferrer">
                  {ui.addReview}
                  <Icon name="arrow-up-right" />
                </a>
              </div>
              <div className="st-review-grid">
                {d.reviews.items.map((r) => (
                  <article className="st-review-card" key={r.id}>
                    <div className="st-review-stars">
                      {Array.from({ length: r.rating }, (_, i) => (
                        <Icon key={i} name="star" size={18} fill="currentColor" />
                      ))}
                      <Icon name="quote" />
                    </div>
                    <p dir="auto">{r.text}</p>
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
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Clients and numbers ──────────────────────────────────────── */}
        {d.clients && (
          <section className="st-clients-section st-shell st-section" id="clients">
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
              <div className="st-stats-grid">
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

        {/* ── Experience ───────────────────────────────────────────────── */}
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

        {/* ── Tools ────────────────────────────────────────────────────── */}
        {d.tools && (
          <section className="st-tools-section st-shell st-section" id="tools">
            <div className="st-section-title">
              <h2>{d.tools.title}</h2>
            </div>
            <div className="st-tools-grid" dir="ltr">
              {d.tools.items.map((t, i) => (
                <div className="st-tool" key={i}>
                  <span className="st-tool-icon" style={{ background: t.bg, color: t.fg }}>
                    {t.letters}
                  </span>
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Education ────────────────────────────────────────────────── */}
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

        {/* ── Contact ──────────────────────────────────────────────────── */}
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
                {(d.contact.email || d.contact.phone) && (
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
      </main>

      <footer className="st-site-footer">
        <div className="st-shell">
          <div className="st-footer-main">
            <Monogram monogram={d.monogram} as="a" href="#home" />
            {d.footer && <p>{d.footer}</p>}
            <a href="#home">
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

function ProductCopy({ p, ui, feature }: { p: NonNullable<StudioData['digital']>['items'][number]; ui: StudioData['ui']; feature?: boolean }) {
  const detailLines = p.details.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  return (
    <div className="st-digital-copy">
      {p.tag && <span className="st-project-status">{p.tag}</span>}
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
            {ui.details}
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
