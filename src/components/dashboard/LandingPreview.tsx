'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDashLang } from './DashLang'

/**
 * The landing page itself, beside the fields that write it.
 *
 * The real page in a frame rather than a drawing of it: a drawing is a second
 * copy of every section to keep in step with the first, and it would drift.
 * The cost is that it shows what is saved, not what is being typed — so it
 * reloads after every save, and says so.
 *
 * Laid out at a desk's width and scaled down to fit, because a 460px frame
 * would otherwise render the phone layout and show a different page from the
 * one being edited. The phone is one click away for when that is the question.
 */

/** Where a section sits: an element id on the page, or one of its two ends. */
export type PreviewSpot = string

const DESK = 1280
const PHONE = 390

export default function LandingPreview({
  spot,
  version,
  onClose,
  path = '/',
  apply,
  theme,
  note,
}: {
  spot: PreviewSpot
  /** Bumped after a save, which is when the page has something new to show. */
  version: number
  onClose?: () => void
  /** The page to show. A portfolio is framed at its own path. */
  path?: string
  /** Paints unsaved changes onto the framed page, on load and whenever it changes. */
  apply?: (doc: Document) => void
  /** Which theme the framed page is shown in, when the editor chooses it. */
  theme?: { value: 'dark' | 'light'; onChange: (v: 'dark' | 'light') => void }
  note?: string
}) {
  const { t } = useDashLang()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [device, setDevice] = useState<'desk' | 'phone'>('desk')
  const [boxW, setBoxW] = useState(460)
  const [missing, setMissing] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const spotRef = useRef(spot)
  spotRef.current = spot
  const applyRef = useRef(apply)
  applyRef.current = apply

  const pageW = device === 'desk' ? DESK : PHONE
  const scale = Math.min(1, boxW / pageW)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* Scroll the page inside to the part being edited. Same origin, so the frame's
     document can be read directly — steadier than a #hash, which a sticky nav
     half covers. And instantly, overriding the page's own smooth scrolling: a
     smooth scroll is animated frame by frame, and a frame the browser is not
     painting (a background tab, a pane half off screen) never arrives. */
  const go = useCallback(() => {
    const win = frame.current?.contentWindow
    const doc = frame.current?.contentDocument
    if (!win || !doc) return
    const where = spotRef.current
    const behavior: ScrollBehavior = 'instant'
    if (where === 'top') {
      setMissing(false)
      win.scrollTo({ top: 0, behavior })
      return
    }
    if (where === 'bottom') {
      setMissing(false)
      win.scrollTo({ top: doc.documentElement.scrollHeight, behavior })
      return
    }
    const el = doc.getElementById(where)
    // A section switched off, or with nothing in it, is not on the page at all.
    setMissing(!el)
    if (el) win.scrollTo({ top: el.getBoundingClientRect().top + win.scrollY - 76, behavior })
  }, [])

  useEffect(() => {
    go()
  }, [spot, go])

  const paint = useCallback(() => {
    const doc = frame.current?.contentDocument
    if (doc && applyRef.current) applyRef.current(doc)
  }, [])
  useEffect(() => {
    paint()
  }, [apply, paint])

  // A portfolio may be written in English first, so its language is always
  // named; the address drops whichever one is its default.
  const src = `${path}?preview=1${lang === 'en' ? '&lang=en' : path === '/' ? '' : '&lang=ar'}&v=${version}`
  const live = path === '/' ? (lang === 'en' ? '/?lang=en' : '/') : `${path}?lang=${lang}`

  return (
    <aside className="lx-pv">
      <div className="lx-pv-bar">
        <div className="lx-seg">
          <button className={device === 'desk' ? 'on' : ''} onClick={() => setDevice('desk')} title={t('كمبيوتر', 'Desktop')}>
            🖥
          </button>
          <button className={device === 'phone' ? 'on' : ''} onClick={() => setDevice('phone')} title={t('موبايل', 'Phone')}>
            📱
          </button>
        </div>
        <div className="lx-seg">
          <button className={lang === 'ar' ? 'on' : ''} onClick={() => setLang('ar')}>
            ع
          </button>
          <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
            EN
          </button>
        </div>
        {theme && (
          <div className="lx-seg">
            <button className={theme.value === 'dark' ? 'on' : ''} onClick={() => theme.onChange('dark')} title={t('داكن', 'Dark')}>
              🌙
            </button>
            <button className={theme.value === 'light' ? 'on' : ''} onClick={() => theme.onChange('light')} title={t('فاتح', 'Light')}>
              ☀️
            </button>
          </div>
        )}
        <span className="lx-pv-note">{note ?? t('بتتحدّث بعد الحفظ', 'Updates when you save')}</span>
        <a className="lx-icon" href={live} target="_blank" rel="noreferrer" title={t('افتح الصفحة', 'Open the page')}>
          ↗
        </a>
        {onClose && (
          <button className="lx-icon" onClick={onClose} title={t('اقفل المعاينة', 'Close the preview')}>
            ✕
          </button>
        )}
      </div>

      <div className="lx-pv-box" ref={box}>
        <iframe
          key={`${src}|${device}`}
          ref={frame}
          src={src}
          title={t('معاينة الصفحة', 'Page preview')}
          onLoad={() => {
            // Layout settles a beat after load — fonts, images with no size yet.
            paint()
            go()
            setTimeout(go, 350)
          }}
          style={{
            width: pageW,
            height: `${100 / scale}%`,
            transform: `scale(${scale})`,
            marginInline: device === 'phone' ? `${Math.max(0, (boxW - pageW * scale) / 2)}px` : 0,
          }}
        />
        {missing && (
          <div className="lx-pv-missing">
            {t(
              'القسم ده مش ظاهر على الصفحة — يا إما مقفول من «ترتيب الأقسام»، يا إما لسه فاضي.',
              'This section is not on the page — it is switched off in Section order, or has nothing in it yet.',
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
