import React from 'react'
import type { ServerProps } from 'payload'
import cmsPkg from '../../package.json' with { type: 'json' }

// Admin polish styles — scoped `.dnj-dash` (lihat custom.css), aman di-import
// global lewat komponen ini (tidak menyentuh UI inti Payload).
import './custom.css'

/**
 * DashboardStats — dashboard admin role-based (Phase 4.3).
 *
 * Server Component (async): baca role dari `user.role` (editor/admin/
 * super-admin) lalu render layout berbeda. Data via `payload` local API
 * (counts + recent activity + media size). Didaftarkan di
 * `admin.components.beforeDashboard`.
 *
 * Layout mengikuti referensi `ai/cms/dashboard-design2`: stat row padat +
 * grid 2 kolom (kiri: Analytics + Quick Access · kanan: Recent Activity +
 * System Health) supaya terisi proporsional tanpa area kosong. Konten default
 * Payload di bawahnya disembunyikan via CSS.
 *
 * Palet: hybrid (brand ocean/coral di atas token tema Payload — light & dark).
 */

type Payload = ServerProps['payload']
type Role = 'editor' | 'admin' | 'super-admin'

// Payload version — dibaca dari dependencies apps/cms/package.json (yang
// kita kontrol) bukan dari `payload/package.json` (di-block oleh exports
// field di payload@3, memicu resolver warning di Next dev tiap render).
const PAYLOAD_VERSION = ((cmsPkg as { dependencies?: Record<string, string> }).dependencies?.payload ?? '3.x')
  .replace(/^[\^~>=<\s]+/, '')

// ── Brand palette ────────────────────────────────────────
const BRAND = { ocean: '#1b3a4b', coral: '#e07a5f', leaf: '#6b9080', stone: '#3d405b' }
const tint = (hex: string): { background: string; color: string } => ({
  background: `${hex}1f`,
  color: hex,
})

// ── Inline SVG icons ─────────────────────────────────────
type IconName =
  | 'pages' | 'services' | 'map' | 'star' | 'image' | 'plus' | 'settings'
  | 'clock' | 'layout' | 'menu' | 'users' | 'category' | 'chart' | 'server'
  | 'storage' | 'history'
  | 'compass' | 'bed' | 'wave' | 'anchor' | 'utensils' | 'building' | 'car'
  | 'flower' | 'sliders'

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  pages: (<><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 13h6M9 17h6" /></>),
  services: (<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>),
  map: (<><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z" /><circle cx="12" cy="11" r="2" /></>),
  star: (<path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" />),
  image: (<><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>),
  plus: (<path d="M12 5v14M5 12h14" />),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  layout: (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>),
  menu: (<path d="M4 6h16M4 12h16M4 18h16" />),
  users: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>),
  category: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>),
  chart: (<><path d="M3 3v18h18" /><path d="m7 14 3-4 3 3 4-6" /></>),
  server: (<><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></>),
  storage: (<><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" /><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" /></>),
  history: (<><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l3 2" /></>),
  compass: (<><circle cx="12" cy="12" r="9" /><path d="m16 8-6 2-2 6 6-2 2-6Z" /></>),
  bed: (<><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 14h18M3 18v2M21 18v2" /><path d="M7 10V8a1 1 0 0 1 1-1h3v3" /></>),
  wave: (<><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></>),
  anchor: (<><circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V21" /><path d="M5 12H3a9 9 0 0 0 18 0h-2" /></>),
  utensils: (<><path d="M4 3v6a2 2 0 0 0 4 0V3" /><path d="M6 9v12" /><path d="M18 3c-1.5 0-2.5 1.8-2.5 4S16.5 11 18 11" /><path d="M18 3v18" /></>),
  building: (<><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 21v-4h6v4" /><path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01" /></>),
  car: (<><path d="M5 17H4a1 1 0 0 1-1-1v-4l2-5h14l2 5v4a1 1 0 0 1-1 1h-1" /><circle cx="7.5" cy="17" r="1.8" /><circle cx="16.5" cy="17" r="1.8" /></>),
  flower: (<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" /><path d="M2 21c0-3 1.9-5.4 5.1-6" /></>),
  sliders: (<><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" /><path d="M1 14h6M9 8h6M17 16h6" /></>),
}

const Icon = ({ name }: { name: IconName }) => (
  <svg
    viewBox="0 0 24 24"
    fill={name === 'star' ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={name === 'star' ? 0 : 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICON_PATHS[name]}
  </svg>
)

// ── Helpers ──────────────────────────────────────────────
const safeCount = async (payload: Payload, collection: string, where?: any): Promise<number> => {
  try {
    const res = await payload.count({ collection: collection as any, where })
    return res.totalDocs
  } catch {
    return 0
  }
}

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const min = Math.round((Date.now() - then) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

const formatBytes = (bytes: number): string => {
  if (!bytes || bytes < 0) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

const SERVICE_COLLECTIONS = [
  'tours', 'accommodations', 'water-activities', 'yachts',
  'restaurants', 'venues', 'rentals', 'spa',
]

const ACTIVITY_COLLECTIONS: { slug: string; titleField: string; label: string; icon: IconName }[] = [
  { slug: 'pages', titleField: 'title', label: 'Page', icon: 'pages' },
  { slug: 'service-types', titleField: 'name', label: 'Service Type', icon: 'services' },
  { slug: 'testimonials', titleField: 'name', label: 'Testimonial', icon: 'star' },
  { slug: 'accommodations', titleField: 'name', label: 'Accommodation', icon: 'services' },
  { slug: 'tours', titleField: 'title', label: 'Tour', icon: 'services' },
  { slug: 'water-activities', titleField: 'title', label: 'Water Activity', icon: 'services' },
  { slug: 'yachts', titleField: 'name', label: 'Yacht', icon: 'services' },
  { slug: 'restaurants', titleField: 'name', label: 'Restaurant', icon: 'services' },
  { slug: 'venues', titleField: 'name', label: 'Venue', icon: 'services' },
  { slug: 'rentals', titleField: 'title', label: 'Rental', icon: 'services' },
  { slug: 'spa', titleField: 'title', label: 'Spa', icon: 'services' },
  { slug: 'destinations', titleField: 'name', label: 'Destination', icon: 'map' },
  { slug: 'categories', titleField: 'title', label: 'Category', icon: 'category' },
  { slug: 'media', titleField: 'alt', label: 'Media', icon: 'image' },
]

type Stat = { label: string; value: number; sub?: string; accent: string; icon: IconName }
type Action = { title: string; href: string; accent: string; icon: IconName }
type Recent = { label: string; icon: IconName; title: string; updatedAt: string; url: string }

// ══════════════════════════════════════════════════════════
//  Section render helpers
// ══════════════════════════════════════════════════════════

const StatRow = ({ stats }: { stats: Stat[] }) => (
  <section className="dnj-frame" aria-label="Overview stats">
    <div className="dnj-frame__head">
      <span className="dnj-frame__title">At a glance</span>
    </div>
    {/* Satu baris, tanpa swipe — kotak compact & proporsional. */}
    <div className="dnj-statgrid">
      {stats.map((s) => (
        <div key={s.label} className="dnj-stat">
          <span className="dnj-stat__icon" style={tint(s.accent)}><Icon name={s.icon} /></span>
          <div className="dnj-stat__value">{s.value.toLocaleString()}</div>
          <div className="dnj-stat__label">{s.label}</div>
        </div>
      ))}
    </div>
  </section>
)

/* Quick access ikon-only (tanpa teks) — nama tampil via tooltip (title). */
const QuickAccess = ({ actions, prominent }: { actions: Action[]; prominent?: boolean }) => (
  <section className={`dnj-quick${prominent ? ' dnj-quick--prominent' : ''}`} aria-label="Quick access">
    <div className="dnj-quick__title">Quick access</div>
    <div className="dnj-quick__grid">
      {actions.slice(0, 10).map((a) => (
        <a
          key={a.title}
          href={a.href}
          className="dnj-qa"
          data-tip={a.title}
          aria-label={a.title}
          style={tint(a.accent)}
        >
          <Icon name={a.icon} />
        </a>
      ))}
    </div>
  </section>
)

const AnalyticsCard = () => (
  <section className="dnj-analytics" aria-label="Analytics">
    <div className="dnj-analytics__head">
      <span className="dnj-panel__title">Traffic &amp; Performance</span>
    </div>
    <div className="dnj-analytics__body">
      <span className="dnj-analytics__chart" style={tint(BRAND.leaf)}><Icon name="chart" /></span>
      <div className="dnj-analytics__banner">
        📊 Analytics data will be available after connecting Google Analytics.
      </div>
      <p className="dnj-analytics__text">
        Connect Google Analytics to view traffic, visitor behaviour, and
        performance metrics right here in your dashboard.
      </p>
      <button type="button" className="dnj-btn" disabled>
        <Icon name="chart" /> Setup Analytics
      </button>
    </div>
  </section>
)

const RecentActivity = ({ recents, title }: { recents: Recent[]; title: string }) => (
  <section className="dnj-panel" aria-label={title}>
    <div className="dnj-panel__title">{title}</div>
    {recents.length === 0 ? (
      <div className="dnj-activity__empty">No activity yet.</div>
    ) : (
      <ul className="dnj-activity">
        {recents.map((r, i) => (
          <li key={`${r.label}-${i}`} className="dnj-activity__row">
            <a href={r.url} className="dnj-activity__link">
              <span className="dnj-activity__dot" style={tint(BRAND.ocean)}><Icon name={r.icon} /></span>
              <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <span className="dnj-activity__name">{r.title}</span>
                <span className="dnj-activity__badge">{r.label}</span>
              </span>
            </a>
            <span className="dnj-activity__time">{relativeTime(r.updatedAt)}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
)

const InfoRow = ({ icon, label, value, accent }: { icon: IconName; label: string; value: React.ReactNode; accent: string }) => (
  <div className="dnj-info">
    <span className="dnj-info__icon" style={tint(accent)}><Icon name={icon} /></span>
    <span className="dnj-info__label">{label}</span>
    <span className="dnj-info__value">{value}</span>
  </div>
)

const SystemHealth = ({
  mediaCount, mediaSize, nodeVersion, full, horizontal,
}: { mediaCount: number; mediaSize: string; nodeVersion?: string; full?: boolean; horizontal?: boolean }) => (
  <section
    className={`dnj-health${horizontal ? ' dnj-health--row' : ''}`}
    aria-label={full ? 'System health' : 'Media usage'}
  >
    <div className="dnj-panel__title">
      <Icon name="server" /> {full ? 'System Health' : 'Media Usage'}
    </div>
    <div className="dnj-health__rows">
      <InfoRow icon="image" label="Media files" value={`${mediaCount.toLocaleString()} files`} accent={BRAND.coral} />
      <InfoRow icon="storage" label="Storage" value={mediaSize} accent={BRAND.leaf} />
      {full && (
        <>
          <InfoRow icon="server" label="Payload" value={`v${PAYLOAD_VERSION}`} accent={BRAND.ocean} />
          <InfoRow icon="settings" label="Node" value={nodeVersion ?? '—'} accent={BRAND.stone} />
          <InfoRow icon="history" label="Last backup" value={<span className="dnj-info__muted">No backups configured</span>} accent={BRAND.stone} />
          <a className="dnj-health__link" href="/admin/globals/site-settings">Backup settings →</a>
        </>
      )}
    </div>
  </section>
)

// ══════════════════════════════════════════════════════════
//  Main component
// ══════════════════════════════════════════════════════════

const DashboardStats = async ({ payload, user }: ServerProps) => {
  const role = ((user as any)?.role as Role) || 'editor'
  const isAdminUp = role === 'admin' || role === 'super-admin'
  const isSuper = role === 'super-admin'
  const displayName = (user as any)?.name || (user as any)?.email || 'there'

  // ── Media size (files + total bytes estimate) ──────────
  let mediaCount = 0
  let mediaBytes = 0
  try {
    const res = await payload.find({ collection: 'media' as any, limit: 500, depth: 0 })
    mediaCount = res.totalDocs
    for (const doc of res.docs as any[]) mediaBytes += Number(doc?.filesize ?? 0)
  } catch {
    /* ignore */
  }
  const mediaSize = formatBytes(mediaBytes)

  // ── Stats: SEMUA role (super 6, admin 5, editor 5) ─────
  const [pages, destinations, categories, media, serviceCounts, users] = await Promise.all([
    safeCount(payload, 'pages'),
    safeCount(payload, 'destinations'),
    safeCount(payload, 'categories'),
    safeCount(payload, 'media'),
    Promise.all(SERVICE_COLLECTIONS.map((s) => safeCount(payload, s))),
    isSuper ? safeCount(payload, 'users') : Promise.resolve(0),
  ])
  const services = serviceCounts.reduce((a, b) => a + b, 0)
  const stats: Stat[] = [
    { label: 'Pages', value: pages, accent: BRAND.ocean, icon: 'pages' },
    { label: 'Destinations', value: destinations, accent: BRAND.coral, icon: 'map' },
    { label: 'Categories', value: categories, accent: BRAND.stone, icon: 'category' },
    { label: 'Services', value: services, accent: BRAND.leaf, icon: 'services' },
    { label: 'Media', value: media, accent: BRAND.coral, icon: 'image' },
  ]
  if (isSuper) stats.push({ label: 'Users', value: users, accent: BRAND.ocean, icon: 'users' })

  // ── Recent activity (last 10 across collections) ───────
  const recents: Recent[] = []
  await Promise.all(
    ACTIVITY_COLLECTIONS.map(async ({ slug, titleField, label, icon }) => {
      try {
        const res = await payload.find({ collection: slug as any, sort: '-updatedAt', limit: 10, depth: 0 })
        for (const doc of res.docs as any[]) {
          recents.push({
            label, icon,
            title: String(doc?.[titleField] ?? doc?.title ?? doc?.name ?? doc?.slug ?? `#${doc?.id}`),
            updatedAt: doc?.updatedAt ?? '',
            url: `/admin/collections/${slug}/${doc?.id}`,
          })
        }
      } catch {
        /* skip */
      }
    }),
  )
  recents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const recent10 = recents.slice(0, 10)

  // ── Quick access (ikon-only, per role, maks 10) ────────
  const superActions: Action[] = [
    { title: 'New Page', href: '/admin/collections/pages/create', accent: BRAND.ocean, icon: 'plus' },
    { title: 'New Destination', href: '/admin/collections/destinations/create', accent: BRAND.coral, icon: 'map' },
    { title: 'New Category', href: '/admin/collections/categories/create', accent: BRAND.stone, icon: 'category' },
    { title: 'Menu', href: '/admin/collections/menus', accent: BRAND.leaf, icon: 'menu' },
    { title: 'Media', href: '/admin/collections/media', accent: BRAND.coral, icon: 'image' },
    { title: 'Users', href: '/admin/collections/users', accent: BRAND.ocean, icon: 'users' },
    { title: 'Site Features', href: '/admin/globals/site-features', accent: BRAND.leaf, icon: 'sliders' },
    { title: 'Site Settings', href: '/admin/globals/site-settings', accent: BRAND.stone, icon: 'settings' },
  ]
  // Services (Pages + 8 modul layanan). Untuk admin/editor.
  const serviceActions: Action[] = [
    { title: 'Pages', href: '/admin/collections/pages', accent: BRAND.ocean, icon: 'pages' },
    { title: 'Tours', href: '/admin/collections/tours', accent: BRAND.leaf, icon: 'compass' },
    { title: 'Accommodation', href: '/admin/collections/accommodations', accent: BRAND.ocean, icon: 'bed' },
    { title: 'Water Activities', href: '/admin/collections/water-activities', accent: BRAND.coral, icon: 'wave' },
    { title: 'Yachts', href: '/admin/collections/yachts', accent: BRAND.stone, icon: 'anchor' },
    { title: 'Restaurants', href: '/admin/collections/restaurants', accent: BRAND.coral, icon: 'utensils' },
    { title: 'Venues', href: '/admin/collections/venues', accent: BRAND.leaf, icon: 'building' },
    { title: 'Rentals', href: '/admin/collections/rentals', accent: BRAND.stone, icon: 'car' },
    { title: 'Spa', href: '/admin/collections/spa', accent: BRAND.leaf, icon: 'flower' },
  ]
  const adminActions: Action[] = [
    ...serviceActions,
    { title: 'Menu', href: '/admin/collections/menus', accent: BRAND.ocean, icon: 'menu' },
  ]
  const editorActions: Action[] = [
    ...serviceActions,
    { title: 'Media', href: '/admin/collections/media', accent: BRAND.coral, icon: 'image' },
  ]
  const actions: Action[] = isSuper ? superActions : isAdminUp ? adminActions : editorActions

  const nodeVersion = typeof process !== 'undefined' ? process.version : undefined

  // ══ Render ═══════════════════════════════════════════════
  return (
    <div className="dnj-dash">
      {/* Header — judul saja. Logo situs ada di breadcrumb top-bar (graphics.Icon). */}
      <div className="dnj-dash__head">
        <div>
          <h2 className="dnj-dash__title">Overview</h2>
          <p className="dnj-dash__subtitle">
            Welcome back, {displayName} — here’s what’s happening across your site.
          </p>
        </div>
      </div>

      {role === 'editor' ? (
        /* ── EDITOR: stat row + quick access, Media Usage (horizontal), activity ── */
        <>
          <StatRow stats={stats} />
          <QuickAccess actions={actions} prominent />
          <SystemHealth mediaCount={mediaCount} mediaSize={mediaSize} horizontal />
          {/* Site-wide: collections don't track an editor (no updatedBy field). */}
          <RecentActivity recents={recent10} title="Recent activity" />
        </>
      ) : (
        /* ── ADMIN / SUPER-ADMIN ── */
        <>
          <StatRow stats={stats} />
          <div className="dnj-cols">
            <div className="dnj-col dnj-col--main">
              <AnalyticsCard />
              <QuickAccess actions={actions} />
            </div>
            <div className="dnj-col dnj-col--side">
              <RecentActivity recents={recent10} title="Recent activity" />
            </div>
          </div>
          {/* System Health / Media Usage — memanjang horizontal di bawah. */}
          <SystemHealth
            mediaCount={mediaCount}
            mediaSize={mediaSize}
            nodeVersion={nodeVersion}
            full={isSuper}
            horizontal
          />
        </>
      )}
    </div>
  )
}

export default DashboardStats
