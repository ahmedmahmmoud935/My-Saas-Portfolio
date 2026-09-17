import React from 'react'

/**
 * The two ways a visitor reaches someone without writing anything: WhatsApp
 * and a phone call.
 *
 * One component for both sites — a portfolio and the platform's own page ask
 * the same thing of a reader, and two copies of a floating button would drift.
 * Each is shown only when there is a number behind it, so nobody lands on
 * `wa.me/` with nothing after it.
 *
 * The WhatsApp mark is the official glyph, because a made-up speech bubble
 * makes a reader hesitate over what happens when they tap it.
 *
 * One in each bottom corner rather than a stack in one of them: stacked, the
 * upper button sits where nothing else on a page ever does, and the lower one
 * is the only one a thumb finds.
 */

/** Digits only: a number gets written +20 10, (010) and 0020 in equal measure. */
const digits = (n: string) => n.replace(/[^\d]/g, '')

export default function ContactFabs({
  whatsapp,
  phone,
  labels,
  /** The portfolio's phone bar already owns the bottom of a small screen. */
  hideOnPhone = false,
}: {
  whatsapp?: string | null
  phone?: string | null
  labels: { whatsapp: string; call: string }
  hideOnPhone?: boolean
}) {
  const wa = whatsapp ? digits(whatsapp) : ''
  const tel = phone ? digits(phone) : ''
  if (!wa && !tel) return null

  const off = hideOnPhone ? ' fab-desk' : ''
  return (
    <>
      {tel && (
        <a className={`fab fab-call${off}`} href={`tel:+${tel}`} aria-label={labels.call} title={labels.call}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden focusable="false">
            <path
              fill="currentColor"
              d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2z"
            />
          </svg>
        </a>
      )}
      {wa && (
        <a
          className={`fab fab-wa${off}`}
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
          aria-label={labels.whatsapp}
          title={labels.whatsapp}
        >
          {/* WhatsApp's own glyph (Simple Icons, CC0 path data). */}
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden focusable="false">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.4"
            />
          </svg>
        </a>
      )}
    </>
  )
}
