'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { saveNavbar } from '@/lib/dashboard-actions'
import { useDashLang } from './DashLang'

type Item = { linkId: string; labelAr: string; labelEn: string; visible: boolean }

export default function NavbarEditor({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)
  const { t } = useDashLang()

  const patch = (i: number, p: Partial<Item>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, ...p } : it)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  async function save() {
    setBusy(true)
    await saveNavbar(items)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="⬆️"
        title={t('الشريط العلوي', 'Top navbar')}
        subtitle={t('فعّل/أخفِ الروابط، رتّبها، وعدّل النص عربي/إنجليزي', 'Toggle, reorder links and edit the Arabic/English label')}
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '…' : t('💾 حفظ', '💾 Save')}
          </button>
        }
      />
      <div className="panel">
        {items.map((it, i) => (
          <div className="list-row" key={i}>
            <div
              className={`toggle ${it.visible ? 'on' : ''}`}
              onClick={() => patch(i, { visible: !it.visible })}
              role="switch"
              aria-checked={it.visible}
            />
            <input
              className="field"
              dir="ltr"
              placeholder="English"
              value={it.labelEn}
              onChange={(e) => patch(i, { labelEn: e.target.value })}
              style={{ textAlign: 'start' }}
            />
            <input
              className="field"
              placeholder="عربي"
              value={it.labelAr}
              onChange={(e) => patch(i, { labelAr: e.target.value })}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, -1)}>
                ▲
              </button>
              <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, 1)}>
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
      {toast && <div className="toast">{t('تم الحفظ ✓', 'Saved ✓')}</div>}
    </div>
  )
}
