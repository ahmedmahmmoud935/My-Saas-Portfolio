'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Icon } from './icons'
import type { StudioData } from '@/lib/studio-data'

/**
 * The services grid. Each card is short — its line cut to three — and opens
 * the whole service in a window over the page, with the ways to get in touch
 * about it: WhatsApp and a call, when the client has them, and the contact
 * form otherwise.
 */
export default function StudioServices({
  services,
  ui,
  ltr,
  whatsapp,
  phone,
  hasContact,
}: {
  services: NonNullable<StudioData['services']>
  ui: StudioData['ui']
  ltr: boolean
  whatsapp: string | null
  phone: string | null
  hasContact: boolean
}) {
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const item = open === null ? null : services.items[open]

  useEffect(() => {
    if (item) dialog.current?.showModal()
    else dialog.current?.close()
    document.body.style.overflow = item ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [item])

  const close = () => {
    setOpen(null)
    opener.current?.focus()
  }
  const icon = (s: (typeof services.items)[number]) =>
    s.iconUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={s.iconUrl} alt="" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'contain' }} />
    ) : (
      <Icon name={s.icon} />
    )
  const message = (title: string) => encodeURIComponent(`${ui.serviceAsk} ${title}`)

  const picture = (s: (typeof services.items)[number]) => s.image ? (
    <span className="st-service-picture" aria-hidden="true" style={{ '--st-service-dark': s.dark / 100, '--st-service-light': s.light / 100 } as React.CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.image} alt="" loading="lazy" style={{ objectPosition: `${s.x}% ${s.y}%`, transform: `scale(${s.zoom / 100})`, transformOrigin: `${s.x}% ${s.y}%` }} />
      <span />
    </span>
  ) : null

  return (
    <>
      <div className="st-services-grid">
        {services.items.map((s, i) => (
          <article
            className="st-service-card st-service-open"
            key={i}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            onClick={(e) => {
              opener.current = e.currentTarget
              setOpen(i)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                opener.current = e.currentTarget
                setOpen(i)
              }
            }}
          >
            {picture(s)}
            <div className="st-service-top">{icon(s)}</div>
            <h3>{s.title}</h3>
            {s.desc && <p>{s.desc}</p>}
            <span className="st-service-arrow" aria-hidden="true">
              <Icon name={ltr ? 'arrow-right' : 'arrow-left'} />
            </span>
          </article>
        ))}
      </div>

      <dialog
        className="st-project-dialog st-service-dialog"
        ref={dialog}
        onCancel={close}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-labelledby="st-service-title"
      >
        {item && (
          <div className="st-dialog-content">
            <button className="st-dialog-close st-icon-button" onClick={close} aria-label={ui.close}>
              <Icon name="x" size={23} />
            </button>
            <div className="st-dialog-body st-service-detail">
              {picture(item)}
              <div className="st-service-top">{icon(item)}</div>
              <h2 id="st-service-title">{item.title}</h2>
              {item.desc && <p className="st-service-full">{item.desc}</p>}
              <div className="st-service-actions">
                {whatsapp && (
                  <a className="st-button st-primary" href={`${whatsapp}?text=${message(item.title)}`} target="_blank" rel="noopener noreferrer">
                    {ui.whatsappUs}
                    <Icon name="arrow-up-right" size={18} />
                  </a>
                )}
                {phone && (
                  <a className="st-button st-outline" href={phone}>
                    {ui.callUs}
                    <Icon name="phone" size={18} />
                  </a>
                )}
                {!whatsapp && !phone && hasContact && (
                  <a className="st-button st-primary" href="#contact" onClick={close}>
                    {ui.discuss}
                    <Icon name="arrow-up-right" size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
