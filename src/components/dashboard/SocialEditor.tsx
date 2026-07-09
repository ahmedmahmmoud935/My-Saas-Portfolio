'use client'

import React, { useState } from 'react'
import PageHeader from './PageHeader'
import MediaUploader from './MediaUploader'
import { saveSocial, type SocialForm } from '@/lib/social-actions'

const NETWORKS: { key: keyof SocialForm; label: string; icon: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp', icon: '🟢' },
  { key: 'instagram', label: 'Instagram', icon: '📸' },
  { key: 'behance', label: 'Behance', icon: '🅱️' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { key: 'facebook', label: 'Facebook', icon: '📘' },
  { key: 'vimeo', label: 'Vimeo', icon: '🎥' },
]

export default function SocialEditor({
  initial,
  avatarUrl,
}: {
  initial: SocialForm
  avatarUrl: string | null
}) {
  const [f, setF] = useState<SocialForm>(initial)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(false)

  const isVisible = (k: string) => f.visible.includes(k)
  const toggleVis = (k: string) =>
    setF((p) => ({
      ...p,
      visible: isVisible(k) ? p.visible.filter((x) => x !== k) : [...p.visible, k],
    }))

  async function save() {
    setBusy(true)
    await saveSocial(f)
    setBusy(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  return (
    <div>
      <PageHeader
        icon="🔗"
        title="التواصل الاجتماعي"
        subtitle="روابطك — فعّلها وحط اللينك. الواتساب بيشغّل الزر العائم"
        actions={
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? '...' : '💾 حفظ'}
          </button>
        }
      />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-title">
          <span>الصورة الشخصية</span>
          <span>👤</span>
        </div>
        <MediaUploader
          previewUrl={avatarUrl}
          onUploaded={(m) => setF((p) => ({ ...p, avatarId: m.id }))}
        />
      </div>

      <div className="panel">
        <div className="grid-2">
          {NETWORKS.map((n) => (
            <div key={n.key} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div
                  className={`toggle ${isVisible(n.key) ? 'on' : ''}`}
                  role="switch"
                  aria-checked={isVisible(n.key)}
                  onClick={() => toggleVis(n.key)}
                />
                <span style={{ fontWeight: 700 }}>
                  {n.label} {n.icon}
                </span>
              </div>
              <input
                className="field"
                dir="ltr"
                placeholder="الرابط / الرقم"
                value={f[n.key] as string}
                onChange={(e) => setF((p) => ({ ...p, [n.key]: e.target.value }))}
                style={{ textAlign: 'start' }}
              />
            </div>
          ))}
        </div>
      </div>

      {toast && <div className="toast">تم الحفظ ✓</div>}
    </div>
  )
}
