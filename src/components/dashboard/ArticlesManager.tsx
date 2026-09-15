'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveDoc, deleteDoc } from '@/lib/collection-actions'
import { useDashLang } from './DashLang'
import SeoPanel from './SeoPanel'
import { isLive, isScheduled } from '@/lib/publish'
import { readingMinutes } from '@/lib/reading-time'

type Item = {
  id?: number
  title: string
  slug: string
  excerpt: string
  contentHtml: string
  tags: string
  published: boolean
  /** The hour it goes live by itself, when one has been set. */
  publishAt: string | null
  coverId: number | null
  coverUrl: string | null
  /** What a results page shows, when it should differ from the article. */
  seoTitle: string
  seoDescription: string
  keyphrase: string
  noindex: boolean
  nofollow: boolean
}

/**
 * A label with the length beside it: "٤٥ / ٦٠", green while it fits and amber
 * once it is over. It used to be a sentence under the field — a whole line
 * spent saying what two numbers say.
 */
const Counted = ({ label, n, max }: { label: string; n: number; max: number }) => (
  <div className="lbl-row">
    <label className="lbl">{label}</label>
    <span className={`lbl-count ${n > max ? 'over' : n > 0 ? 'ok' : ''}`}>
      {n} / {max}
    </span>
  </div>
)

/** The line under a label that says what the field is actually for. */
const Hint = ({ children }: { children: React.ReactNode }) => (
  <p className="fld-hint">{children}</p>
)

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')

/** An ISO moment as the value a datetime-local input wants (local clock). */
function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** And back — the input speaks the author's clock, the database speaks UTC. */
function fromLocalInput(v: string): string | null {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const whenText = (iso: string | null, lang: 'ar' | 'en') =>
  iso
    ? new Date(iso).toLocaleString(lang === 'en' ? 'en-GB' : 'ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : ''

/**
 * The author's own HTML, with anything that would run stripped out.
 *
 * The preview renders it inside the dashboard, where a stray <script> pasted
 * along with the text would run against the session rather than in a page of
 * its own. The article itself is untouched; this is only what is shown here.
 */
function safePreview(html: string): string {
  return html
    .replace(/<(script|iframe|object|embed)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

export default function ArticlesManager({
  items,
  collection = 'articles',
  title,
  subtitle,
}: {
  items: Item[]
  /** 'articles' for a client's blog, 'posts' for the platform's own. */
  collection?: 'articles' | 'posts'
  title?: string
  subtitle?: string
}) {
  const router = useRouter()
  const [edit, setEdit] = useState<Item | null>(null)
  const { t, lang } = useDashLang()
  const [busy, setBusy] = useState(false)
  /* Writing and reading are two different things to be looking at, and the
     editor has room for one of them at a time. */
  const [tab, setTab] = useState<'write' | 'read'>('write')

  async function save() {
    if (!edit) return
    setBusy(true)
    await saveDoc(collection, edit.id, {
      title: edit.title,
      slug: edit.slug || slugify(edit.title),
      excerpt: edit.excerpt,
      cover: edit.coverId,
      mode: 'html',
      contentHtml: edit.contentHtml,
      tags: edit.tags.split(',').map((x) => x.trim()).filter(Boolean).map((tag) => ({ tag })),
      published: edit.published,
      publishAt: edit.publishAt,
      seo: {
        keyphrase: edit.keyphrase,
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
    await deleteDoc(collection, id)
    router.refresh()
  }

  const blank: Item = { title: '', slug: '', excerpt: '', contentHtml: '', tags: '', published: false, publishAt: null, coverId: null, coverUrl: null, seoTitle: '', seoDescription: '', keyphrase: '', noindex: false, nofollow: false }

  const live = !!edit && isLive(edit.published, edit.publishAt)
  const waiting = !!edit && isScheduled(edit.published, edit.publishAt)
  const minutes = edit ? readingMinutes(edit.contentHtml, lang) : 0

  return (
    <div>
      {/* Writing an article is not a decision taken in a dialog on top of
          something else — it is the work. The editor was a modal over the list,
          which is why it felt cramped and temporary; it takes the page now, and
          the list waits underneath it. */}
      {!edit && (
        <PageHeader
          icon="📖"
          title={title ?? t('المقالات', 'Articles')}
          subtitle={subtitle ?? t('مدوّنتك — كل مقال صفحة تساعد على SEO', 'Your blog — each article is an SEO-friendly page')}
          actions={<button className="btn btn-primary" onClick={() => { setTab('write'); setEdit(blank) }}>+ {t('مقال جديد', 'New article')}</button>}
        />
      )}

      {edit ? null : items.length === 0 ? (
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
                <span>
                  {isLive(a.published, a.publishAt)
                    ? t('منشور', 'Published')
                    : isScheduled(a.published, a.publishAt)
                      ? `${t('مجدول', 'Scheduled')} · ${whenText(a.publishAt, lang)}`
                      : t('مسودّة', 'Draft')}
                  {' · '}
                  {readingMinutes(a.contentHtml, lang)} {t('د', 'min')}
                </span>
              </div>
              <div className="pm-actions">
                <button className="icon-btn" onClick={() => { setTab('write'); setEdit(a) }}>✏️</button>
                <button className="icon-btn del" onClick={() => remove(a.id!)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {edit && (
        <div className="editor-page editor-wide">
          <div className="editor-bar">
            <button className="btn btn-ghost" onClick={() => setEdit(null)}>
              {t('رجوع', 'Back')}
            </button>
            <strong>{edit.id ? t('تعديل مقال', 'Edit article') : t('مقال جديد', 'New article')}</strong>
            <button className="btn btn-primary" onClick={save} disabled={busy || !edit.title.trim()}>
              {busy ? '…' : t('💾 حفظ', '💾 Save')}
            </button>
          </div>

          {/* The piece on the left, what the site and Google will make of it on
              the right — where it stays put while you write, because a score
              you have to scroll to is a score nobody looks at. */}
          <div className="editor-body art-editor">
            <div className="art-main">
              <label className="lbl">{t('العنوان', 'Title')}</label>
              <Hint>
                {t(
                  'اللي بيظهر فوق المقال على موقعك — اكتبه للقارئ.',
                  'The headline on the article itself — written for the reader.',
                )}
              </Hint>
              <input className="field" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value, slug: edit.slug || slugify(e.target.value) })} />
              <label className="lbl">{t('الـ slug', 'Slug')}</label>
              <input className="field" dir="ltr" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} style={{ textAlign: 'start' }} />
              <label className="lbl">{t('المقتطف', 'Excerpt')}</label>
              <Hint>
                {t(
                  'السطر اللي تحت العنوان في قائمة مقالات موقعك.',
                  'The line under the title on your own articles list.',
                )}
              </Hint>
              <textarea className="field" rows={2} value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} />
              <label className="lbl">{t('الغلاف', 'Cover')}</label>
              <MediaUploader compact previewUrl={edit.coverUrl} onUploaded={(m) => setEdit({ ...edit, coverId: m.id, coverUrl: m.thumbUrl })} />

              <div className="art-tabs">
                <button className={`pill ${tab === 'write' ? 'active' : ''}`} onClick={() => setTab('write')}>
                  {t('المحتوى (HTML)', 'Content (HTML)')}
                </button>
                <button className={`pill ${tab === 'read' ? 'active' : ''}`} onClick={() => setTab('read')}>
                  {t('👁 معاينة', '👁 Preview')}
                </button>
                <span className="art-count">
                  {minutes} {t('دقيقة قراءة', 'min read')}
                </span>
              </div>

              {tab === 'write' ? (
                <textarea
                  className="field"
                  rows={18}
                  dir="ltr"
                  value={edit.contentHtml}
                  onChange={(e) => setEdit({ ...edit, contentHtml: e.target.value })}
                  style={{ textAlign: 'start', fontFamily: 'monospace' }}
                />
              ) : (
                <div className="art-prev" dir={lang === 'en' ? 'ltr' : 'rtl'}>
                  <h1>{edit.title || t('عنوان المقال', 'Article title')}</h1>
                  <div className="art-prev-meta">
                    {new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG')}
                    {minutes ? ` · ${minutes} ${t('دقيقة قراءة', 'min read')}` : ''}
                  </div>
                  {edit.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="art-prev-cover" src={edit.coverUrl} alt="" />
                  )}
                  {edit.contentHtml.trim() ? (
                    <div
                      className="article-body"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: safePreview(edit.contentHtml) }}
                    />
                  ) : (
                    <p style={{ color: 'var(--sub)' }}>
                      {t('لسه مفيش محتوى — اكتب في تبويب المحتوى وهيظهر هنا.', 'Nothing written yet — the content tab fills this in.')}
                    </p>
                  )}
                </div>
              )}

              <label className="lbl">{t('الوسوم (مفصولة بفاصلة)', 'Tags (comma separated)')}</label>
              <Hint>
                {t(
                  'موضوع المقال. بتظهر تحته على الموقع، وبنرشّح بيها «مقالات ليها علاقة» في آخر كل مقال — روابط بين مقالاتك، وده اللي بيفيد في البحث.',
                  'What the piece is about. Shown under it, and used to pick the related reading at the end of every article — links between your own pieces, which is what search engines read.',
                )}
              </Hint>
              <input className="field" value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} />

              {/* The one control that decides whether any of this is on the
                  site. It used to be an unlabelled switch in the right half of
                  a two-column row, under the heading "Status" — which reads as
                  a thing being reported, not a thing you press. A whole draft
                  sat unpublished because its author could not find it. */}
              <div className={`pub-row ${live ? 'live' : ''} ${waiting ? 'sched' : ''}`}>
                <div className="pub-state">
                  <strong>
                    {live ? t('منشور', 'Published') : waiting ? t('مجدول', 'Scheduled') : t('مسودّة', 'Draft')}
                  </strong>
                  <span>
                    {live
                      ? t('ظاهر على الموقع', 'Visible on the site')
                      : waiting
                        ? `${t('هينشر', 'Goes live')} ${whenText(edit.publishAt, lang)}`
                        : t('مش ظاهر على الموقع لحد ما تنشره', 'Not on the site until you publish it')}
                  </span>
                </div>
                <button
                  type="button"
                  className={`btn ${live ? '' : 'btn-primary'}`}
                  onClick={() =>
                    setEdit(
                      live
                        ? { ...edit, published: false, publishAt: null }
                        : { ...edit, published: true, publishAt: null },
                    )
                  }
                >
                  {live ? t('رجّعه مسودّة', 'Back to draft') : t('انشر دلوقتي', 'Publish now')}
                </button>
              </div>

              {/* Or at an hour of your choosing. Written in the evening, read
                  in the morning — and nobody should have to be awake for it. */}
              {!live && (
                <div className="pub-when">
                  <label className="lbl">{t('أو انشره في وقت تحدده', 'Or set the hour it goes live')}</label>
                  <input
                    className="field"
                    type="datetime-local"
                    dir="ltr"
                    value={toLocalInput(edit.publishAt)}
                    onChange={(e) => setEdit({ ...edit, published: false, publishAt: fromLocalInput(e.target.value) })}
                  />
                  {edit.publishAt && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setEdit({ ...edit, publishAt: null })}>
                      {t('ألغِ الجدولة', 'Cancel the schedule')}
                    </button>
                  )}
                  <p className="lbl" style={{ opacity: 0.7, marginTop: 6 }}>
                    {t(
                      'بتوقيت جهازك. المقال بيظهر لوحده في الوقت ده من غير ما تعمل حاجة.',
                      "Your device's clock. It appears by itself at that time, with nothing left to press.",
                    )}
                  </p>
                </div>
              )}

              {/* Two switches that decide whether this is for search engines at
                  all — a publishing decision, so they sit with the publishing
                  one rather than in the panel you watch while writing. */}
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

              <p className="lbl" style={{ opacity: 0.7 }}>
                {t(
                  'الرابط والنشر لكل لغة على حدة — بدّل لغة اللوحة عشان تظبط النسخة التانية.',
                  'The address and the publish switch belong to this language — switch the dashboard language to set the other.',
                )}
              </p>
            </div>

            <aside className="art-side">
              <SeoPanel
                html={edit.contentHtml}
                title={edit.title}
                metaTitle={edit.seoTitle}
                metaDescription={edit.seoDescription}
                excerpt={edit.excerpt}
                slug={edit.slug || slugify(edit.title)}
                keyphrase={edit.keyphrase}
                onKeyphrase={(v) => setEdit({ ...edit, keyphrase: v })}
              />
              {/* ── SEO ────────────────────────────────────────────────────
                  The headline you write for a reader and the line Google
                  shows are rarely the same sentence, and there was nowhere
                  to say so. Empty falls back to the article's own title and
                  excerpt, which is what happened before these existed. */}
              <div className="de-group">
                <div className="de-group-title">{t('محركات البحث', 'Search engines')}</div>

                <Counted
                  label={t('عنوان جوجل', 'Meta title')}
                  n={(edit.seoTitle || edit.title).length}
                  max={60}
                />
                <Hint>{t('السطر الأزرق في نتيجة البحث.', 'The blue line in the results.')}</Hint>
                <input
                  className="field"
                  value={edit.seoTitle}
                  placeholder={edit.title || t('نفس عنوان المقال', 'Same as the article title')}
                  onChange={(e) => setEdit({ ...edit, seoTitle: e.target.value })}
                />
                <Counted
                  label={t('وصف جوجل', 'Meta description')}
                  n={(edit.seoDescription || edit.excerpt).length}
                  max={160}
                />
                <Hint>
                  {t('السطر الرمادي تحته — اللي بيقنع الناس تدوس.', 'The grey line under it — what decides the click.')}
                </Hint>
                <textarea
                  className="field"
                  rows={3}
                  value={edit.seoDescription}
                  placeholder={edit.excerpt || t('نفس مقتطف المقال', 'Same as the excerpt')}
                  onChange={(e) => setEdit({ ...edit, seoDescription: e.target.value })}
                />
                {/* What the result actually looks like, before publishing. */}
                <div className="serp" dir="auto">
                  <div className="serp-url">viralpx.com › {edit.slug || slugify(edit.title) || '…'}</div>
                  <div className="serp-title">{edit.seoTitle || edit.title || t('عنوان المقال', 'Article title')}</div>
                  <div className="serp-desc">
                    {edit.seoDescription || edit.excerpt || t('وصف المقال يظهر هنا.', 'The description appears here.')}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
