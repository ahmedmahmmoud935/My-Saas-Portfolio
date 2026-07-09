'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DASHBOARD_NAV } from '@/lib/dashboard-nav'
import NavIcon from './icons'

export default function Sidebar({
  userName,
  tenantSlug,
  storageUsed,
  storageLimit,
  isOwner = false,
}: {
  userName: string
  tenantSlug: string
  storageUsed: number
  storageLimit: number
  isOwner?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const pct = Math.min(100, Math.round((storageUsed / Math.max(1, storageLimit)) * 100))

  const items = isOwner
    ? [...DASHBOARD_NAV, { id: 'users', labelAr: 'المستخدمون', labelEn: 'Users', icon: '' }]
    : DASHBOARD_NAV

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>Portfolio Admin</span>
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <NavIcon id="gem" size={18} />
        </span>
      </div>

      <button className="lang-pill">
        <span>🌐 العربية</span>
        <span>⇄ EN</span>
      </button>

      <nav>
        {items.map((item) => {
          const href = `/dashboard/${item.id}`
          const active = pathname === href || (item.id === 'projects' && pathname === '/dashboard')
          return (
            <a key={item.id} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <span>{item.labelAr}</span>
              <span className="ic">
                <NavIcon id={item.id} />
              </span>
            </a>
          )
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="who">
          مسجّل كـ <b>{userName}</b>
        </div>
        <div className="storage-bar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="who" style={{ fontSize: 12 }}>
          {storageUsed.toFixed(2)} / {storageLimit} MB
        </div>
        <a className="foot-link" href={`/${tenantSlug}`} target="_blank" rel="noreferrer">
          <span>عرض الموقع</span>
          <span>↗</span>
        </a>
        <button
          className="foot-link danger"
          onClick={logout}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span>تسجيل الخروج</span>
          <span>⎋</span>
        </button>
      </div>
    </aside>
  )
}
