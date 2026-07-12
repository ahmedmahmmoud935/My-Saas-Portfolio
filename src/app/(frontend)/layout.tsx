import React from 'react'
import { Tajawal, Montserrat } from 'next/font/google'
import './globals.css'

// Tajawal = Arabic + body (kept in the --font-cairo CSS var so no CSS changes are
// needed); Montserrat = Latin/display.
const cairo = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata = {
  // Resolve relative OG/canonical URLs against the real host (not localhost:3000).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: 'ViralPX',
  description: 'Multi-tenant portfolio-builder SaaS',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${cairo.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
