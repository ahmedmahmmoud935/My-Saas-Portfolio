'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { useDashLang } from './DashLang'
import { sendFeedback } from '@/lib/feedback-actions'
import { FEEDBACK_ACCEPT, FEEDBACK_LIMITS, isAllowedAttachment } from '@/lib/feedback-rules'

export type FeedbackFile = { id: number; url: string | null; name: string; isImage: boolean }
export type FeedbackRow = {
  id: number
  kind: 'idea' | 'problem' | 'question'
  subject: string
  body: string
  status: 'new' | 'seen' | 'planned' | 'done'
  reply: string | null
  repliedAt: string | null
  createdAt: string
  files: FeedbackFile[]
}

const KINDS = [
  { id: 'idea', ar: '💡 اقتراح', en: '💡 An idea' },
  { id: 'problem', ar: '🐞 مشكلة', en: '🐞 A problem' },
  { id: 'question', ar: '❓ سؤال', en: '❓ A question' },
] as const

export const STATUS_LABEL: Record<FeedbackRow['status'], { ar: string; en: string }> = {
  new: { ar: 'اتبعت', en: 'Sent' },
  seen: { ar: 'اتشاف', en: 'Seen' },
  planned: { ar: 'في الخطة', en: 'Planned' },
  done: { ar: 'اتنفّذ', en: 'Done' },
}

const mb = (n: number) => `${(n / 1048576).toFixed(n < 1048576 ? 2 : 1)} MB`

/**
 * Where a client tells the platform what would make it better — and sees what
 * became of what they said. A box that never answers is one people stop
 * writing into, so every earlier suggestion is listed with its status and the
 * reply, if there is one.
 */
export default function FeedbackClient({ items }: { items: FeedbackRow[] }) {
  const { t, lang } = useDashLang()
  const router = useRouter()
  const [kind, setKind] = useState<FeedbackRow['kind']>('idea')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const picker = useRef<HTMLInputElement>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    for (const f of Array.from(list)) {
      if (next.length >= FEEDBACK_LIMITS.maxFiles) {
        setMsg({ ok: false, text: t(`أقصى عدد ${FEEDBACK_LIMITS.maxFiles} ملفات.`, `Up to ${FEEDBACK_LIMITS.maxFiles} files.`) })
        break
      }
      if (f.size > FEEDBACK_LIMITS.maxBytes) {
        setMsg({ ok: false, text: t(`«${f.name}» أكبر من 10 ميجا.`, `“${f.name}” is over 10 MB.`) })
        continue
      }
      if (!isAllowedAttachment(f.type, f.name)) {
        setMsg({ ok: false, text: t(`نوع «${f.name}» مش مدعوم — صور، PDF، ملفات أوفيس، أو zip.`, `“${f.name}” is not a supported type — images, PDF, Office files or zip.`) })
        continue
      }
      next.push(f)
    }
    setFiles(next)
    if (picker.current) picker.current.value = ''
  }

  async function submit() {
    if (!subject.trim() || !body.trim()) {
      setMsg({ ok: false, text: t('اكتب عنوان وتفاصيل.', 'Add a subject and the details.') })
      return
    }
    setBusy(true)
    setMsg(null)
    const fd = new FormData()
    fd.set('kind', kind)
    fd.set('subject', subject)
    fd.set('body', body)
    files.forEach((f) => fd.append('files', f))
    const res = await sendFeedback(fd).catch(() => null)
    setBusy(false)
    if (res?.ok) {
      setSubject('')
      setBody('')
      setFiles([])
      setMsg({ ok: true, text: t('وصلنا ✓ شكرًا — هتلاقي ردّنا هنا وفي الرسائل.', 'Received ✓ Thank you — our answer will appear here and in Messages.') })
      router.refresh()
      return
    }
    const code = res && !res.ok ? res.code : ''
    const file = res && !res.ok ? res.file : undefined
    setMsg({
      ok: false,
      text:
        code === 'bad-file' || code === 'type'
          ? t(`الملف «${file}» مش سليم أو نوعه مش مدعوم — شيله وجرّب تاني.`, `“${file}” is damaged or not a supported type — remove it and try again.`)
          : code === 'too-big'
            ? t(`«${file}» أكبر من 10 ميجا.`, `“${file}” is over 10 MB.`)
            : code === 'too-many'
              ? t(`أقصى عدد ${FEEDBACK_LIMITS.maxFiles} ملفات.`, `Up to ${FEEDBACK_LIMITS.maxFiles} files.`)
              : code === 'empty'
                ? t('اكتب عنوان وتفاصيل.', 'Add a subject and the details.')
                : code === 'server'
                  ? t('المشكلة عندنا مش في ملفك — الاقتراح ماتبعتش. جرّب تاني بعد شوية.', 'The fault is ours, not your file — nothing was sent. Please try again shortly.')
                  : code === 'unauthorized'
                    ? t('انتهت الجلسة — سجّل دخول تاني.', 'Your session ended — sign in again.')
                    : t('ماتبعتش — جرّب تاني.', 'It did not send — please try again.'),
    })
  }

  const when = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div>
      <PageHeader
        icon="💬"
        title={t('اقتراحاتي', 'Suggestions')}
        subtitle={t(
          'قولّنا إيه اللي يخلّي تجربتك أحسن — فكرة، مشكلة، أو سؤال، ومعاه صور أو ملفات لو تحب.',
          'Tell us what would make this better — an idea, a problem or a question, with pictures or files if that helps.',
        )}
      />

      <div className="fb-grid">
        <section className="panel fb-form">
          <div className="fb-kinds">
            {KINDS.map((k) => (
              <button key={k.id} className={`pill ${kind === k.id ? 'active' : ''}`} onClick={() => setKind(k.id)}>
                {t(k.ar, k.en)}
              </button>
            ))}
          </div>

          <label className="lbl">{t('العنوان', 'Subject')}</label>
          <input
            className="field"
            maxLength={160}
            value={subject}
            placeholder={t('مثلًا: عايز أقدر أرتّب الريلز بالسحب', 'e.g. Let me reorder reels by dragging')}
            onChange={(e) => setSubject(e.target.value)}
          />

          <label className="lbl">{t('التفاصيل', 'Details')}</label>
          <textarea
            className="field"
            rows={6}
            maxLength={5000}
            value={body}
            placeholder={t('اشرح اللي في بالك، ولو مشكلة: حصلت فين وإمتى؟', 'Say what you have in mind — for a problem, where and when it happened.')}
            onChange={(e) => setBody(e.target.value)}
          />

          <div
            className="fb-drop"
            onClick={() => picker.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              addFiles(e.dataTransfer.files)
            }}
          >
            <strong>📎 {t('أرفق صور أو ملفات', 'Attach pictures or files')}</strong>
            <span>
              {t(
                `اسحبها هنا أو دوس — لحد ${FEEDBACK_LIMITS.maxFiles} ملفات، كل واحد أقل من 10 ميجا. صور، PDF، أوفيس، zip.`,
                `Drop them here or click — up to ${FEEDBACK_LIMITS.maxFiles}, each under 10 MB. Images, PDF, Office, zip.`,
              )}
            </span>
            <input ref={picker} type="file" multiple hidden accept={FEEDBACK_ACCEPT} onChange={(e) => addFiles(e.target.files)} />
          </div>
          {files.length > 0 && (
            <ul className="fb-files">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <span>{f.type.startsWith('image/') ? '🖼' : '📄'}</span>
                  <b>{f.name}</b>
                  <small>{mb(f.size)}</small>
                  <button className="lx-icon" onClick={() => setFiles(files.filter((_, j) => j !== i))} title={t('شيل', 'Remove')}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {msg && <p className={`fb-msg ${msg.ok ? 'ok' : 'bad'}`}>{msg.text}</p>}
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? t('جاري الإرسال…', 'Sending…') : t('ابعت', 'Send')}
          </button>
        </section>

        <section className="fb-history">
          <h3>{t('اللي بعتّه قبل كده', 'What you have sent')}</h3>
          {items.length === 0 ? (
            <p className="fb-empty">{t('لسه مبعتّش حاجة.', 'Nothing yet.')}</p>
          ) : (
            items.map((r) => (
              <article key={r.id} className="fb-card">
                <header>
                  <span className={`fb-status s-${r.status}`}>{t(STATUS_LABEL[r.status].ar, STATUS_LABEL[r.status].en)}</span>
                  <strong>{r.subject}</strong>
                  <small>{when(r.createdAt)}</small>
                </header>
                <p>{r.body}</p>
                {r.files.length > 0 && (
                  <div className="fb-attached">
                    {r.files.map((f) =>
                      f.isImage && f.url ? (
                        <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.url} alt={f.name} />
                        </a>
                      ) : (
                        <a key={f.id} className="fb-chip" href={f.url ?? '#'} target="_blank" rel="noreferrer">
                          📄 {f.name}
                        </a>
                      ),
                    )}
                  </div>
                )}
                {r.reply && (
                  <div className="fb-reply">
                    <b>{t('رد الإدارة', 'Our reply')}</b>
                    <p>{r.reply}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
