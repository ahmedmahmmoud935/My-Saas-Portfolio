import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

// Touches the DB → render per-request.
export const dynamic = 'force-dynamic'

type Params = { searchParams?: Promise<{ lang?: string }> }

const ORANGE = '#F97316'
const SITE = process.env.NEXT_PUBLIC_SERVER_URL || ''

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const { lang } = (await searchParams) ?? {}
  const en = lang === 'en'
  const title = 'ViralPX — بورتفوليو احترافي في دقائق'
  const description = en
    ? 'ViralPX is a multi-tenant portfolio builder: launch a hosted portfolio with projects, reels, articles and a contact form — on your own domain.'
    : 'ViralPX منصة بناء بورتفوليو احترافي: أطلق موقعك بمشاريعك وريلزك ومقالاتك ونموذج تواصل — على دومينك الخاص.'
  return {
    title,
    description,
    alternates: { canonical: SITE || undefined },
    openGraph: { title, description, type: 'website', url: SITE || undefined },
    twitter: { card: 'summary_large_image', title, description },
  }
}

const COPY = {
  ar: {
    nav: { features: 'المميزات', how: 'الطريقة', showcase: 'أمثلة', pricing: 'الأسعار', faq: 'الأسئلة' },
    cta: 'ابدأ الآن',
    login: 'دخول',
    heroEyebrow: 'منصة بورتفوليو متعدّدة المستخدمين',
    heroTitle: 'بورتفوليو احترافي،',
    heroTitleAccent: 'في دقائق.',
    heroSub:
      'اعرض مشاريعك وريلزك ومقالاتك في موقع سريع ومتجاوب — بالعربي والإنجليزي، على دومينك الخاص، من غير كود.',
    heroBtn1: 'اطلب بورتفوليو',
    heroBtn2: 'شوف مثال حي',
    featuresTitle: 'كل اللي تحتاجه في مكان واحد',
    features: [
      { icon: '🎨', t: 'تصميم قابل للتخصيص', d: 'ألوان وخطوط وأقسام قابلة للترتيب من لوحة تحكم عربية بالكامل.' },
      { icon: '🖼️', t: 'مشاريع وريلز', d: 'شبكات صور، عارض ريلز عمودي 9:16، ستوري هايلايتس، وصفحات تفاصيل للمشاريع.' },
      { icon: '✍️', t: 'مدوّنة ومقالات', d: 'محرّر غني + HTML خام، مع SEO و JSON-LD لكل مقال.' },
      { icon: '🌐', t: 'دومينك الخاص', d: 'اربط دومينك بضغطة، مع شهادة SSL تلقائية.' },
      { icon: '⚡', t: 'سريع و SEO', d: 'صور WebP، Sitemap، بيانات منظّمة، وتحميل كسول للأداء.' },
      { icon: '📩', t: 'نموذج تواصل شغّال', d: 'رسائل العملاء توصلك على إيميلك مباشرة، مع صفحة آراء عامة.' },
    ],
    howTitle: 'ثلاث خطوات وخلاص',
    how: [
      { n: '1', t: 'سجّل دخولك', d: 'ادخل لوحة التحكم وابدأ من قالب جاهز.' },
      { n: '2', t: 'ضيف محتواك', d: 'ارفع مشاريعك وصورك ومقالاتك ورتّب الأقسام.' },
      { n: '3', t: 'انشر', d: 'اربط دومينك وشارك موقعك مع العالم.' },
    ],
    showcaseTitle: 'بورتفوليوهات حيّة على المنصة',
    showcaseEmpty: 'قريباً — أول البورتفوليوهات في الطريق.',
    visit: 'زيارة',
    pricingTitle: 'أسعار بسيطة',
    plans: [
      { name: 'مجاني', price: '0', per: 'للأبد', feats: ['بورتفوليو واحد', 'رابط ViralPX', 'مشاريع ومقالات', 'مساحة 1GB'], cta: 'ابدأ مجاناً', hi: false },
      { name: 'برو', price: '199', per: 'شهرياً', feats: ['دومينك الخاص + SSL', 'مساحة أكبر', 'إزالة العلامة', 'أولوية الدعم'], cta: 'اشترك في برو', hi: true },
    ],
    faqTitle: 'أسئلة شائعة',
    faqs: [
      { q: 'محتاج أعرف كود؟', a: 'لأ خالص. كل حاجة من لوحة تحكم عربية بالسحب والإفلات.' },
      { q: 'أقدر أربط دوميني؟', a: 'أيوه، في خطة برو تربط دومينك بشهادة SSL تلقائية.' },
      { q: 'الموقع بيدعم العربي والإنجليزي؟', a: 'أيوه، ثنائي اللغة مع دعم كامل للاتجاه من اليمين لليسار.' },
      { q: 'بياناتي في أمان؟', a: 'كل مستخدم معزول تماماً عن غيره، والصور على CDN آمن.' },
    ],
    ctaTitle: 'جاهز تطلق بورتفوليوك؟',
    ctaSub: 'ابدأ دلوقتي — أول بورتفوليو مجاني.',
    ctaBtn: 'ابدأ الآن',
    rights: 'كل الحقوق محفوظة',
  },
  en: {
    nav: { features: 'Features', how: 'How it works', showcase: 'Showcase', pricing: 'Pricing', faq: 'FAQ' },
    cta: 'Get started',
    login: 'Log in',
    heroEyebrow: 'Multi-tenant portfolio platform',
    heroTitle: 'A professional portfolio,',
    heroTitleAccent: 'in minutes.',
    heroSub:
      'Show your projects, reels and articles on a fast, responsive site — Arabic & English, on your own domain, no code.',
    heroBtn1: 'Request a portfolio',
    heroBtn2: 'See a live example',
    featuresTitle: 'Everything you need, in one place',
    features: [
      { icon: '🎨', t: 'Customizable design', d: 'Colors, fonts and reorderable sections from a full dashboard.' },
      { icon: '🖼️', t: 'Projects & reels', d: 'Image grids, a 9:16 vertical reels player, story highlights and project pages.' },
      { icon: '✍️', t: 'Blog & articles', d: 'Rich editor + raw HTML, with SEO and JSON-LD per article.' },
      { icon: '🌐', t: 'Your own domain', d: 'Connect your domain in a click, with automatic SSL.' },
      { icon: '⚡', t: 'Fast & SEO-ready', d: 'WebP images, sitemap, structured data and lazy loading.' },
      { icon: '📩', t: 'Working contact form', d: 'Client messages reach your inbox, plus a public reviews page.' },
    ],
    howTitle: 'Three steps, done',
    how: [
      { n: '1', t: 'Log in', d: 'Open the dashboard and start from a ready template.' },
      { n: '2', t: 'Add your content', d: 'Upload projects, images and articles, arrange sections.' },
      { n: '3', t: 'Publish', d: 'Connect your domain and share with the world.' },
    ],
    showcaseTitle: 'Live portfolios on the platform',
    showcaseEmpty: 'Coming soon — the first portfolios are on the way.',
    visit: 'Visit',
    pricingTitle: 'Simple pricing',
    plans: [
      { name: 'Free', price: '0', per: 'forever', feats: ['One portfolio', 'ViralPX link', 'Projects & articles', '1GB storage'], cta: 'Start free', hi: false },
      { name: 'Pro', price: '199', per: '/mo', feats: ['Your own domain + SSL', 'More storage', 'Remove branding', 'Priority support'], cta: 'Go Pro', hi: true },
    ],
    faqTitle: 'Frequently asked',
    faqs: [
      { q: 'Do I need to code?', a: 'Not at all. Everything is drag-and-drop from the dashboard.' },
      { q: 'Can I use my own domain?', a: 'Yes — the Pro plan connects your domain with automatic SSL.' },
      { q: 'Is it bilingual?', a: 'Yes, Arabic & English with full right-to-left support.' },
      { q: 'Is my data isolated?', a: 'Every tenant is fully isolated, and media is served from a secure CDN.' },
    ],
    ctaTitle: 'Ready to launch your portfolio?',
    ctaSub: 'Start now — your first portfolio is free.',
    ctaBtn: 'Get started',
    rights: 'All rights reserved',
  },
}

async function getShowcase(): Promise<{ name: string; slug: string }[]> {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({ collection: 'tenants', limit: 6, depth: 0, sort: '-createdAt' })
    return res.docs.map((t) => ({ name: t.name, slug: t.slug }))
  } catch {
    return []
  }
}

export default async function HomePage({ searchParams }: Params) {
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'en' ? 'en' : 'ar'
  const c = COPY[locale]
  const q = locale === 'en' ? '?lang=en' : ''
  const showcase = await getShowcase()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="lp" dir={locale === 'en' ? 'ltr' : 'rtl'} lang={locale}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="lp-nav">
        <a href={`/${q}`} className="lp-logo">
          Viral<span>PX</span>
        </a>
        <nav className="lp-nav-links">
          <a href="#features">{c.nav.features}</a>
          <a href="#how">{c.nav.how}</a>
          <a href="#showcase">{c.nav.showcase}</a>
          <a href="#pricing">{c.nav.pricing}</a>
          <a href="#faq">{c.nav.faq}</a>
        </nav>
        <div className="lp-nav-actions">
          <a className="lp-lang" href={locale === 'en' ? '/' : '/?lang=en'}>
            {locale === 'en' ? 'ع' : 'EN'}
          </a>
          <a className="lp-btn lp-btn-ghost" href="/login">
            {c.login}
          </a>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-glow" />
        <span className="lp-eyebrow">{c.heroEyebrow}</span>
        <h1 className="lp-h1">
          {c.heroTitle} <span className="lp-accent">{c.heroTitleAccent}</span>
        </h1>
        <p className="lp-lead">{c.heroSub}</p>
        <div className="lp-hero-btns">
          <a className="lp-btn lp-btn-primary" href="/login">
            {c.heroBtn1}
          </a>
          {showcase[0] && (
            <a className="lp-btn lp-btn-ghost" href={`/${showcase[0].slug}${q}`}>
              {c.heroBtn2}
            </a>
          )}
        </div>
      </section>

      <section className="lp-sec" id="features">
        <h2 className="lp-h2">{c.featuresTitle}</h2>
        <div className="lp-grid lp-grid-3">
          {c.features.map((f) => (
            <div className="lp-card" key={f.t}>
              <div className="lp-card-icon">{f.icon}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec" id="how">
        <h2 className="lp-h2">{c.howTitle}</h2>
        <div className="lp-grid lp-grid-3">
          {c.how.map((s) => (
            <div className="lp-step" key={s.n}>
              <div className="lp-step-n">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec" id="showcase">
        <h2 className="lp-h2">{c.showcaseTitle}</h2>
        {showcase.length === 0 ? (
          <p className="lp-empty">{c.showcaseEmpty}</p>
        ) : (
          <div className="lp-grid lp-grid-3">
            {showcase.map((s) => (
              <a className="lp-tenant" href={`/${s.slug}${q}`} key={s.slug}>
                <div className="lp-tenant-badge">{s.name?.[0]?.toUpperCase() || 'V'}</div>
                <div className="lp-tenant-body">
                  <strong>{s.name}</strong>
                  <span>/{s.slug}</span>
                </div>
                <span className="lp-tenant-go">{c.visit} →</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="lp-sec" id="pricing">
        <h2 className="lp-h2">{c.pricingTitle}</h2>
        <div className="lp-grid lp-grid-2 lp-pricing">
          {c.plans.map((p) => (
            <div className={`lp-plan${p.hi ? ' lp-plan-hi' : ''}`} key={p.name}>
              <div className="lp-plan-name">{p.name}</div>
              <div className="lp-plan-price">
                <span>{p.price}</span>
                <small>{p.per}</small>
              </div>
              <ul>
                {p.feats.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <a className={`lp-btn ${p.hi ? 'lp-btn-primary' : 'lp-btn-ghost'}`} href="/login">
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec" id="faq">
        <h2 className="lp-h2">{c.faqTitle}</h2>
        <div className="lp-faq">
          {c.faqs.map((f) => (
            <details className="lp-faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2 className="lp-h2">{c.ctaTitle}</h2>
          <p>{c.ctaSub}</p>
          <a className="lp-btn lp-btn-primary lp-btn-lg" href="/login">
            {c.ctaBtn}
          </a>
        </div>
      </section>

      <footer className="lp-footer">
        <a href={`/${q}`} className="lp-logo">
          Viral<span>PX</span>
        </a>
        <span>
          © {new Date().getFullYear()} ViralPX — {c.rights}
        </span>
      </footer>

      <style>{`
        .lp { --o: ${ORANGE}; background: #0A0A0A; color: #fff; overflow-x: hidden;
          font-family: var(--font-cairo), system-ui, sans-serif; }
        .lp a { text-decoration: none; color: inherit; }
        .lp-nav { position: sticky; top: 0; z-index: 20; display: flex; align-items: center;
          justify-content: space-between; gap: 16px; padding: 16px 24px;
          background: rgba(10,10,10,0.72); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06); }
        .lp-logo { font-family: var(--font-montserrat), sans-serif; font-weight: 900; font-size: 22px; letter-spacing: -.5px; }
        .lp-logo span { color: var(--o); }
        .lp-nav-links { display: flex; gap: 22px; font-size: 15px; }
        .lp-nav-links a { color: #bdbdbd; }
        .lp-nav-links a:hover { color: #fff; }
        .lp-nav-actions { display: flex; align-items: center; gap: 10px; }
        .lp-lang { font-size: 13px; color: #bdbdbd; border: 1px solid rgba(255,255,255,0.14);
          border-radius: 8px; padding: 6px 10px; }
        .lp-lang:hover { color: #fff; border-color: var(--o); }
        .lp-btn { display: inline-block; border-radius: 12px; padding: 11px 20px; font-weight: 700;
          font-size: 15px; cursor: pointer; transition: transform .12s, filter .12s, background .2s; }
        .lp-btn:hover { transform: translateY(-1px); }
        .lp-btn-primary { background: var(--o); color: #fff; }
        .lp-btn-primary:hover { filter: brightness(1.08); }
        .lp-btn-ghost { border: 1px solid rgba(255,255,255,0.18); color: #fff; }
        .lp-btn-ghost:hover { border-color: var(--o); color: var(--o); }
        .lp-btn-lg { padding: 15px 34px; font-size: 17px; }

        .lp-hero { position: relative; text-align: center; padding: 100px 24px 90px; max-width: 860px; margin: 0 auto; }
        .lp-hero-glow { position: absolute; inset: -10% 20% auto; height: 340px; z-index: 0;
          background: radial-gradient(closest-side, rgba(249,115,22,0.28), transparent 70%); filter: blur(10px); }
        .lp-eyebrow, .lp-h1, .lp-lead, .lp-hero-btns { position: relative; z-index: 1; }
        .lp-eyebrow { display: inline-block; font-size: 13px; letter-spacing: 1px; color: var(--o);
          background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.3); padding: 6px 14px; border-radius: 999px; }
        .lp-h1 { font-size: clamp(38px, 8vw, 68px); line-height: 1.08; margin: 22px 0 0; font-weight: 900;
          font-family: var(--font-montserrat), var(--font-cairo), sans-serif; }
        .lp-accent { color: var(--o); }
        .lp-lead { font-size: clamp(16px, 2.6vw, 20px); color: #b8b8b8; max-width: 620px; margin: 20px auto 0; line-height: 1.7; }
        .lp-hero-btns { display: flex; gap: 12px; justify-content: center; margin-top: 34px; flex-wrap: wrap; }

        .lp-sec { max-width: 1080px; margin: 0 auto; padding: 64px 24px; }
        .lp-h2 { text-align: center; font-size: clamp(26px, 5vw, 40px); font-weight: 900; margin: 0 0 44px;
          font-family: var(--font-montserrat), var(--font-cairo), sans-serif; }
        .lp-grid { display: grid; gap: 20px; }
        .lp-grid-3 { grid-template-columns: repeat(3, 1fr); }
        .lp-grid-2 { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 820px) { .lp-grid-3 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .lp-grid-3, .lp-grid-2 { grid-template-columns: 1fr; } }

        .lp-card { background: #121212; border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 26px; transition: border-color .2s, transform .2s; }
        .lp-card:hover { border-color: rgba(249,115,22,0.4); transform: translateY(-3px); }
        .lp-card-icon { font-size: 30px; }
        .lp-card h3 { margin: 14px 0 8px; font-size: 19px; }
        .lp-card p, .lp-step p { color: #a5a5a5; line-height: 1.7; margin: 0; font-size: 15px; }

        .lp-step { text-align: center; padding: 10px; }
        .lp-step-n { width: 52px; height: 52px; margin: 0 auto 14px; border-radius: 50%;
          display: grid; place-items: center; font-weight: 900; font-size: 22px; color: var(--o);
          background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.35); }
        .lp-step h3 { margin: 0 0 8px; font-size: 19px; }

        .lp-empty { text-align: center; color: #888; }
        .lp-tenant { display: flex; align-items: center; gap: 14px; background: #121212;
          border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 18px; transition: border-color .2s, transform .2s; }
        .lp-tenant:hover { border-color: rgba(249,115,22,0.4); transform: translateY(-3px); }
        .lp-tenant-badge { width: 46px; height: 46px; border-radius: 12px; flex: 0 0 auto;
          display: grid; place-items: center; font-weight: 900; font-size: 20px; color: #fff;
          background: linear-gradient(135deg, var(--o), #b45309); }
        .lp-tenant-body { display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0; }
        .lp-tenant-body strong { font-size: 16px; }
        .lp-tenant-body span { color: #888; font-size: 13px; }
        .lp-tenant-go { color: var(--o); font-size: 13px; font-weight: 700; white-space: nowrap; }

        .lp-pricing { max-width: 760px; margin: 0 auto; }
        .lp-plan { background: #121212; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 30px; }
        .lp-plan-hi { border-color: var(--o); box-shadow: 0 0 0 1px var(--o), 0 20px 60px -30px rgba(249,115,22,0.6); }
        .lp-plan-name { font-weight: 800; color: var(--o); letter-spacing: .5px; }
        .lp-plan-price { display: flex; align-items: baseline; gap: 8px; margin: 12px 0 20px; }
        .lp-plan-price span { font-size: 48px; font-weight: 900; }
        .lp-plan-price small { color: #888; font-size: 15px; }
        .lp-plan ul { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 12px; }
        .lp-plan li { color: #cfcfcf; font-size: 15px; }
        .lp-plan .lp-btn { width: 100%; text-align: center; }

        .lp-faq { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
        .lp-faq-item { background: #121212; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 4px 20px; }
        .lp-faq-item summary { cursor: pointer; padding: 16px 0; font-weight: 700; font-size: 16px; list-style: none; }
        .lp-faq-item summary::-webkit-details-marker { display: none; }
        .lp-faq-item summary::after { content: '+'; float: inline-end; color: var(--o); font-size: 22px; }
        .lp-faq-item[open] summary::after { content: '–'; }
        .lp-faq-item p { color: #a5a5a5; line-height: 1.75; margin: 0 0 16px; }

        .lp-cta { padding: 24px; }
        .lp-cta-inner { max-width: 900px; margin: 0 auto; text-align: center; border-radius: 28px; padding: 64px 24px;
          background: radial-gradient(120% 120% at 50% 0%, rgba(249,115,22,0.18), transparent 60%), #121212;
          border: 1px solid rgba(249,115,22,0.25); }
        .lp-cta-inner p { color: #b8b8b8; margin: 0 0 26px; font-size: 17px; }
        .lp-cta-inner .lp-h2 { margin-bottom: 14px; }

        .lp-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          max-width: 1080px; margin: 0 auto; padding: 30px 24px 50px; color: #888; font-size: 14px;
          border-top: 1px solid rgba(255,255,255,0.06); }

        @media (max-width: 720px) { .lp-nav-links { display: none; } }
      `}</style>
    </div>
  )
}
