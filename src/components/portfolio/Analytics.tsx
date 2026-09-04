import React from 'react'

/**
 * Google Analytics, when the site's owner has set an id.
 *
 * Loaded after the page is interactive rather than in the head: measurement is
 * never worth delaying the content someone came to read. Renders nothing at
 * all when no id is set, so a site that has not asked for analytics ships no
 * third-party script and sets no cookie.
 */
export default function Analytics({ id }: { id?: string | null }) {
  const clean = (id ?? '').trim()
  // A GA4 measurement id, not an arbitrary string — this ends up in a script
  // URL, so nothing else is allowed near it.
  if (!/^G-[A-Z0-9]{4,20}$/i.test(clean)) return null

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${clean}`} />
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${clean}');`,
        }}
      />
    </>
  )
}
