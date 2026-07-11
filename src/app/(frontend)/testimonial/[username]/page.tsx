import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPortfolio, tenantCssVars } from '@/lib/portfolio'
import TestimonialForm from '@/components/portfolio/TestimonialForm'

export const dynamic = 'force-dynamic'

type Params = {
  params: Promise<{ username: string }>
  searchParams?: Promise<{ lang?: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params
  const data = await getPortfolio(username)
  if (!data) return { title: 'Not found' }
  const name = data.settings?.content?.hero?.name || data.tenant.name
  return {
    title: `أضف رأيك — ${name}`,
    robots: { index: false },
  }
}

const COPY = {
  ar: {
    heading: 'شارك رأيك',
    sub: 'رأيك بيتراجع قبل النشر. شكراً لوقتك 🙏',
    title: 'رأيك',
    namePh: 'اسمك',
    rolePh: 'المسمى الوظيفي (اختياري)',
    companyPh: 'الشركة (اختياري)',
    contentPh: 'اكتب رأيك هنا…',
    ratingLabel: 'تقييمك',
    submit: 'إرسال',
    sending: 'جارٍ الإرسال…',
    success: 'تم استلام رأيك! هيظهر بعد المراجعة.',
    error: 'حصل خطأ، حاول تاني.',
  },
  en: {
    heading: 'Share your feedback',
    sub: 'Your review is moderated before it appears. Thanks for your time 🙏',
    title: 'Your review',
    namePh: 'Your name',
    rolePh: 'Role (optional)',
    companyPh: 'Company (optional)',
    contentPh: 'Write your review here…',
    ratingLabel: 'Your rating',
    submit: 'Submit',
    sending: 'Sending…',
    success: 'Thanks! Your review will appear after moderation.',
    error: 'Something went wrong, please try again.',
  },
}

export default async function TestimonialPage({ params, searchParams }: Params) {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  const locale: 'ar' | 'en' = lang === 'ar' ? 'ar' : 'en'
  const data = await getPortfolio(username, locale)
  if (!data) notFound()

  const { tenant, settings } = data
  const name = settings?.content?.hero?.name || tenant.name
  const cssVars = tenantCssVars(settings) as React.CSSProperties
  const c = COPY[locale]

  return (
    <div
      style={{ ...cssVars, minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}
      dir={locale === 'en' ? 'ltr' : 'rtl'}
      lang={locale}
    >
      <main className="tf-wrap">
        <a className="tf-back" href={`/${tenant.slug}${locale === 'en' ? '?lang=en' : ''}`}>
          ← {name}
        </a>
        <h1 className="tf-heading">{c.heading}</h1>
        <p className="tf-subhead">{c.sub}</p>
        <TestimonialForm username={tenant.slug} t={c} />
      </main>

      <style>{`
        .tf-wrap { max-width: 560px; margin: 0 auto; padding: 56px 20px 80px; }
        .tf-back { display: inline-block; color: var(--sub); text-decoration: none; font-size: 14px; margin-bottom: 28px; }
        .tf-back:hover { color: var(--accent); }
        .tf-heading { font-size: clamp(26px, 6vw, 38px); margin: 0 0 8px; }
        .tf-subhead { color: var(--sub); margin: 0 0 28px; }
        .tf { display: flex; flex-direction: column; gap: 14px; }
        .tf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 460px) { .tf-row { grid-template-columns: 1fr; } }
        .tf-in {
          width: 100%; background: var(--bg-2); border: 1px solid rgba(255,255,255,0.08);
          color: var(--text); border-radius: 12px; padding: 13px 15px; font: inherit; outline: none;
        }
        .tf-in:focus { border-color: var(--accent); }
        .tf-in::placeholder { color: var(--sub); }
        textarea.tf-in { resize: vertical; }
        .tf-stars { display: flex; align-items: center; gap: 4px; margin: 2px 0; }
        .tf-stars-label { color: var(--sub); font-size: 14px; margin-inline-end: 8px; }
        .tf-star { background: none; border: none; cursor: pointer; font-size: 26px; line-height: 1; padding: 0 2px; transition: transform .1s; }
        .tf-star:hover { transform: scale(1.15); }
        .tf-err { color: #ef4444; font-size: 14px; margin: 0; }
        .tf-btn {
          background: var(--accent); color: #fff; border: none; border-radius: 12px;
          padding: 14px; font: inherit; font-weight: 700; cursor: pointer; margin-top: 4px;
        }
        .tf-btn:hover { filter: brightness(1.08); }
        .tf-btn:disabled { opacity: .6; cursor: default; }
        .tf-done { text-align: center; padding: 40px 0; }
        .tf-done p { color: var(--text); font-size: 18px; }
      `}</style>
    </div>
  )
}
