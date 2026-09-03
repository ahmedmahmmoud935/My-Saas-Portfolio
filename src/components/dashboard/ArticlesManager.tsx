'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { useDashLang } from './DashLang'

type Item = {
  id?: number
  title: string
  slug: string
  excerpt: string
  contentHtml: string
  tags: string
  published: boolean
  readMin: number
  coverId: number | null
  coverUrl: string | null
  /** What a results page shows, when it should differ from the article. */
  seoTitle: string
  seoDescription: string
  noindex: boolean
  nofollow: boolean
}

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')

export default function ArticlesManager({ items }: { items: Item[] }) {
  const router = useRouter()
  const [edit, setEdit] = useState<Item | null>(null)
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!edit) return
    setBusy(true)
    await saveDoc('articles', edit.id, {
      title: edit.title,
      slug: edit.slug || slugify(edit.title),
      excerpt: edit.excerpt,
      cover: edit.coverId,
      mode: 'html',
      contentHtml: edit.contentHtml,
      tags: edit.tags.split(',').map((x) => x.trim()).filter(Boolean).map((tag) => ({ tag })),
      published: edit.published,
      readMin: edit.readMin,
      seo: {
        title: edit.seoTitle,
        description: edit.seoDescription,
        noindex: edit.noindex,
        nofollow: edit.nofollow,
      },
    })
    setBusy(false)
    setEdit(null)
    router.refresh()
  }
  async function remove(id: number) {
    if (!confirm(t('حذف المقال؟', 'Delete this article?'))) return
    await deleteDoc('articles', id)
    router.refresh()
  }

  const blank: Item = { title: '', slug: '', excerpt: '', contentHtml: '', tags: '', published: false, readMin: 3, coverId: null, coverUrl: null, seoTitle: '', seoDescription: '', noindex: false, nofollow: false }

  return (
    <div>
      <PageHeader
        icon="📖"
        title={t('المقالات', 'Articles')}
        subtitle={t('مدوّنتك — كل مقال صفحة تساعد على SEO', 'Your blog — each article is an SEO-friendly page')}
        actions={<button className="btn btn-primary" onClick={() => setEdit(blank)}>+ {t('مقال جديد', 'New article')}</button>}
      />

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 46, color: 'var(--sub)' }}>{t('لا توجد مقالات بعد.', 'No articles yet.')}</div>
      ) : (
        <div className="proj-manage-grid">
          {items.map((a) => (
            <div className="proj-manage-card" key={a.id}>
              <div className="pm-cover">
                {a.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverUrl} alt={a.title} />
                ) : <span style={{ color: 'var(--sub)' }}>📖</span>}
              </div>
              <div className="pm-body">
                <strong>{a.title}</strong>
                <span>{a.published ? t('منشور', 'Published') : t('مسودّة', 'Draft')} · {a.readMin} {t('د', 'min')}</span>
              </div>
              <div className="pm-actions">
                <button className="icon-btn" onClick={() => setEdit(a)}>✏️</button>
                <button className="icon-btn del" onClick={() => remove(a.id!)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <div className="modal-overlay" onClick={() => setEdit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <button className="icon-btn" onClick={() => setEdit(null)}>✕</button>
              <strong>{edit.id ? t('تعديل مقال', 'Edit article') : t('مقال جديد', 'New article')}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">{t('العنوان', 'Title')}</label>
              <input className="field" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value, slug: edit.slug || slugify(e.target.value) })} />
              <label className="lbl">{t('الـ slug', 'Slug')}</label>
              <input className="field" dir="ltr" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} style={{ textAlign: 'start' }} />
              <p className="lbl" style={{ opacity: 0.7, marginTop: 4 }}>
                {t(
                  'الرابط والنشر لكل لغة على حدة — بدّل لغة اللوحة عشان تظبط النسخة التانية.',
                  'The address and the publish switch belong to this language — switch the dashboard language to set the other.',
                )}
              </p>
              <label className="lbl">{t('المقتطف', 'Excerpt')}</label>
              <textarea className="field" rows={2} value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} />
              <label className="lbl">{t('الغلاف', 'Cover')}</label>
              <MediaUploader compact previewUrl={edit.coverUrl} onUploaded={(m) => setEdit({ ...edit, coverId: m.id, coverUrl: m.thumbUrl })} />
              <label className="lbl">{t('المحتوى (HTML)', 'Content (HTML)')}</label>
              <textarea className="field" rows={8} dir="ltr" value={edit.contentHtml} onChange={(e) => setEdit({ ...edit, contentHtml: e.target.value })} style={{ textAlign: 'start', fontFamily: 'monospace' }} />
              <label className="lbl">{t('الوسوم (مفصولة بفاصلة)', 'Tags (comma separated)')}</label>
              <input className="field" value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} />
              <div className="grid-2">
                <div>
                  <label className="lbl">{t('دقائق القراءة', 'Read minutes')}</label>
                  <input className="field" type="number" value={edit.readMin} onChange={(e) => setEdit({ ...edit, readMin: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="lbl">{t('الحالة', 'Status')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 13 }}>{edit.published ? t('منشور', 'Published') : t('مسودّة', 'Draft')}</span>
                    <div className={`toggle ${edit.published ? 'on' : ''}`} role="switch" aria-checked={edit.published} onClick={() => setEdit({ ...edit, published: !edit.published })} />
                  </div>
                </div>
              </div>

              {/* ── SEO ────────────────────────────────────────────────────
                  The headline you write for a reader and the line Google
                  shows are rarely the same sentence, and there was nowhere
                  to say so. Empty falls back to the article's own title and
                  excerpt, which is what happened before these existed. */}
              <div className="de-group" style={{ marginTop: 18 }}>
                <div className="de-group-title">{t('محركات البحث', 'Search engines')}</div>

                <label className="lbl">{t('عنوان جوجل', 'Meta title')}</label>
                <input
                  className="field"
                  value={edit.seoTitle}
                  placeholder={edit.title || t('نفس عنوان المقال', 'Same as the article title')}
                  onChange={(e) => setEdit({ ...edit, seoTitle: e.target.value })}
                />
                <div className="lbl" style={{ opacity: 0.7 }}>
                  {(edit.seoTitle || edit.title).length} {t('حرف — الأفضل تحت ٦٠', 'characters — under 60 reads best')}
                </div>

                <label className="lbl" style={{ marginTop: 10, display: 'block' }}>
                  {t('وصف جوجل', 'Meta description')}
                </label>
                <textarea
                  className="field"
                  rows={2}
                  value={edit.seoDescription}
                  placeholder={edit.excerpt || t('نفس مقتطف المقال', 'Same as the excerpt')}
                  onChange={(e) => setEdit({ ...edit, seoDescription: e.target.value })}
                />
                <div className="lbl" style={{ opacity: 0.7 }}>
                  {(edit.seoDescription || edit.excerpt).length}{' '}
                  {t('حرف — الأفضل بين ١٢٠ و١٦٠', 'characters — 120 to 160 reads best')}
                </div>

                {/* What the result actually looks like, before publishing. */}
                <div className="serp" dir="auto">
                  <div className="serp-url">viralpx.com › {edit.slug || slugify(edit.title) || '…'}</div>
                  <div className="serp-title">{edit.seoTitle || edit.title || t('عنوان المقال', 'Article title')}</div>
                  <div className="serp-desc">
                    {edit.seoDescription || edit.excerpt || t('وصف المقال يظهر هنا.', 'The description appears here.')}
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: 12 }}>
                  <label className="seo-check">
                    <input
                      type="checkbox"
                      checked={edit.noindex}
                      onChange={(e) => setEdit({ ...edit, noindex: e.target.checked })}
                    />
                    <span>{t('امنع الفهرسة (noindex)', 'Hide from search (noindex)')}</span>
                  </label>
                  <label className="seo-check">
                    <input
                      type="checkbox"
                      checked={edit.nofollow}
                      onChange={(e) => setEdit({ ...edit, nofollow: e.target.checked })}
                    />
                    <span>{t('لا تتبع الروابط (nofollow)', "Don't follow links (nofollow)")}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>{t('إلغاء', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={save} disabled={busy || !edit.title.trim()}>{busy ? '…' : t('💾 حفظ', '💾 Save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
