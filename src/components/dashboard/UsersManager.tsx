'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { createClient, updateTenant, resendActivation } from '@/lib/owner-actions'
import { useDashLang } from './DashLang'

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
  const { t } = useDashLang()
  const [busy, setBusy] = useState(false)
  const [creating, setCreating] = useState(false)
  const [nc, setNc] = useState({ name: '', slug: '', email: '', storageLimitMb: 500 })

  async function create() {
    if (!nc.name || !nc.slug || !nc.email) {
      alert(t('املأ كل الحقول', 'Fill in all fields'))
      return
    }
    setBusy(true)
    try {
      await createClient(nc)
      setCreating(false)
      setNc({ name: '', slug: '', email: '', storageLimitMb: 500 })
      alert(t('تم الإنشاء ✓ اتبعت للعميل رابط لتعيين كلمة السر', 'Created ✓ a set-password link was emailed to the client'))
      router.refresh()
    } catch {
      alert(t('فشل الإنشاء (تأكد إن الـ slug/الإيميل غير مكرّرين)', 'Creation failed (check the slug/email are not duplicated)'))
    } finally {
      setBusy(false)
    }
  }

  async function saveQuota(c: Client, storageLimitMb: number, domain: string) {
    await updateTenant(c.id, { storageLimitMb, domain: domain || null })
    router.refresh()
  }
  async function resendLink(c: Client) {
    if (!confirm(`${t('إرسال رابط تعيين كلمة السر إلى', 'Send a set-password link to')} ${c.email}؟`)) return
    await resendActivation(c.email)
    alert(t('تم إرسال الرابط ✓', 'Link sent ✓'))
  }

  return (
    <div>
      <PageHeader
        icon="👤"
        title={t('المستخدمون / العملاء', 'Users / clients')}
        subtitle={t('إنشاء عملاء، الحصص، والدومينات', 'Create clients, quotas and domains')}
        actions={<button className="btn btn-primary" onClick={() => setCreating(true)}>+ {t('عميل جديد', 'New client')}</button>}
      />

      <div className="proj-manage-grid" style={{ gridTemplateColumns: '1fr' }}>
        {clients.map((c) => (
          <ClientRow key={c.id} c={c} onSaveQuota={saveQuota} onPassword={() => resendLink(c)} />
        ))}
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <button className="icon-btn" onClick={() => setCreating(false)}>✕</button>
              <strong>{t('عميل جديد', 'New client')}</strong>
            </div>
            <div className="modal-body">
              <label className="lbl">{t('الاسم', 'Name')}</label>
              <input className="field" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
              <label className="lbl">{t('اسم المستخدم (URL)', 'Username (URL)')}</label>
              <input className="field" dir="ltr" value={nc.slug} onChange={(e) => setNc({ ...nc, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} style={{ textAlign: 'start' }} />
              <label className="lbl">{t('الإيميل', 'Email')}</label>
              <input className="field" dir="ltr" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} style={{ textAlign: 'start' }} />
              <p className="lbl" style={{ color: 'var(--sub)', marginTop: 4 }}>
                {t('هيوصل للعميل رابط على إيميله لتعيين كلمة السر بنفسه.', 'The client gets an email link to set their own password.')}
              </p>
              <label className="lbl">{t('حد التخزين (MB)', 'Storage limit (MB)')}</label>
              <input className="field" type="number" value={nc.storageLimitMb} onChange={(e) => setNc({ ...nc, storageLimitMb: Number(e.target.value) })} />
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setCreating(false)}>{t('إلغاء', 'Cancel')}</button>
              <button className="btn btn-primary" onClick={create} disabled={busy}>{busy ? '…' : t('إنشاء', 'Create')}</button>
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
  const { t } = useDashLang()
  const [domain, setDomain] = useState(c.domain)
  const pct = Math.min(100, Math.round((c.storageUsedMb / Math.max(1, limit)) * 100))
  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ textAlign: 'end' }}>
          <strong>{c.name}</strong> <span style={{ color: 'var(--sub)' }}>/{c.slug}</span>
          <div style={{ color: 'var(--sub)', fontSize: 12 }} dir="ltr">{c.email}</div>
        </div>
        <a className="pill" href={`/${c.slug}`} target="_blank" rel="noreferrer">{t('عرض', 'View')}</a>
      </div>
      <div className="storage-bar" style={{ margin: '10px 0' }}><span style={{ width: `${pct}%` }} /></div>
      <div style={{ color: 'var(--sub)', fontSize: 12, textAlign: 'end', marginBottom: 8 }}>{c.storageUsedMb.toFixed(1)} / {limit} MB</div>
      <div className="grid-2">
        <div>
          <label className="lbl">{t('حد التخزين (MB)', 'Storage limit (MB)')}</label>
          <input className="field" type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
        </div>
        <div>
          <label className="lbl">{t('دومين مخصّص', 'Custom domain')}</label>
          <input className="field" dir="ltr" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ textAlign: 'start' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-start' }}>
        <button className="btn btn-primary" onClick={() => onSaveQuota(c, limit, domain)}>{t('💾 حفظ', '💾 Save')}</button>
        <button className="btn btn-ghost" onClick={onPassword} disabled={!c.userId}>{t('📧 إرسال رابط كلمة السر', '📧 Send password link')}</button>
      </div>
    </div>
  )
}
