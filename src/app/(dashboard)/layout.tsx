import React from 'react'
import { Cairo } from 'next/font/google'
import './dashboard.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata = {
  title: 'Portfolio Admin — ViralPX',
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="dash-body">{children}</body>
    </html>
  )
}
