'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { createClient, updateTenant, setClientPassword } from '@/lib/owner-actions'

type Client = {
  id: number
  name: string
  slug: string
  domain: string
  storageLimitMb: number
  storageUsedMb: number
  userId: number | null
  email: string
}

export default function UsersManager({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [creating, setCreating] = useState(false)
  const [nc, setNc] = useState({ name: '', slug: '', email: '', password: '', storageLimitMb: 500 })

  async function create() {
    if (!nc.name || !nc.slug || !nc.email || !nc.password) {
      alert('املأ كل الحقول')
      return
    }
    setBusy(true)
    try {
      await createClient(nc)
      setCreating(false)
      setNc({ name: '', slug: '', email: '', password: '', storageLimitMb: 500 })
      router.refresh()
    } catch {
      alert('فشل الإنشاء (تأكد إن الـ slug/الإيميل غير مكرّرين)')
    } finally {
      setBusy(false)
    }
  }

  async function saveQuota(c: Client, storageLimitMb: number, domain: string) {
    await updateTenant(c.id, { storageLimitMb, domain: domain || null })
    router.refresh()
  }
  async function changePassword(c: Client) {
    if (!c.userId) return
    const p = prompt(`كلمة مرور جديدة لـ ${c.email}:`)
    if (!p) return
    await setClientPassword(c.userId, p)
    alert('تم تغيير كلمة المرور ✓')
  }

  return (
    <div>
      <PageHeader
        icon="👤"
        title="المستخدمون / العملاء"
        subtitle="إنشاء عملاء، الحصص، والدومينات"
        actions={<button className="btn btn-primary" onClick={() => setCreating(true)}>+ عميل جديد</button>}
      />

      <div className="proj-manage-grid" style={{ gridTemplateColumns: '1fr' }}>
        {clients.map((c) => (
          <ClientRow key={c.id} c={c} onSaveQuota={saveQuota} onPassword={() => changePassword(c)} />
        ))}
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <button className="icon-btn" onClick={() => setCreating(false)}>✕</button>
              <strong>عميل جديد</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">الاسم</label>
              <input className="field" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
              <label className="lbl">اسم المستخدم (URL)</label>
              <input className="field" dir="ltr" value={nc.slug} onChange={(e) => setNc({ ...nc, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} style={{ textAlign: 'start' }} />
              <label className="lbl">الإيميل</label>
              <input className="field" dir="ltr" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} style={{ textAlign: 'start' }} />
              <label className="lbl">كلمة المرور</label>
              <input className="field" dir="ltr" value={nc.password} onChange={(e) => setNc({ ...nc, password: e.target.value })} style={{ textAlign: 'start' }} />
              <label className="lbl">حد التخزين (MB)</label>
              <input className="field" type="number" value={nc.storageLimitMb} onChange={(e) => setNc({ ...nc, storageLimitMb: Number(e.target.value) })} />
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setCreating(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={create} disabled={busy}>{busy ? '...' : 'إنشاء'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClientRow({
  c,
  onSaveQuota,
  onPassword,
}: {
  c: Client
  onSaveQuota: (c: Client, limit: number, domain: string) => void
  onPassword: () => void
}) {
  const [limit, setLimit] = useState(c.storageLimitMb)
  const [domain, setDomain] = useState(c.domain)
  const pct = Math.min(100, Math.round((c.storageUsedMb / Math.max(1, limit)) * 100))
  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ textAlign: 'end' }}>
          <strong>{c.name}</strong> <span style={{ color: 'var(--sub)' }}>/{c.slug}</span>
          <div style={{ color: 'var(--sub)', fontSize: 12 }} dir="ltr">{c.email}</div>
        </div>
        <a className="pill" href={`/${c.slug}`} target="_blank" rel="noreferrer">عرض</a>
      </div>
      <div className="storage-bar" style={{ margin: '10px 0' }}><span style={{ width: `${pct}%` }} /></div>
      <div style={{ color: 'var(--sub)', fontSize: 12, textAlign: 'end', marginBottom: 8 }}>{c.storageUsedMb.toFixed(1)} / {limit} MB</div>
      <div className="grid-2">
        <div>
          <label className="lbl">حد التخزين (MB)</label>
          <input className="field" type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
        </div>
        <div>
          <label className="lbl">دومين مخصّص</label>
          <input className="field" dir="ltr" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ textAlign: 'start' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-start' }}>
        <button className="btn btn-primary" onClick={() => onSaveQuota(c, limit, domain)}>💾 حفظ</button>
        <button className="btn btn-ghost" onClick={onPassword} disabled={!c.userId}>🔑 كلمة المرور</button>
      </div>
    </div>
  )
}
