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
  // Apply saved language/direction + colour mode before paint (avoids a flash).
  const boot = `(function(){try{var l=localStorage.getItem('dash-lang')||'ar';var m=localStorage.getItem('dash-mode')||'dark';var e=document.documentElement;e.setAttribute('lang',l);e.setAttribute('dir',l==='ar'?'rtl':'ltr');e.setAttribute('data-mode',m);}catch(e){}})();`
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className="dash-body">{children}</body>
    </html>
  )
}
