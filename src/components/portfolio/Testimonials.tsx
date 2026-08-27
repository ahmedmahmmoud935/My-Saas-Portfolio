'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type Testimonial = {
  id: number
  name: string
  role?: string | null
  company?: string | null
  content: string
  avatarUrl?: string | null
  rating?: number | null
}

/**
 * The direction the text itself is written in, not the direction of the page.
 *
 * A review is written by a client in whichever language they use, and an
 * English one on an Arabic page was being laid out right-to-left — which puts
 * the full stop and any trailing emoji at the wrong end of the sentence. The
 * majority script wins, so a stray Latin word inside Arabic doesn't flip it.
 */
function textDir(s: string): 'rtl' | 'ltr' {
  const rtl = (s.match(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length
  const ltr = (s.match(/[A-Za-z]/g) || []).length
  return rtl >= ltr ? 'rtl' : 'ltr'
}

/**
 * One review. The person comes first, then their rating, then what they said —
 * you decide whether a review is worth reading by who wrote it.
 *
 * Every card is the same height whatever the length of the review: the text is
 * clamped, and anything longer offers to open. One long review used to stretch
 * its column and leave the others half empty.
 */
function Card({ t, onOpen, more }: { t: Testimonial; onOpen: () => void; more: string }) {
  const body = useRef<HTMLParagraphElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Whether the clamp actually cut anything off — measured, because it depends
  // on the font, the language and the column width, none of which are known here.
  useEffect(() => {
    const el = body.current
    if (!el) return
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [t.content])

  const dir = textDir(t.content)

  return (
    <div className={`tst${expanded ? ' open' : ''}`} dir={dir}>
      <div className="tst-head">
        {t.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatarUrl} alt={t.name} />
        )}
        <div>
          <strong>{t.name}</strong>
          <div className="tst-role">{[t.role, t.company].filter(Boolean).join(' · ')}</div>
        </div>
      </div>

      <div className="tst-stars">{'★'.repeat(t.rating ?? 5)}</div>

      <p className="tst-body" ref={body}>
        {t.content}
      </p>

      {(overflows || expanded) && (
        <button
          type="button"
          className="tst-more"
          onClick={() => {
            // A phone has no room for a dialog worth reading, so the card grows
            // in place and pushes the rest of the page down. A wider screen
            // opens the review on its own instead.
            if (window.matchMedia('(max-width: 767px)').matches) setExpanded((v) => !v)
            else onOpen()
          }}
        >
          {expanded ? '−' : more}
        </button>
      )}
    </div>
  )
}

export default function Testimonials({
  title,
  items,
  submitHref,
  submitLabel,
  lang = 'ar',
}: {
  title: string
  items: Testimonial[]
  submitHref?: string
  submitLabel?: string
  lang?: 'ar' | 'en'
}) {
  const [open, setOpen] = useState<Testimonial | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const more = lang === 'en' ? 'Read more' : 'المزيد'

  // Hide the whole section only when there's nothing to show AND no way to add one.
  if (items.length === 0 && !submitHref) return null

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="tst-grid">
          {items.map((t) => (
            <Card key={t.id} t={t} more={more} onOpen={() => setOpen(t)} />
          ))}
        </div>
        {submitHref && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a className="tst-add" href={submitHref}>
              {submitLabel || '+ أضف رأيك'}
            </a>
          </div>
        )}
      </div>

      {mounted &&
        open &&
        createPortal(
          <div className="tst-modal" onClick={() => setOpen(null)}>
            <div
              className="tst-modal-card"
              dir={textDir(open.content)}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="tst-modal-x" onClick={() => setOpen(null)} aria-label="close">
                ✕
              </button>
              <div className="tst-head">
                {open.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={open.avatarUrl} alt={open.name} />
                )}
                <div>
                  <strong>{open.name}</strong>
                  <div className="tst-role">
                    {[open.role, open.company].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
              <div className="tst-stars">{'★'.repeat(open.rating ?? 5)}</div>
              <p className="tst-modal-body">{open.content}</p>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
