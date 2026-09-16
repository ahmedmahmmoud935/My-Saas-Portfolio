'use client'

import React, { useState } from 'react'
import { tenantUrl } from '@/lib/tenant-url'
import { cleanSlug, slugProblem, slugProblemText } from '@/lib/slug-rules'
import { useRouter } from 'next/navigation'
import PageHeader from './PageHeader'
import { createClient, updateTenant, resendActivation, setSuspended, deleteClient, setClientEmail } from '@/lib/owner-actions'
import { useDashLang } from './DashLang'

type Client = {
  id: number
  name: string
  slug: string
  domain: string
  storageLimitMb: number
  storageUsedMb: number
  suspended: boolean
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
    const problem = slugProblem(nc.slug)
    if (problem) {
      alert(slugProblemText(problem, t('ar', 'en') === 'ar'))
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

  async function saveQuota(c: Client, storageLimitMb: number, domain: string, slug: string, email: string) {
    const next = cleanSlug(slug)
    const problem = slugProblem(next)
    if (problem) {
      alert(slugProblemText(problem, t('ar', 'en') === 'ar'))
      return
    }
    const mail = email.trim().toLowerCase()
    const mailChanged = !!c.userId && mail !== (c.email ?? '').toLowerCase()
    if (mailChanged && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
      alert(t('الإيميل ده مش مكتوب صح', 'That email address is not well formed'))
      return
    }
    /* The email is how the client signs in, so changing it changes what they
       type at the login page tomorrow — worth a question, and worth saying. */
    if (mailChanged) {
      const ok = confirm(
        t(
          `تغيير إيميل «${c.name}» من\n${c.email}\nإلى\n${mail}؟\n\nالعميل هيدخل بالإيميل الجديد من دلوقتي، وكلمة السر زي ما هي.`,
          `Change «${c.name}»'s email from\n${c.email}\nto\n${mail}?\n\nThey sign in with the new one from now on; the password stays the same.`,
        ),
      )
      if (!ok) return
    }
    /* Renaming is the one change here that alters an address people already
       have, so it is the one that asks first — and says what happens to the
       old one, which is not obvious. */
    if (next !== c.slug) {
      const ok = confirm(
        t(
          `تغيير اسم المستخدم من «${c.slug}» إلى «${next}»؟\nالرابط القديم هيفضل شغال وهيحوّل على الجديد تلقائيًا.`,
          `Rename «${c.slug}» to «${next}»?\nThe old address keeps working and redirects to the new one.`,
        ),
      )
      if (!ok) return
    }
    try {
      await updateTenant(c.id, { storageLimitMb, domain: domain || null, slug: next })
    } catch (e) {
      const code = (e as Error)?.message?.replace('slug:', '')
      alert(
        code === 'taken'
          ? t('الاسم ده مستخدم مع عميل تاني', 'Another client already has that name')
          : t('مش قادر أحفظ — راجع الاسم', 'Could not save — check the name'),
      )
      return
    }
    if (mailChanged && c.userId) {
      try {
        await setClientEmail(c.userId, mail)
      } catch (e) {
        const code = (e as Error)?.message?.replace('email:', '')
        alert(
          code === 'taken'
            ? t('الإيميل ده مستخدم في حساب تاني', 'Another account already uses that email')
            : code === 'invalid'
              ? t('الإيميل ده مش مكتوب صح', 'That email address is not well formed')
              : t('الباقي اتحفظ، بس الإيميل متغيّرش', 'Everything else saved, but the email did not change'),
        )
        router.refresh()
        return
      }
      /* A new address nobody has used yet: offer the link there, so the
         client learns about the change from the change itself. */
      if (
        confirm(
          t(
            `الإيميل اتغيّر ✓\nتبعت رابط تعيين كلمة السر على ${mail}؟`,
            `Email changed ✓\nSend a set-password link to ${mail}?`,
          ),
        )
      ) {
        await resendActivation(mail)
        alert(t('تم إرسال الرابط ✓', 'Link sent ✓'))
      }
    }
    router.refresh()
  }
  async function resendLink(c: Client) {
    if (!confirm(`${t('إرسال رابط تعيين كلمة السر إلى', 'Send a set-password link to')} ${c.email}؟`)) return
    await resendActivation(c.email)
    alert(t('تم إرسال الرابط ✓', 'Link sent ✓'))
  }
  async function toggleSuspend(c: Client) {
    const on = !c.suspended
    if (!confirm(on ? t('تعطيل حساب هذا العميل؟ مش هيقدر يدخل وموقعه هيتخفي.', 'Suspend this client? They cannot log in and their site is hidden.') : t('إعادة تفعيل الحساب؟', 'Re-enable this account?'))) return
    await setSuspended(c.id, on)
    router.refresh()
  }
  async function removeClient(c: Client) {
    if (!confirm(`${t('حذف العميل نهائيًا', 'Permanently delete')} «${c.name}»؟\n${t('هيتحذف كل مشاريعه وصوره وحسابه — مفيش رجوع.', 'All their projects, media and account will be deleted — irreversible.')}`)) return
    if (prompt(t('اكتب اسم المستخدم للتأكيد:', 'Type the username to confirm:')) !== c.slug) {
      alert(t('الاسم غير مطابق — اتلغى الحذف.', 'Username did not match — delete cancelled.'))
      return
    }
    await deleteClient(c.id)
    alert(t('تم الحذف ✓', 'Deleted ✓'))
    router.refresh()
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
          <ClientRow key={c.id} c={c} onSaveQuota={saveQuota} onPassword={() => resendLink(c)} onSuspend={() => toggleSuspend(c)} onDelete={() => removeClient(c)} />
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
              <input className="field" dir="ltr" value={nc.slug} onChange={(e) => setNc({ ...nc, slug: cleanSlug(e.target.value) })} style={{ textAlign: 'start' }} />
              <p className="lbl" style={{ color: 'var(--sub)', marginTop: 4 }}>
                {t(
                  'حروف إنجليزي وأرقام وشرطة. كلمة واحدة زي kamal أو اتنين زي kamal-semeta. يتغيّر بعدين عادي والرابط القديم بيفضل شغال.',
                  'Latin letters, digits and hyphens. One word like kamal, or two like kamal-semeta. It can be changed later; the old address keeps working.',
                )}
              </p>
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
  onSuspend,
  onDelete,
}: {
  c: Client
  onSaveQuota: (c: Client, limit: number, domain: string, slug: string, email: string) => void
  onPassword: () => void
  onSuspend: () => void
  onDelete: () => void
}) {
  const [limit, setLimit] = useState(c.storageLimitMb)
  const { t } = useDashLang()
  const [domain, setDomain] = useState(c.domain)
  const [slug, setSlug] = useState(c.slug)
  const [email, setEmail] = useState(c.email)
  const pct = Math.min(100, Math.round((c.storageUsedMb / Math.max(1, limit)) * 100))
  return (
    <div className="panel" style={c.suspended ? { opacity: 0.7, borderColor: 'var(--danger)' } : undefined}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div style={{ textAlign: 'end' }}>
          <strong>{c.name}</strong> <span style={{ color: 'var(--sub)' }}>/{c.slug}</span>
          {c.suspended && <span className="pill" style={{ marginInlineStart: 8, color: 'var(--danger)', borderColor: 'var(--danger)' }}>{t('موقوف', 'Suspended')}</span>}
          <div style={{ color: 'var(--sub)', fontSize: 12 }} dir="ltr">{c.email}</div>
        </div>
        <a className="pill" href={tenantUrl(c.slug, c.domain)} target="_blank" rel="noreferrer">{t('عرض', 'View')}</a>
      </div>
      <div className="storage-bar" style={{ margin: '10px 0' }}><span style={{ width: `${pct}%` }} /></div>
      <div style={{ color: 'var(--sub)', fontSize: 12, textAlign: 'end', marginBottom: 8 }}>{c.storageUsedMb.toFixed(1)} / {limit} MB</div>
      <div className="grid-2">
        <div>
          <label className="lbl">{t('اسم المستخدم (الرابط)', 'Username (the address)')}</label>
          <input
            className="field"
            dir="ltr"
            value={slug}
            onChange={(e) => setSlug(cleanSlug(e.target.value))}
            style={{ textAlign: 'start' }}
          />
          <div className="lbl" style={{ color: 'var(--sub)', marginTop: 4 }} dir="ltr">
            viralpx.com/{slug || '…'}
          </div>
        </div>
        <div>
          <label className="lbl">{t('دومين مخصّص', 'Custom domain')}</label>
          <input className="field" dir="ltr" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ textAlign: 'start' }} />
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 10 }}>
        <div>
          <label className="lbl">{t('الإيميل (بيدخل بيه)', 'Email (their login)')}</label>
          <input
            className="field"
            type="email"
            dir="ltr"
            value={email}
            disabled={!c.userId}
            onChange={(e) => setEmail(e.target.value)}
            style={{ textAlign: 'start' }}
          />
        </div>
        <div>
          <label className="lbl">{t('حد التخزين (MB)', 'Storage limit (MB)')}</label>
          <input className="field" type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => onSaveQuota(c, limit, domain, slug, email)}>{t('💾 حفظ', '💾 Save')}</button>
        <button className="btn btn-ghost" onClick={onPassword} disabled={!c.userId}>{t('📧 إرسال رابط كلمة السر', '📧 Send password link')}</button>
        <button className="btn btn-ghost" onClick={onSuspend}>{c.suspended ? t('▶ تفعيل', '▶ Enable') : t('⏸ تعطيل', '⏸ Suspend')}</button>
        <button className="btn btn-danger" onClick={onDelete} style={{ marginInlineStart: 'auto' }}>{t('🗑 حذف', '🗑 Delete')}</button>
      </div>
    </div>
  )
}
