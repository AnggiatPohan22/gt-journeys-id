'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

/**
 * NavDashboardLink — item "Dashboard" di ATAS grup menu (di atas Pages).
 * Payload default tidak punya link Dashboard di nav (brand/logo yang ke sana),
 * jadi kita tambahkan lewat slot `beforeNavLinks`.
 *
 * Pakai class `.nav__link` supaya ikut styling + ikon (::before, href $= /admin
 * → ikon home) + pill aktif dari admin-global.css. State aktif dideteksi
 * manual via `usePathname()` (Payload hanya menandai link bawaannya).
 */
const NavDashboardLink = () => {
  const pathname = usePathname()
  const active = pathname === '/admin' || pathname === '/admin/'
  return (
    <a className={`nav__link dnj-dashlink${active ? ' active' : ''}`} href="/admin">
      <span className="nav__link-label">DASHBOARD</span>
    </a>
  )
}

export default NavDashboardLink
