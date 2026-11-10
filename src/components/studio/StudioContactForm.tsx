'use client'

import React, { useState } from 'react'
import { Icon } from './icons'
import type { StudioUI } from '@/lib/studio-data'

/**
 * The reference's project form — name, email, project type, details — sent
 * through the platform's contact endpoint, so it reaches the owner's inbox
 * directly rather than opening the visitor's mail app.
 */
export default function StudioContactForm({
  ui,
  title,
  services,
  tenant,
}: {
  ui: StudioUI
  title: string
  services: string[]
  tenant: number
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'fail'>('idle')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const d = new FormData(form)
    setState('busy')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant,
          name: d.get('name'),
          email: d.get('email'),
          subject: d.get('subject'),
          message: d.get('message'),
        }),
      })
      setState(res.ok ? 'ok' : 'fail')
      if (res.ok) form.reset()
    } catch {
      setState('fail')
    }
  }

  return (
    <form className="st-contact-form" onSubmit={submit}>
      <h3>{title}</h3>
      <div className="st-form-row">
        <label>
          {ui.formName}
          <input placeholder={ui.namePlaceholder} required maxLength={100} autoComplete="name" name="name" />
        </label>
        <label>
          {ui.formEmail}
          <input placeholder="you@example.com" type="email" dir="ltr" required autoComplete="email" maxLength={200} name="email" />
        </label>
      </div>
      <label>
        {ui.formSubject}
        <select name="subject" required defaultValue="">
          <option value="" disabled>
            {ui.select}
          </option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value={ui.other}>{ui.other}</option>
        </select>
      </label>
      <label>
        {ui.formMessage}
        <textarea name="message" placeholder={ui.messagePlaceholder} required minLength={10} maxLength={5000} rows={4} />
      </label>
      <button className="st-button st-primary st-form-submit" type="submit" disabled={state === 'busy'}>
        {state === 'busy' ? ui.sending : ui.submit}
        <Icon name="send" size={18} />
      </button>
      {state === 'ok' || state === 'fail' ? (
        <p className="st-form-status" role="status">
          {state === 'ok' ? ui.sent : ui.failed}
        </p>
      ) : (
        <p className="st-form-hint">{ui.formHint}</p>
      )}
    </form>
  )
}
