import StudioShell from '@/components/studio/StudioShell'
import { buildStudioData } from '@/lib/studio-data'
import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPortfolio } from '@/lib/portfolio'
import TestimonialForm from '@/components/portfolio/TestimonialForm'
import { langQuery, pageLocale } from '@/lib/seo'

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
    photoLabel: 'ضيف صورتك',
    photoHint: 'اختياري — صورة الوجه بتخلي الرأي أقرب',
    photoChange: 'غيّر الصورة',
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
    photoLabel: 'Add your photo',
    photoHint: 'Optional — a face makes a review land',
    photoChange: 'Change photo',
    submit: 'Submit',
    sending: 'Sending…',
    success: 'Thanks! Your review will appear after moderation.',
    error: 'Something went wrong, please try again.',
  },
}

export default async function TestimonialPage({ params, searchParams }: Params) {
  const { username } = await params
  const { lang } = (await searchParams) ?? {}
  const locale = await pageLocale(lang)
  const data = await getPortfolio(username, locale)
  if (!data || (data.tenant as { suspended?: boolean }).suspended) notFound()

  const { tenant, settings } = data
  const name = settings?.content?.hero?.name || tenant.name
  const d = buildStudioData(data, locale, await langQuery(locale))
  const c = COPY[locale]

  return (
    <StudioShell d={d} base={d.homeHref} langHref={`?lang=${locale === 'en' ? 'ar' : 'en'}`}>
      <section className="tf-wrap st-shell st-section">
        <a className="tf-back" href={`/${tenant.slug}${await langQuery(locale)}`}>
          ← {name}
        </a>
        <h1 className="tf-heading">{c.heading}</h1>
        <p className="tf-subhead">{c.sub}</p>
        <TestimonialForm username={tenant.slug} t={c} />
      </section>

    </StudioShell>
  )
}
