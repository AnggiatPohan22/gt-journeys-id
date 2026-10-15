'use client'
import React from 'react'
import { useAuth, useTheme } from '@payloadcms/ui'

/**
 * SidebarFooter — panel bawah sidebar yang SELALU terlihat (di-pin sticky
 * bottom via admin-global.css). Slot `afterNavLinks`. Berisi:
 *   • Kartu profil user login (avatar inisial + nama + role/email)
 *   • Tombol Logout (ikon pintu, kanan) → pakai `useAuth().logOut()` resmi Payload
 *   • Toggle Light/Dark → pakai `useTheme()` resmi Payload
 *
 * Native `.nav__controls` (logout + settings gear bawaan) disembunyikan lewat
 * CSS supaya tidak dobel; semua fungsi tetap fungsi bawaan Payload.
 */
const ROLE_LABEL: Record<string, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
}

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

const SidebarFooter = () => {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) return null
  const u = user as {
    name?: string
    email?: string
    role?: string
    avatar?: { url?: string | null; thumbnailURL?: string | null } | string | null
  }
  const name = u.name || u.email || 'User'
  const role = ROLE_LABEL[u.role ?? ''] || 'User'
  const avatarUrl =
    u.avatar && typeof u.avatar === 'object'
      ? (u.avatar.thumbnailURL || u.avatar.url || null)
      : null
  // Baris kedua = role saja (pendek, tidak terpotong jelek); email panjang
  // dulu bikin cutoff jelek. Role tetap informatif (super admin/admin/editor).
  const secondary = role
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  const isDark = theme === 'dark'

  return (
    <div className="dnj-footer">
      <div className="dnj-user">
        <a className="dnj-user__main" href="/admin/account" title="Account settings">
          <span className="dnj-user__avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', display: 'block' }}
              />
            ) : (
              initials
            )}
          </span>
          <span className="dnj-user__meta">
            <span className="dnj-user__name">{name}</span>
            <span className="dnj-user__role">{secondary}</span>
          </span>
        </a>
        {/* Route logout bawaan Payload (/admin/logout) → clear sesi + redirect
            ke login. Lebih andal daripada useAuth().logOut() yang tak redirect. */}
        <a
          className="dnj-user__logout"
          href="/admin/logout"
          title="Log out"
          aria-label="Log out"
        >
          <LogoutIcon />
        </a>
      </div>

      <button
        type="button"
        className="dnj-theme-toggle"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="dnj-theme-toggle__icon">{isDark ? <Sun /> : <Moon />}</span>
        <span className="dnj-theme-toggle__label">{isDark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </div>
  )
}

export default SidebarFooter
