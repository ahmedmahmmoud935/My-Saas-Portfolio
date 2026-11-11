'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { safeHref } from '@/lib/safe-url'
import { useDashLang } from './DashLang'

/**
 * "Beyond the image": the digital products — a landing page, a dashboard, a
 * tool — each a card with a picture, a tag, what it is, details that open on
 * the card, and a button to the live product.
 *
 * Bilingual on the words and shared on the picture and the link, ordered by
 * hand like the team beside it.
 */
export type ProductItem = {
  id?: number
  titleAr: string
  titleEn: string
  tagAr: string
  tagEn: string
  descAr: string
  descEn: string
  detailsAr: string
  detailsEn: string
  btnAr: string
  btnEn: string
  detailsLabelAr: string
  detailsLabelEn: string
  /** image | site | landing | chart — how the studio template draws the card. */
  preview: string
  mockBrand: string
  mockTaglineAr: string
  mockTaglineEn: string
  mockHeadlineAr: string
  mockHeadlineEn: string
  mockCtaAr: string
  mockCtaEn: string
  url: string
  imageId: number | null
  imageUrl: string | null
  /** The live site's own share picture, used when none is uploaded. */
  previewUrl?: string | null
  /** Shown on the large card. */
  featured?: boolean
  sortOrder: number
}

const blank: ProductItem = {
  titleAr: '',
  titleEn: '',
  tagAr: '',
  tagEn: '',
  descAr: '',
  descEn: '',
  detailsAr: '',
  detailsEn: '',
  btnAr: '',
  btnEn: '',
  detailsLabelAr: '',
  detailsLabelEn: '',
  preview: 'image',
  mockBrand: '',
  mockTaglineAr: '',
  mockTaglineEn: '',
  mockHeadlineAr: '',
  mockHeadlineEn: '',
  mockCtaAr: '',
  mockCtaEn: '',
  url: '',
  imageId: null,
  imageUrl: null,
  sortOrder: 0,
}

/** "example.com" typed without its scheme still leads somewhere. */
function normaliseUrl(v: string): string {
  const u = v.trim()
  if (!u) return ''
  return /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`
}

export default function ProductsManager({ items }: { items: ProductItem[] }) {
  const router = useRouter()
  const { t } = useDashLang()
  const [edit, setEdit] = useState<ProductItem | null>(null)
  const [busy, setBusy] = useState(false)

  const set = (p: Partial<ProductItem>) => edit && setEdit({ ...edit, ...p })

  async function save() {
    if (!edit) return
    if (!edit.titleAr.trim() && !edit.titleEn.trim()) {
      alert(t('اكتب اسم المنتج على الأقل', 'A name, at least'))
      return
    }
    const url = normaliseUrl(edit.url)
    if (url && safeHref(url, '') === '') {
      alert(t('الرابط مش مكتوب صح — اكتبه زي https://example.com', 'That link is not valid — write it like https://example.com'))
      return
    }
    setBusy(true)
    try {
      const ar = await saveDoc(
        'products',
        edit.id,
        {
          title: edit.titleAr || edit.titleEn,
          tag: edit.tagAr,
          description: edit.descAr,
          details: edit.detailsAr,
          btnLabel: edit.btnAr,
          detailsLabel: edit.detailsLabelAr,
          preview: edit.preview || 'image',
          mockBrand: edit.mockBrand,
          mockTagline: edit.mockTaglineAr,
          mockHeadline: edit.mockHeadlineAr,
          mockCta: edit.mockCtaAr,
          url,
          image: edit.imageId,
          sortOrder: edit.sortOrder,
        },
        'ar',
      )
      const id = edit.id ?? (ar as { id?: number })?.id
      if (id) {
        await saveDoc(
          'products',
          id,
          {
            title: edit.titleEn || edit.titleAr,
            tag: edit.tagEn,
            description: edit.descEn,
            details: edit.detailsEn,
            btnLabel: edit.btnEn,
            detailsLabel: edit.detailsLabelEn,
            mockTagline: edit.mockTaglineEn,
            mockHeadline: edit.mockHeadlineEn,
            mockCta: edit.mockCtaEn,
          },
          'en',
        )
      }
      setEdit(null)
      router.refresh()
    } catch {
      alert(t('مش قادر أحفظ — جرّب تاني', 'Could not save — try again'))
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (!confirm(t('حذف الكارت ده؟', 'Delete this card?'))) return
    await deleteDoc('products', id)
    router.refresh()
  }

  /** The one product on the large card: marking one unmarks the other. */
  async function feature(m: ProductItem) {
    if (busy || !m.id) return
    setBusy(true)
    const on = !m.featured
    await Promise.all([
      saveDoc('products', m.id, { featured: on }, 'ar'),
      ...(on ? items.filter((o) => o.featured && o.id && o.id !== m.id).map((o) => saveDoc('products', o.id!, { featured: false }, 'ar')) : []),
    ])
    setBusy(false)
    router.refresh()
  }

  /** Swapping two neighbours' order, and saving only those two. */
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (busy || j < 0 || j >= items.length) return
    setBusy(true)
    const a = items[i]
    const b = items[j]
    await Promise.all([
      saveDoc('products', a.id, { sortOrder: j }, 'ar'),
      saveDoc('products', b.id, { sortOrder: i }, 'ar'),
    ])
    setBusy(false)
    router.refresh()
  }

  const pair = (
    label: string,
    ar: string,
    en: string,
    onAr: (v: string) => void,
    onEn: (v: string) => void,
    opts?: { rows?: number; phAr?: string; phEn?: string },
  ) => (
    <>
      <label className="lbl" style={{ marginTop: 12, display: 'block' }}>{label}</label>
      <div className="grid-2">
        {opts?.rows ? (
          <>
            <textarea className="field" rows={opts.rows} placeholder={opts.phAr || t('عربي', 'Arabic')} value={ar} onChange={(e) => onAr(e.target.value)} />
            <textarea className="field" rows={opts.rows} dir="ltr" style={{ textAlign: 'start' }} placeholder={opts.phEn || 'English'} value={en} onChange={(e) => onEn(e.target.value)} />
          </>
        ) : (
          <>
            <input className="field" placeholder={opts?.phAr || t('عربي', 'Arabic')} value={ar} onChange={(e) => onAr(e.target.value)} />
            <input className="field" dir="ltr" style={{ textAlign: 'start' }} placeholder={opts?.phEn || 'English'} value={en} onChange={(e) => onEn(e.target.value)} />
          </>
        )}
      </div>
    </>
  )

  return (
    <div>
      <PageHeader
        icon="🧩"
        title={t('أبعد من الصورة', 'Beyond the image')}
        subtitle={t(
          'منتجاتك الرقمية — صفحات هبوط، لوحات تحكم، أدوات — كل واحدة في كارت فيه صورة وزرار بيفتح الموقع بتاعها',
          'Your digital products — landing pages, dashboards, tools — each a card with a picture and a button to the live site',
        )}
        actions={
          <button className="btn btn-primary" onClick={() => setEdit({ ...blank, sortOrder: items.length })}>
            + {t('منتج جديد', 'Add a product')}
          </button>
        }
      />

      {items.length === 0 && (
        <div className="panel" style={{ color: 'var(--sub)' }}>
          {t(
            'لسه مفيش منتجات. القسم ده مش بيظهر على الموقع غير لما تضيف أول كارت. عنوان القسم والسطر اللي تحته بيتعدّلوا من «النصوص» ← «أبعد من الصورة».',
            'No products yet. The section stays off the site until the first card is added. Its heading and the line under it are edited in Texts → Beyond the image.',
          )}
        </div>
      )}

      <div className="proj-manage-grid" style={{ gridTemplateColumns: '1fr' }}>
        {items.map((m, i) => (
          <div className="panel" key={m.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div className="team-thumb" style={{ borderRadius: 10, width: 72 }}>
                {m.imageUrl || m.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(m.imageUrl || m.previewUrl)!} alt="" />
                ) : (
                  <span>🧩</span>
                )}
              </div>
              <div style={{ flex: '1 1 200px', textAlign: 'start', minWidth: 0 }}>
                <strong>{m.titleAr || m.titleEn}</strong>
                {(m.featured || (!items.some((o) => o.featured) && i === 0)) && (
                  <span className="pill" style={{ marginInlineStart: 8, fontSize: 12 }}>
                    {t('⭐ المعروض بالكبير', '⭐ Shown large')}
                  </span>
                )}
                <div style={{ color: 'var(--sub)', fontSize: 13 }}>
                  {[m.tagAr || m.tagEn, m.url ? m.url.replace(/^https?:\/\//, '') : t('من غير رابط', 'No link')].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, -1)}>▲</button>
                <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, 1)}>▼</button>
              </div>
              <button className={`btn ${m.featured ? 'btn-primary' : 'btn-ghost'}`} disabled={busy} onClick={() => feature(m)} title={t('يظهر بالعرض الكبير والباقي أصغر تحته', 'Shown on the large card, the rest smaller below')}>
                {m.featured ? t('⭐ إلغاء العرض الكبير', '⭐ Unfeature') : t('☆ اعرضه بالكبير', '☆ Show large')}
              </button>
              <button className="btn btn-ghost" onClick={() => setEdit(m)}>
                {t('تعديل', 'Edit')}
              </button>
              <button className="btn btn-danger" onClick={() => m.id && remove(m.id)}>
                {t('🗑 حذف', '🗑 Delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <div className="modal-overlay" onClick={() => setEdit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <button className="icon-btn" onClick={() => setEdit(null)}>✕</button>
              <strong>{edit.id ? t('تعديل منتج', 'Edit product') : t('منتج جديد', 'Add a product')}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">{t('صورة المنتج', 'Picture of the product')}</label>
              <MediaUploader
                big
                accept="image/*"
                previewUrl={edit.imageUrl}
                label={t('صورة', 'Image')}
                onUploaded={(m) => set({ imageId: m.id, imageUrl: m.url ?? m.thumbUrl ?? null })}
                onRemove={edit.imageUrl ? () => set({ imageId: null, imageUrl: null }) : undefined}
              />
              <p style={{ color: 'var(--sub)', fontSize: 12.5, margin: '6px 0 0' }}>
                {t(
                  'صورة أفقية لشاشة المنتج بتظهر أحسن. لو ماعرفتش ترفع صورة، الكارت بياخد صورة الموقع نفسه من الرابط (اللي بتظهر لما اللينك يتبعت على واتساب).',
                  'A landscape screenshot works best. With none uploaded, the card uses the site’s own picture from the link — the one shown when it is shared on WhatsApp.',
                )}
              </p>

              {pair(t('اسم المنتج', 'Product name'), edit.titleAr, edit.titleEn, (v) => set({ titleAr: v }), (v) => set({ titleEn: v }))}
              {pair(t('النوع (الشارة الصغيرة)', 'Type (the small tag)'), edit.tagAr, edit.tagEn, (v) => set({ tagAr: v }), (v) => set({ tagEn: v }), {
                phAr: t('مثلاً: تصميم صفحة هبوط', 'e.g. Landing page'),
                phEn: 'e.g. Landing page',
              })}
              {pair(t('الوصف', 'Description'), edit.descAr, edit.descEn, (v) => set({ descAr: v }), (v) => set({ descEn: v }), { rows: 3 })}
              {pair(t('التفاصيل (بتفتح لما الزائر يدوس «التفاصيل»)', 'Details (open when the visitor presses “Details”)'), edit.detailsAr, edit.detailsEn, (v) => set({ detailsAr: v }), (v) => set({ detailsEn: v }), { rows: 4 })}

              <label className="lbl" style={{ marginTop: 12, display: 'block' }}>{t('رابط الموقع', 'Link to the live product')}</label>
              <input className="field" dir="ltr" style={{ textAlign: 'start' }} placeholder="https://" value={edit.url} onChange={(e) => set({ url: e.target.value })} />
              <p style={{ color: 'var(--sub)', fontSize: 12.5, margin: '6px 0 0' }}>
                {t('لو سبته فاضي، الكارت بيظهر من غير زرار.', 'Leave it empty and the card shows no button.')}
              </p>

              {pair(t('نص الزرار', 'Button text'), edit.btnAr, edit.btnEn, (v) => set({ btnAr: v }), (v) => set({ btnEn: v }), {
                phAr: t('افتراضي: زور الموقع', 'Default: زور الموقع'),
                phEn: 'Default: Visit the site',
              })}
              {pair(t('اسم زرار التفاصيل', '“Details” button name'), edit.detailsLabelAr, edit.detailsLabelEn, (v) => set({ detailsLabelAr: v }), (v) => set({ detailsLabelEn: v }), {
                phAr: t('افتراضي: التفاصيل', 'Default: التفاصيل'),
                phEn: 'Default: Details',
              })}

            </div>
            <div className="modal-foot">
              <button className="btn btn-primary" onClick={save} disabled={busy}>
                {busy ? '…' : t('💾 حفظ', '💾 Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
