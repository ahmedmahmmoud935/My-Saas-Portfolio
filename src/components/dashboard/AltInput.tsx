'use client'

import React, { useState } from 'react'
import { useDashLang } from './DashLang'
import { saveImageAlt } from '@/lib/media-alt-actions'
import { saveFailureText } from '@/lib/action-error'

/**
 * One line saying what a picture shows. Optional; saved the moment you leave
 * the field, onto the picture itself, so it needs no separate save and is not
 * lost if the project is closed without saving.
 */
export default function AltInput({
  id,
  value,
  onSaved,
  compact = false,
}: {
  id: number
  value?: string
  onSaved?: (alt: string) => void
  compact?: boolean
}) {
  const { t } = useDashLang()
  const [text, setText] = useState(value ?? '')
  const [saved, setSaved] = useState(value ?? '')
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | string>('idle')

  async function commit() {
    if (text.trim() === saved.trim()) return
    setState('busy')
    try {
      const r = await saveImageAlt(id, text)
      if (!r.ok) return setState(saveFailureText(r, t))
    } catch (e) {
      return setState(saveFailureText(e, t))
    }
    setSaved(text)
    onSaved?.(text.trim())
    setState('ok')
    setTimeout(() => setState('idle'), 1500)
  }

  return (
    <div className={`alt-in${compact ? ' compact' : ''}`}>
      <input
        className="field"
        value={text}
        maxLength={200}
        placeholder={
          compact
            ? t('وصف الصورة (اختياري)', 'Describe it (optional)')
            : t('وصف الصورة (اختياري) — مثلًا «شعار معلوم على كارت البزنس»', 'Describe the picture (optional) — e.g. “the Maaloom logo on a business card”')
        }
        title={t('بيساعد جوجل والذكاء الاصطناعي يفهموا الصورة', 'Helps Google and AI assistants understand the picture')}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
      />
      {state === 'busy' && <span className="alt-state">…</span>}
      {state === 'ok' && <span className="alt-state ok">✓</span>}
      {state !== 'idle' && state !== 'busy' && state !== 'ok' && <span className="alt-state bad">{state}</span>}
    </div>
  )
}
