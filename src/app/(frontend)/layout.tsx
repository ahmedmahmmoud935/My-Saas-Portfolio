import React from 'react'
import { Cairo, Montserrat } from 'next/font/google'
import './globals.css'

// Cairo = Arabic + body; Montserrat = Latin/display. Matches the original site.
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
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
  title: 'ViralPX',
  description: 'Multi-tenant portfolio-builder SaaS',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
