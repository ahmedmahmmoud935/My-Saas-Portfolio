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

  return (
    <div className={`mod-embed ${cls} ${className}`.trim()}>
      {css && (
        // eslint-disable-next-line react/no-danger
        <style dangerouslySetInnerHTML={{ __html: scopeCss(css, `.${cls}`, cls) }} />
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  )
}
