import React from 'react'
import { headers } from 'next/headers'
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
// adjustFontFallback: false on every Latin display face.
//
// Next otherwise appends a metric-matched local fallback ("Montserrat
// Fallback") to the variable. That fallback is a system font with full Unicode
// coverage, so it swallows Arabic glyphs before the stack can reach the Arabic
// family — which is why Arabic headings kept rendering in the system font no
// matter which font was picked.
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
  adjustFontFallback: false,
  // Arabic must resolve to the Arabic face, not the metric-matched system
  // fallback Next injects — so name it here, inside the generated variable.
  fallback: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
})

// Extra font families for the Fonts picker (switched via [data-font] in CSS).
const cairoReal = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '600', '700', '900'], variable: '--f-cairo', display: 'swap' })
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700', '800'], variable: '--f-almarai', display: 'swap' })
const markazi = Markazi_Text({ subsets: ['arabic', 'latin'], weight: ['400', '500', '700'], variable: '--f-markazi', display: 'swap' })
const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '900'], variable: '--f-inter', display: 'swap', adjustFontFallback: false, fallback: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'] })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--f-playfair', display: 'swap', adjustFontFallback: false, fallback: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'] })
const cormorant = Cormorant({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--f-cormorant', display: 'swap', adjustFontFallback: false, fallback: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'] })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--f-bebas', display: 'swap', adjustFontFallback: false, fallback: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'] })

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

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  // Set by middleware from ?lang, or from the portfolio's own pinned direction.
  // It was hard-coded to English, which declared every Arabic portfolio on the
  // platform to be an English page.
  const lang = (await headers()).get('x-pf-lang') === 'ar' ? 'ar' : 'en'
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={fontVars}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
