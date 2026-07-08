'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import { SECTION_LABELS } from '@/lib/dashboard-nav'
import { saveSections } from '@/lib/dashboard-actions'

type Item = { sectionId: string; visible: boolean }

export default function SectionsEditor({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }
  const toggle = (i: number) =>
    setItems(items.map((it, j) => (j === i ? { ...it, visible: !it.visible } : it)))

  async function save() {
    setBusy(true)
    await saveSections(items)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="☰"
        title="ترتيب الأقسام"
        subtitle="اسحب/رتّب الأقسام وتحكّم في ظهورها على الموقع"
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '...' : '💾 حفظ'}
          </button>
        }
      />
      <div className="panel">
        {items.map((it, i) => {
          const label = SECTION_LABELS[it.sectionId] ?? { ar: it.sectionId, en: it.sectionId }
          return (
            <div className="list-row" key={it.sectionId} style={{ alignItems: 'stretch' }}>
              <div
                className={`toggle ${it.visible ? 'on' : ''}`}
                onClick={() => toggle(i)}
                role="switch"
                aria-checked={it.visible}
              />
              <div
                className="field"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: 'var(--sub)', fontSize: 12 }}>{label.en}</span>
                <span style={{ fontWeight: 700 }}>{label.ar}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, -1)}>
                  ▲
                </button>
                <button className="icon-btn" style={{ height: 20 }} onClick={() => move(i, 1)}>
                  ▼
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {toast && <div className="toast">تم الحفظ ✓</div>}
    </div>
  )
}
