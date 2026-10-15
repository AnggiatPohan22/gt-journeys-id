import React from 'react'
import type { ServerProps } from 'payload'

/**
 * Brand Icon di breadcrumb top-bar admin (`admin.components.graphics.Icon`) —
 * tampil di SEMUA halaman admin sebagai penanda situs.
 *
 * Menampilkan LOGO situs dari SiteSettings global (`logo` light / `logoDark`
 * dark), di-swap per tema via CSS (.dnj-brand-icon__img--light/--dark di
 * admin-global.css). Server component async → fetch pakai `payload.findGlobal`
 * (serverProps menyertakan `payload`). Fallback: badge "DJ" bila logo kosong.
 * Read-only — tidak pernah mengubah SiteSettings.
 */
const DjBadge = () => (
  <svg width="28" height="28" viewBox="0 0 64 64" role="img" aria-label="GtJourneysID">
    <defs>
      <linearGradient id="dnj-icon-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1b3a4b" />
        <stop offset="1" stopColor="#6b9080" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#dnj-icon-grad)" />
    <text
      x="32"
      y="34"
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="Geist, system-ui, sans-serif"
      fontSize="28"
      fontWeight="700"
      fill="#ffffff"
      letterSpacing="-1"
    >
      DJ
    </text>
  </svg>
)

const Icon = async (props: ServerProps) => {
  const payload = props?.payload
  let logo: string | null = null
  let logoDark: string | null = null
  let siteName = ''
  try {
    const ss: any = await payload?.findGlobal({ slug: 'site-settings' as any, depth: 1 })
    siteName = ss?.siteName || ''
    logo = ss?.logo?.url || null
    logoDark = ss?.logoDark?.url || logo
  } catch {
    /* SiteSettings/logo belum ada → fallback badge */
  }

  if (!logo) return <DjBadge />

  const alt = siteName ? `${siteName} logo` : 'Site logo'
  return (
    <span className="dnj-brand-icon">
      <img className="dnj-brand-icon__img dnj-brand-icon__img--light" src={logo} alt={alt} />
      <img className="dnj-brand-icon__img dnj-brand-icon__img--dark" src={logoDark ?? logo} alt={alt} />
    </span>
  )
}

export default Icon
