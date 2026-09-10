import React from 'react'
import type { Metadata } from 'next'

/**
 * The sign-in page has no business in search results.
 *
 * Nobody searching for anything wants a login form, and Search Console was
 * reporting real impressions for it — a page earning its way in front of
 * readers and giving them nothing. It is left crawlable on purpose: a
 * robots.txt Disallow would stop Google reading this tag and the page could
 * stay indexed as a bare URL with no description at all.
 *
 * A layout rather than the page itself, because the page is a client component
 * and cannot export metadata.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
