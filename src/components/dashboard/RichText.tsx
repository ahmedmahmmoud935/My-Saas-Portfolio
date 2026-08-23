'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useDashLang } from './DashLang'

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

  // Only write into the box when the value came from outside; doing it on every
  // keystroke would reset the caret to the start.
  useEffect(() => {
    const el = box.current
    if (!el || html) return
    if (el.innerHTML !== value) el.innerHTML = value || ''
  }, [value, html])

  const exec = (cmd: string, arg?: string) => {
    box.current?.focus()
    document.execCommand(cmd, false, arg)
    if (box.current) onChange(box.current.innerHTML)
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
          {(['h1', 'h2', 'h3'] as const).map((h) => (
            <Btn key={h} cmd="formatBlock" arg={h} title={h.toUpperCase()}>
              {h.toUpperCase()}
            </Btn>
          ))}
          <Btn cmd="formatBlock" arg="blockquote" title={t('اقتباس', 'Quote')}>
            ❝
          </Btn>
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
      </div>

      {html ? (
        <textarea
          className="field rt-html"
          dir="ltr"
          style={{ minHeight, textAlign: 'start' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <div
          ref={box}
          className="rt-box"
          dir={dir}
          style={{ minHeight }}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder || ''}
          onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
          onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        />
      )}
    </div>
  )
}
