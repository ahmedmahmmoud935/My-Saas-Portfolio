'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useDashLang } from './DashLang'
import HtmlEmbed from '@/components/shared/HtmlEmbed'
import { isEmbeddablePage, looksLikeDocument, looksLikeHtml } from '@/lib/html-embed'
import { PASTE_GUIDE_AR, PASTE_GUIDE_EN } from '@/lib/paste-guide'
import { uploadFile } from '@/lib/upload-client'

/**
 * A small WYSIWYG field: formatting toolbar over a contentEditable, with a
 * raw-HTML view you can switch to.
 *
 * Uses document.execCommand. It's deprecated but still the only thing every
 * browser implements consistently for this, and it keeps the whole editor to
 * one file with no dependency to keep up to date. The stored value is plain
 * HTML either way, so nothing here leaks into the saved data.
 */
export default function RichText({
  value,
  onChange,
  dir = 'rtl',
  minHeight = 160,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  dir?: 'rtl' | 'ltr'
  minHeight?: number
  placeholder?: string
}) {
  const { t } = useDashLang()
  const box = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState(false)
  // A pasted page is shown as a design, with the source one click away.
  const isPage = isEmbeddablePage(value)
  const [guide, setGuide] = useState(false)
  const [copied, setCopied] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  // Where the caret was before the file picker stole focus. Without it the
  // picture lands wherever the browser last had a selection, which is usually
  // the top of the document.
  const saved = useRef<Range | null>(null)

  // Only write into the box when the value came from outside; doing it on every
  // keystroke would reset the caret to the start.
  useEffect(() => {
    const el = box.current
    if (!el || html || isPage) return
    if (el.innerHTML !== value) el.innerHTML = value || ''
  }, [value, html, isPage])

  /**
   * Pasting markup should produce markup. The visual editor's default is to
   * paste as text, which is how a whole case-study page ended up printed on
   * the site as source code.
   */
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text/plain')
    if (!text || !looksLikeHtml(text)) return // ordinary text: default paste
    e.preventDefault()
    if (looksLikeDocument(text)) {
      // A complete page — keep the source intact (contentEditable would rewrite
      // it) and show it rendered. Landing in the source view was the reason a
      // pasted design looked like it "stayed code".
      onChange(text)
      setHtml(false)
      return
    }
    document.execCommand('insertHTML', false, text)
    if (box.current) onChange(box.current.innerHTML)
  }

  const exec = (cmd: string, arg?: string) => {
    box.current?.focus()
    document.execCommand(cmd, false, arg)
    if (box.current) onChange(box.current.innerHTML)
  }

  const rememberCaret = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount && box.current?.contains(sel.anchorNode)) {
      saved.current = sel.getRangeAt(0).cloneRange()
    }
  }

  /**
   * A picture inside the article, described.
   *
   * There was no way to put one in at all — the only images an article could
   * have were its cover. The alt text is asked for rather than left blank
   * because an undescribed picture is invisible to image search and to anyone
   * using a screen reader, and this editor is where the person who knows what
   * the picture shows is sitting.
   */
  async function insertImage(f: File) {
    setUploading(true)
    try {
      const media = await uploadFile(f)
      const src = media.url || media.thumbUrl
      if (!src) return
      const alt = window.prompt(
        t('اكتب وصفًا مختصرًا للصورة (مهم لجوجل وقارئ الشاشة):', 'Describe the picture (for image search and screen readers):'),
        '',
      )
      box.current?.focus()
      // Put the caret back where it was before the picker opened.
      const sel = window.getSelection()
      if (saved.current && sel) {
        sel.removeAllRanges()
        sel.addRange(saved.current)
      }
      const escaped = (alt || '').replace(/"/g, '&quot;')
      document.execCommand('insertHTML', false, `<img src="${src}" alt="${escaped}" loading="lazy" />`)
      if (box.current) onChange(box.current.innerHTML)
    } finally {
      setUploading(false)
      if (file.current) file.current.value = ''
    }
  }

  const Btn = ({
    cmd,
    arg,
    title,
    children,
    wide,
  }: {
    cmd: string
    arg?: string
    title: string
    children: React.ReactNode
    wide?: boolean
  }) => (
    <button
      type="button"
      className={`rt-btn${wide ? ' wide' : ''}`}
      title={title}
      // Keep the selection: mousedown would blur the editable first.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => exec(cmd, arg)}
    >
      {children}
    </button>
  )

  return (
    <div className="rt" dir={dir}>
      <div className="rt-bar" dir={dir}>
        <span className="rt-group">
          <span className="rt-label">{t('تنسيق', 'Format')}</span>
          <Btn cmd="formatBlock" arg="p" title={t('عادي', 'Normal')} wide>
            {t('عادي', 'Normal')}
          </Btn>
          {/* All six levels. Three of them were missing, so a long article had
              no way to nest a sub-section below the second level. */}
          {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((h) => (
            <Btn key={h} cmd="formatBlock" arg={h} title={h.toUpperCase()}>
              {h.toUpperCase()}
            </Btn>
          ))}
          <Btn cmd="formatBlock" arg="blockquote" title={t('اقتباس', 'Quote')}>
            ❝
          </Btn>
        </span>

        <span className="rt-group">
          <span className="rt-label">{t('صورة', 'Image')}</span>
          <button
            type="button"
            className="rt-btn wide"
            title={t('أدرج صورة', 'Insert an image')}
            disabled={uploading}
            onMouseDown={(e) => {
              e.preventDefault()
              rememberCaret()
            }}
            onClick={() => file.current?.click()}
          >
            {uploading ? '…' : t('＋ صورة', '＋ Image')}
          </button>
          <input
            ref={file}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void insertImage(f)
            }}
          />
        </span>

        <span className="rt-group">
          <Btn cmd="bold" title={t('عريض', 'Bold')}>
            <b>B</b>
          </Btn>
          <Btn cmd="italic" title={t('مائل', 'Italic')}>
            <i>I</i>
          </Btn>
          <Btn cmd="underline" title={t('تحته خط', 'Underline')}>
            <u>U</u>
          </Btn>
        </span>

        <span className="rt-group">
          <Btn cmd="insertUnorderedList" title={t('قائمة نقطية', 'Bulleted list')}>
            ••
          </Btn>
          <Btn cmd="insertOrderedList" title={t('قائمة مرقّمة', 'Numbered list')}>
            1.
          </Btn>
        </span>

        <span className="rt-group">
          <Btn cmd="justifyRight" title={t('يمين', 'Right')}>
            ⇥
          </Btn>
          <Btn cmd="justifyCenter" title={t('توسيط', 'Centre')}>
            ≡
          </Btn>
          <Btn cmd="justifyLeft" title={t('يسار', 'Left')}>
            ⇤
          </Btn>
        </span>

        <span className="rt-group">
          <button
            type="button"
            className="rt-btn"
            title={t('رابط', 'Link')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = prompt(t('الرابط', 'URL'))
              if (url) exec('createLink', url)
            }}
          >
            🔗
          </button>
          <Btn cmd="removeFormat" title={t('مسح التنسيق', 'Clear formatting')}>
            ⌫
          </Btn>
        </span>

        <button
          type="button"
          className={`rt-btn wide${html ? ' on' : ''}`}
          title={t('تحرير كـ HTML', 'Edit as HTML')}
          onClick={() => setHtml((v) => !v)}
        >
          {'<> HTML'}
        </button>
        <button
          type="button"
          className={`rt-btn wide${guide ? ' on' : ''}`}
          title={t('تعليمات تديها للـ AI قبل ما يكتب الصفحة', 'The brief to give an AI before it writes the page')}
          onClick={() => setGuide((v) => !v)}
        >
          {t('تعليمات الـ AI', 'AI brief')}
        </button>
      </div>

      {guide && (
        <div className="rt-guide">
          <div className="rt-guide-head">
            <span>
              {t(
                'الصقها للـ AI قبل ما يكتب الصفحة — كده ألوان التصميم هتتغيّر مع الوضع الليلي/النهاري وألوان الموقع.',
                'Paste this to an AI before it writes the page — the design then follows dark/light mode and the site palette.',
              )}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(t(PASTE_GUIDE_AR, PASTE_GUIDE_EN))
                setCopied(true)
                setTimeout(() => setCopied(false), 1800)
              }}
            >
              {copied ? t('اتنسخت ✓', 'Copied ✓') : t('نسخ', 'Copy')}
            </button>
          </div>
          <pre>{t(PASTE_GUIDE_AR, PASTE_GUIDE_EN)}</pre>
        </div>
      )}

      {isPage && (
        <p className="rt-note">
          {html
            ? t(
                'دي صفحة HTML كاملة — اقفل وضع الكود عشان تشوف التصميم.',
                'This is a full HTML page — leave code view to see the design.',
              )
            : t(
                'دي صفحة HTML كاملة، وشكلها تحت هو نفس شكلها على الموقع. للتعديل على الكود اضغط <> HTML.',
                'A full HTML page — what you see below is what the site shows. Press <> HTML to edit the source.',
              )}
        </p>
      )}

      {html ? (
        <textarea
          className="field rt-html"
          dir="ltr"
          style={{ minHeight, textAlign: 'start' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      ) : isPage ? (
        // Rendered, not editable: contentEditable mangles a whole document the
        // moment you click into it.
        <div className="rt-preview">
          <HtmlEmbed value={value} />
        </div>
      ) : (
        <div
          ref={box}
          className="rt-box"
          dir={dir}
          style={{ minHeight }}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder || ''}
          onPaste={onPaste}
          // Remember where the caret is, so an inserted picture lands there
          // rather than wherever the browser last had a selection.
          onKeyUp={rememberCaret}
          onMouseUp={rememberCaret}
          onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
          onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        />
      )}
    </div>
  )
}
