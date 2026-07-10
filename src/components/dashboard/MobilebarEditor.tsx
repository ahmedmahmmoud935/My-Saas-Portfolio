'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { saveMobilebar, type MobilebarForm, type MobileBtn } from '@/lib/mobilebar-actions'
import { useDashLang } from './DashLang'

const POS = ['left', 'center', 'right']
const TYPES = [
  { value: 'section', label: 'الانتقال لقسم', en: 'Go to section' },
  { value: 'whatsapp', label: 'واتساب', en: 'WhatsApp' },
  { value: 'articles', label: 'المقالات', en: 'Articles' },
  { value: 'link', label: 'رابط', en: 'Link' },
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
  const { t: tr } = useDashLang()
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
        title={tr('شريط الموبايل السفلي', 'Mobile bottom bar')}
        subtitle={tr('3 اختصارات تظهر أسفل الموقع على الموبايل', '3 shortcuts shown at the bottom on mobile')}
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : tr('💾 حفظ', '💾 Save')}
          </button>
        }
      />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className={`toggle ${enabled ? 'on' : ''}`} role="switch" aria-checked={enabled} onClick={() => setEnabled(!enabled)} />
          <span style={{ fontWeight: 700 }}>{tr('تفعيل الشريط السفلي على الموبايل', 'Enable the mobile bottom bar')}</span>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        {btns.map((b, i) => (
          <div className="panel" key={i}>
            <div className="panel-title">
              <span>{tr('الزر', 'Button')} {i + 1}</span>
              <span>🔘</span>
            </div>
            <label className="lbl">{tr('الموضع', 'Position')}</label>
            <select className="field" value={b.pos} onChange={(e) => patch(i, { pos: e.target.value })}>
              {POS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <label className="lbl">{tr('الإجراء', 'Action')}</label>
            <select className="field" value={b.type} onChange={(e) => patch(i, { type: e.target.value })}>
              {TYPES.map((ty) => <option key={ty.value} value={ty.value}>{tr(ty.label, ty.en)}</option>)}
            </select>
            <label className="lbl">{tr('الهدف (قسم/رابط)', 'Target (section/link)')}</label>
            <input className="field" value={b.target} onChange={(e) => patch(i, { target: e.target.value })} />
            <label className="lbl">{tr('الأيقونة (FA)', 'Icon (FA)')}</label>
            <input className="field" dir="ltr" value={b.icon} onChange={(e) => patch(i, { icon: e.target.value })} style={{ textAlign: 'start' }} />
            <label className="lbl">{tr('الاسم', 'Label')}</label>
            <input className="field" value={b.label} onChange={(e) => patch(i, { label: e.target.value })} />
          </div>
        ))}
      </div>

      {toast && <div className="toast">{tr('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
