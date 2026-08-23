'use client'

import React, { useState } from 'react'
import RichText from './RichText'
import { useDashLang } from './DashLang'

export type Bi = { ar: string; en: string }

const isEmpty = (html: string) => !html.replace(/<[^>]*>/g, '').trim()

/**
 * One field, both languages. Each side edits in its own direction, and the tab
 * opens on whichever language the dashboard is currently in.
 *
 * Leaving one side blank is allowed — visitors on that language fall back to
 * the other — so this warns rather than blocks.
 */
export default function BiText({
  label,
  value,
  onChange,
  minHeight,
}: {
  label: string
  value: Bi
  onChange: (v: Bi) => void
  minHeight?: number
}) {
  const { t, lang } = useDashLang()
  const [side, setSide] = useState<'ar' | 'en'>(lang)
  const missing = isEmpty(value.ar) !== isEmpty(value.en)

  return (
    <div className="bitext">
      <div className="bitext-head">
        <label className="lbl" style={{ margin: 0 }}>
          {label}
        </label>
        <div className="bitext-tabs">
          {(['ar', 'en'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`pill ${side === s ? 'active' : ''}`}
              onClick={() => setSide(s)}
            >
              {s === 'ar' ? 'عربي' : 'English'}
              {isEmpty(value[s]) && <span className="bitext-dot" title={t('فاضي', 'Empty')} />}
            </button>
          ))}
        </div>
      </div>

      <RichText
        key={side}
        value={value[side]}
        dir={side === 'ar' ? 'rtl' : 'ltr'}
        minHeight={minHeight}
        placeholder={side === 'ar' ? 'اكتب هنا…' : 'Write here…'}
        onChange={(html) => onChange({ ...value, [side]: html })}
      />

      {missing && (
        <p className="bitext-warn">
          {isEmpty(value.en)
            ? t(
                'الإنجليزي فاضي — زوّار النسخة الإنجليزية هيشوفوا النص العربي.',
                'English is empty — visitors on the English site will see the Arabic text.',
              )
            : t(
                'العربي فاضي — زوّار النسخة العربية هيشوفوا النص الإنجليزي.',
                'Arabic is empty — visitors on the Arabic site will see the English text.',
              )}
        </p>
      )}
    </div>
  )
}
