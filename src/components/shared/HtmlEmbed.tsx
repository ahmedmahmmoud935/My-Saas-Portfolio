'use client'

import React, { useId } from 'react'
import { prefixHtmlClasses, scopeCss, splitHtmlDocument } from '@/lib/html-embed'

/**
 * A whole HTML page pasted in as a case study, rendered with its own
 * stylesheet confined to this element.
 *
 * The dashboard preview and the public page both render through here, so what
 * you see while editing is what visitors get — including the scoping, which is
 * the part most likely to change how the design lands.
 */
export default function HtmlEmbed({
  value,
  className = '',
}: {
  value: string
  className?: string
}) {
  // A stable class per instance, so two pasted pages can't restyle each other.
  const cls = `embed-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const { html, css } = splitHtmlDocument(value)
  // The same token renames the page's own classes on both sides, so the site's
  // `.hero` / `.section` / `.eyebrow` can't reach in and restyle it.
  const markup = prefixHtmlClasses(html, cls)
  // A page written against the site's tokens follows the site instead of
  // standing on its own paper — so it gets no canvas to stand on.
  const themed = /var\(\s*--(bg|bg-2|bg-3|text|sub|border|accent)\b/.test(css)

  // Two elements on purpose. The outer one is the CANVAS — what a browser
  // paints behind a standalone document — and the pasted CSS can never target
  // it. The inner one stands in for <body>, which is where the page's own
  // `body { … }` rules land. Sharing one element meant `body{background:
  // transparent}` cleared the canvas, so a case study drawn on white was
  // rendered on the site's black: its dark text vanished in dark mode and
  // reappeared in light mode.
  return (
    <div className={`mod-embed${themed ? ' themed' : ''} ${className}`.trim()}>
      {css && (
        // eslint-disable-next-line react/no-danger
        <style dangerouslySetInnerHTML={{ __html: scopeCss(css, `.${cls}`, cls) }} />
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <div className={cls} dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  )
}
