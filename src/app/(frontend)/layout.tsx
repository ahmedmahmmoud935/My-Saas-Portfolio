import React from 'react'
import {
  Tajawal,
  Montserrat,
  Cairo,
  Almarai,
  Markazi_Text,
  Inter,
  Playfair_Display,
  Cormorant,
  Bebas_Neue,
} from 'next/font/google'
import './globals.css'

// Default pair (Tajawal kept in --font-cairo so no CSS changes are needed).
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

// Extra font families for the Fonts picker (switched via [data-font] in CSS).
const cairoReal = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '600', '700', '900'], variable: '--f-cairo', display: 'swap' })
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700', '800'], variable: '--f-almarai', display: 'swap' })
const markazi = Markazi_Text({ subsets: ['arabic', 'latin'], weight: ['400', '500', '700'], variable: '--f-markazi', display: 'swap' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '900'], variable: '--f-inter', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--f-playfair', display: 'swap' })
const cormorant = Cormorant({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--f-cormorant', display: 'swap' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--f-bebas', display: 'swap' })

const fontVars = [
  cairo.variable,
  montserrat.variable,
  cairoReal.variable,
  almarai.variable,
  markazi.variable,
  inter.variable,
  playfair.variable,
  cormorant.variable,
  bebas.variable,
].join(' ')

export const metadata = {
  // Resolve relative OG/canonical URLs against the real host (not localhost:3000).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: 'ViralPX',
  description: 'Multi-tenant portfolio-builder SaaS',
}

// Apply the saved light/dark preference before paint (no flash).
const themeBoot = `(function(){try{var t=localStorage.getItem('pf-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVars}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
