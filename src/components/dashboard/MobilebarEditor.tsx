'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { saveMobilebar, type MobilebarForm, type MobileBtn } from '@/lib/mobilebar-actions'

const POS = ['left', 'center', 'right']
const TYPES = [
  { value: 'section', label: 'الانتقال لقسم' },
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'articles', label: 'المقالات' },
  { value: 'link', label: 'رابط' },
]

export default function MobilebarEditor({ initial }: { initial: MobilebarForm }) {
  const start =
    initial.buttons.length === 3
      ? initial.buttons
      : [
          { pos: 'right', type: 'section', target: 'projects', icon: 'images', label: '' },
          { pos: 'center', type: 'whatsapp', target: '', icon: 'whatsapp', label: '' },
          { pos: 'left', type: 'section', target: 'contact', icon: 'envelope', label: '' },
        ]
  const [enabled, setEnabled] = useState(initial.enabled)
  const [btns, setBtns] = useState<MobileBtn[]>(start)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)

  const patch = (i: number, p: Partial<MobileBtn>) =>
    setBtns(btns.map((b, j) => (j === i ? { ...b, ...p } : b)))

  async function save() {
    setBusy(true)
    await saveMobilebar({ enabled, buttons: btns })
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="📱"
        title="شريط الموبايل السفلي"
        subtitle="3 اختصارات تظهر أسفل الموقع على الموبايل"
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '...' : '💾 حفظ'}
          </button>
        }
      />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className={`toggle ${enabled ? 'on' : ''}`} role="switch" aria-checked={enabled} onClick={() => setEnabled(!enabled)} />
          <span style={{ fontWeight: 700 }}>تفعيل الشريط السفلي على الموبايل</span>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {btns.map((b, i) => (
          <div className="panel" key={i}>
            <div className="panel-title">
              <span>الزر {i + 1}</span>
              <span>🔘</span>
            </div>
            <label className="lbl">الموضع</label>
            <select className="field" value={b.pos} onChange={(e) => patch(i, { pos: e.target.value })}>
              {POS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <label className="lbl">الإجراء</label>
            <select className="field" value={b.type} onChange={(e) => patch(i, { type: e.target.value })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <label className="lbl">الهدف (قسم/رابط)</label>
            <input className="field" value={b.target} onChange={(e) => patch(i, { target: e.target.value })} />
            <label className="lbl">الأيقونة (FA)</label>
            <input className="field" dir="ltr" value={b.icon} onChange={(e) => patch(i, { icon: e.target.value })} style={{ textAlign: 'start' }} />
            <label className="lbl">الاسم</label>
            <input className="field" value={b.label} onChange={(e) => patch(i, { label: e.target.value })} />
          </div>
        ))}
      </div>

      {toast && <div className="toast">تم الحفظ ✓</div>}
    </div>
  )
}
