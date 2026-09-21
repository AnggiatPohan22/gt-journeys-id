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
  | 'sparkles' | 'trending' | 'alert' | 'tag'

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
  sparkles: (<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="2.5" /></>),
  trending: (<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>),
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5h.01" /></>),
  tag: (<><path d="M20 12 12 20a2 2 0 0 1-2.83 0L3 13.83V4h9.83L20 11.17a2 2 0 0 1 0 2.83Z" /><circle cx="7.5" cy="8.5" r="1.2" /></>),
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
  'restaurants', 'venues', 'rentals', 'spa', 'ferry-tickets',
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
  { slug: 'ferry-tickets', titleField: 'title', label: 'Ferry Tickets', icon: 'services' },
  { slug: 'destinations', titleField: 'name', label: 'Destination', icon: 'map' },
  { slug: 'categories', titleField: 'title', label: 'Category', icon: 'category' },
  { slug: 'media', titleField: 'alt', label: 'Media', icon: 'image' },
]

type Stat = { key: string; label: string; value: number; sub?: string; accent: string; icon: IconName; href?: string }
type Action = { key: string; title: string; href: string; accent: string; icon: IconName }
type Recent = { label: string; icon: IconName; title: string; updatedAt: string; url: string }
type HealthKey = 'media' | 'storage' | 'payload' | 'node' | 'backup'

// ══════════════════════════════════════════════════════════
//  Section render helpers
// ══════════════════════════════════════════════════════════

const StatRow = ({ stats, clickable, title }: { stats: Stat[]; clickable: boolean; title: string }) => (
  <section className="dnj-frame" aria-label={title}>
    <div className="dnj-frame__head">
      <span className="dnj-frame__title">{title}</span>
    </div>
    {/* Satu baris, tanpa swipe — kotak compact & proporsional. */}
    <div className="dnj-statgrid">
      {stats.map((s) => {
        const body = (
          <>
            <span className="dnj-stat__icon" style={tint(s.accent)}><Icon name={s.icon} /></span>
            <div className="dnj-stat__value">{s.value.toLocaleString()}</div>
            <div className="dnj-stat__label">{s.label}</div>
          </>
        )
        return clickable && s.href ? (
          <a key={s.key} href={s.href} className="dnj-stat dnj-stat--link" aria-label={`View ${s.label}`}>{body}</a>
        ) : (
          <div key={s.key} className="dnj-stat">{body}</div>
        )
      })}
    </div>
  </section>
)

/* Quick access ikon-only (tanpa teks) — nama tampil via tooltip (title). */
const QuickAccess = ({ actions, prominent, title }: { actions: Action[]; prominent?: boolean; title: string }) => (
  <section className={`dnj-quick${prominent ? ' dnj-quick--prominent' : ''}`} aria-label={title}>
    <div className="dnj-quick__title">{title}</div>
    <div className="dnj-quick__grid">
      {actions.map((a) => (
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

const AnalyticsCard = ({ title }: { title: string }) => (
  <section className="dnj-analytics" aria-label={title}>
    <div className="dnj-analytics__head">
      <span className="dnj-panel__title">{title}</span>
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
  mediaCount, mediaSize, nodeVersion, healthKeys, horizontal, titleOverride,
}: {
  mediaCount: number
  mediaSize: string
  nodeVersion?: string
  /** Phase 4.58.1 — which health rows to show. Empty = nothing rendered. */
  healthKeys: HealthKey[]
  horizontal?: boolean
  /** Phase 4.58.3 — super-admin override; empty → auto ("Media Usage" / "System Health") */
  titleOverride?: string
}) => {
  if (healthKeys.length === 0) return null
  const has = (k: HealthKey) => healthKeys.includes(k)
  // Title: super-admin override wins; else heuristic ("Media Usage" jika hanya media/storage, else "System Health").
  const onlyMedia = healthKeys.every((k) => k === 'media' || k === 'storage')
  const title = titleOverride?.trim() || (onlyMedia ? 'Media Usage' : 'System Health')
  return (
    <section
      className={`dnj-health${horizontal ? ' dnj-health--row' : ''}`}
      aria-label={title}
    >
      <div className="dnj-panel__title">
        <Icon name="server" /> {title}
      </div>
      <div className="dnj-health__rows">
        {has('media') && (
          <InfoRow icon="image" label="Media files" value={`${mediaCount.toLocaleString()} files`} accent={BRAND.coral} />
        )}
        {has('storage') && (
          <InfoRow icon="storage" label="Storage" value={mediaSize} accent={BRAND.leaf} />
        )}
        {has('payload') && (
          <InfoRow icon="server" label="Payload" value={`v${PAYLOAD_VERSION}`} accent={BRAND.ocean} />
        )}
        {has('node') && (
          <InfoRow icon="settings" label="Node" value={nodeVersion ?? '—'} accent={BRAND.stone} />
        )}
        {has('backup') && (
          <>
            <InfoRow icon="history" label="Last backup" value={<span className="dnj-info__muted">No backups configured</span>} accent={BRAND.stone} />
            <a className="dnj-health__link" href="/admin/globals/site-settings">Backup settings →</a>
          </>
        )}
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════
//  Phase 4.58 — Smart Insight + Top Performing widgets
// ══════════════════════════════════════════════════════════

interface SmartInsightItem {
  key: string
  label: string
  count: number
  hint: string
  href: string
  icon: IconName
  accent: string
}

/**
 * Heuristic SEO scan across pages + service collections + media.
 * Returns 3 issue rows (missing meta desc, weak title length, missing alt).
 * Zero AI call — rule-based, cheap.
 */
const buildSmartInsight = async (payload: Payload): Promise<SmartInsightItem[]> => {
  // ── Missing meta description across pages + service collections ──
  const seoTargets = ['pages', ...SERVICE_COLLECTIONS]
  let missingMeta = 0
  await Promise.all(
    seoTargets.map(async (slug) => {
      // Match: meta.description empty OR seo.metaDescription empty.
      // Payload's `where` supports `or`; guard with try/catch since some
      // service collections might not have the field yet.
      const patterns: any[] = [
        { or: [{ 'meta.description': { exists: false } }, { 'meta.description': { equals: '' } }] },
        { or: [{ 'seo.metaDescription': { exists: false } }, { 'seo.metaDescription': { equals: '' } }] },
      ]
      for (const where of patterns) {
        try {
          const res = await payload.count({ collection: slug as any, where })
          missingMeta += res.totalDocs
          break // first matching schema wins
        } catch {
          continue
        }
      }
    }),
  )

  // ── Missing alt text on media ─────────────────────────────
  let missingAlt = 0
  try {
    const res = await payload.count({
      collection: 'media' as any,
      where: { or: [{ alt: { exists: false } }, { alt: { equals: '' } }] },
    })
    missingAlt = res.totalDocs
  } catch {
    /* ignore */
  }

  // ── Draft (unpublished) count across pages + services ─────
  let drafts = 0
  await Promise.all(
    seoTargets.map(async (slug) => {
      try {
        const res = await payload.count({
          collection: slug as any,
          where: { _status: { equals: 'draft' } },
        })
        drafts += res.totalDocs
      } catch {
        /* skip collections without draft */
      }
    }),
  )

  return [
    {
      key: 'meta',
      label: 'Meta description missing',
      count: missingMeta,
      hint: 'Pages / services tanpa meta description — perbaiki untuk SEO snippet.',
      href: '/admin/collections/pages?limit=50',
      icon: 'alert',
      accent: BRAND.coral,
    },
    {
      key: 'alt',
      label: 'Images missing alt text',
      count: missingAlt,
      hint: 'Alt text penting untuk a11y + SEO gambar.',
      href: '/admin/collections/media?limit=50',
      icon: 'image',
      accent: BRAND.leaf,
    },
    {
      key: 'draft',
      label: 'Drafts pending publish',
      count: drafts,
      hint: 'Konten status draft — publish supaya tampil di frontend.',
      href: '/admin/collections/pages?where[_status][equals]=draft',
      icon: 'clock',
      accent: BRAND.ocean,
    },
  ]
}

const SmartInsightWidget = ({ items, imageTagEnabled, title }: { items: SmartInsightItem[]; imageTagEnabled: boolean; title: string }) => (
  <section className="dnj-insight" aria-label={title}>
    <div className="dnj-panel__title">
      <Icon name="sparkles" /> {title}
      <span className="dnj-insight__badge">Heuristic</span>
    </div>
    <ul className="dnj-insight__list">
      {items.map((it) => (
        <li key={it.key} className="dnj-insight__row">
          <a href={it.href} className="dnj-insight__link">
            <span className="dnj-insight__icon" style={tint(it.accent)}><Icon name={it.icon} /></span>
            <span className="dnj-insight__body">
              <span className="dnj-insight__label">{it.label}</span>
              <span className="dnj-insight__hint">{it.hint}</span>
            </span>
            <span className="dnj-insight__count" style={{ color: it.count > 0 ? it.accent : 'var(--theme-elevation-450)' }}>
              {it.count}
            </span>
          </a>
        </li>
      ))}
      {imageTagEnabled && (
        <li className="dnj-insight__row dnj-insight__row--soon">
          <span className="dnj-insight__link" style={{ cursor: 'default' }}>
            <span className="dnj-insight__icon" style={tint(BRAND.stone)}><Icon name="tag" /></span>
            <span className="dnj-insight__body">
              <span className="dnj-insight__label">Auto Image Tagging</span>
              <span className="dnj-insight__hint">AI vision — akan aktif di phase 4.58.x setelah provider di-wire.</span>
            </span>
            <span className="dnj-insight__count dnj-insight__count--muted">Soon</span>
          </span>
        </li>
      )}
    </ul>
  </section>
)

const TopPerformingWidget = ({
  provider, showViews, showInquiries, title,
}: { provider: 'none' | 'own' | 'ga'; showViews: boolean; showInquiries: boolean; title: string }) => (
  <section className="dnj-toppf" aria-label={title}>
    <div className="dnj-panel__title">
      <Icon name="trending" /> {title}
      <span className="dnj-insight__badge">
        {provider === 'none' ? 'Setup required' : provider === 'own' ? 'Own counter' : 'Google Analytics'}
      </span>
    </div>
    {provider === 'none' ? (
      <div className="dnj-toppf__empty">
        <p className="dnj-toppf__msg">
          Widget ini akan menampilkan destinasi / service dgn {showViews && showInquiries ? 'views + inquiries' : showViews ? 'views' : 'inquiries'} tertinggi.
          Pilih Analytics Provider di <a href="/admin/globals/site-features">Pengaturan Fitur → Dashboard Widgets</a> untuk mengaktifkan.
        </p>
        <p className="dnj-toppf__hint">
          <code>own</code> = beacon frontend + counter di DB (phase 4.58.1). <code>ga</code> = Google Analytics 4 Data API (phase 4.58.2).
        </p>
      </div>
    ) : (
      <div className="dnj-toppf__empty">
        <p className="dnj-toppf__msg">Provider <strong>{provider === 'own' ? 'Own counter' : 'Google Analytics'}</strong> dipilih, tapi tracker belum di-wire (phase 4.58.{provider === 'own' ? '1' : '2'}).</p>
      </div>
    )}
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

  // ── Stats: SEMUA role, registry keyed by slug — Phase 4.58.1 configurable
  const [pages, destinations, categories, media, serviceCounts, users, toursCount, accCount, waterCount, yachtCount, restCount] = await Promise.all([
    safeCount(payload, 'pages'),
    safeCount(payload, 'destinations'),
    safeCount(payload, 'categories'),
    safeCount(payload, 'media'),
    Promise.all(SERVICE_COLLECTIONS.map((s) => safeCount(payload, s))),
    isSuper ? safeCount(payload, 'users') : Promise.resolve(0),
    safeCount(payload, 'tours'),
    safeCount(payload, 'accommodations'),
    safeCount(payload, 'water-activities'),
    safeCount(payload, 'yachts'),
    safeCount(payload, 'restaurants'),
  ])
  const services = serviceCounts.reduce((a, b) => a + b, 0)
  const STAT_REGISTRY: Record<string, Stat> = {
    pages:            { key: 'pages',            label: 'Pages',            value: pages,        accent: BRAND.ocean, icon: 'pages',    href: '/admin/collections/pages' },
    destinations:     { key: 'destinations',     label: 'Destinations',     value: destinations, accent: BRAND.coral, icon: 'map',      href: '/admin/collections/destinations' },
    categories:       { key: 'categories',       label: 'Categories',       value: categories,   accent: BRAND.stone, icon: 'category', href: '/admin/collections/categories' },
    services:         { key: 'services',         label: 'Services',         value: services,     accent: BRAND.leaf,  icon: 'services', href: '/admin/collections/tours' /* aggregated → tours as anchor */ },
    media:            { key: 'media',            label: 'Media',            value: media,        accent: BRAND.coral, icon: 'image',    href: '/admin/collections/media' },
    users:            { key: 'users',            label: 'Users',            value: users,        accent: BRAND.ocean, icon: 'users',    href: '/admin/collections/users' },
    tours:            { key: 'tours',            label: 'Tours',            value: toursCount,   accent: BRAND.leaf,  icon: 'compass',  href: '/admin/collections/tours' },
    accommodations:   { key: 'accommodations',   label: 'Accommodations',   value: accCount,     accent: BRAND.ocean, icon: 'bed',      href: '/admin/collections/accommodations' },
    'water-activities': { key: 'water-activities', label: 'Water Activities', value: waterCount, accent: BRAND.coral, icon: 'wave',    href: '/admin/collections/water-activities' },
    yachts:           { key: 'yachts',           label: 'Yachts',           value: yachtCount,   accent: BRAND.stone, icon: 'anchor',   href: '/admin/collections/yachts' },
    restaurants:      { key: 'restaurants',      label: 'Restaurants',      value: restCount,    accent: BRAND.coral, icon: 'utensils', href: '/admin/collections/restaurants' },
  }
  const DEFAULT_STAT_KEYS = ['pages', 'destinations', 'categories', 'services', 'media', 'users']

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
  const recentAll = recents // sliced later based on configured limit

  // ── Quick access — Phase 4.58.1 registry (keyed by slug) ────
  // Super-admin bisa memilih apa yang tampil untuk Admin & Editor via
  // SiteFeatures.dashboardWidgets.quickAccessAdmin/Editor. Super sendiri
  // tetap dapat set lengkap (tak dibatasi CMS toggle).
  const ACTION_REGISTRY: Record<string, Action> = {
    pages:              { key: 'pages',              title: 'Pages',              href: '/admin/collections/pages',              accent: BRAND.ocean, icon: 'pages' },
    tours:              { key: 'tours',              title: 'Tours',              href: '/admin/collections/tours',              accent: BRAND.leaf,  icon: 'compass' },
    accommodations:     { key: 'accommodations',     title: 'Accommodations',     href: '/admin/collections/accommodations',     accent: BRAND.ocean, icon: 'bed' },
    'water-activities': { key: 'water-activities',   title: 'Water Activities',   href: '/admin/collections/water-activities',   accent: BRAND.coral, icon: 'wave' },
    yachts:             { key: 'yachts',             title: 'Yachts',             href: '/admin/collections/yachts',             accent: BRAND.stone, icon: 'anchor' },
    restaurants:        { key: 'restaurants',        title: 'Restaurants',        href: '/admin/collections/restaurants',        accent: BRAND.coral, icon: 'utensils' },
    venues:             { key: 'venues',             title: 'Venues',             href: '/admin/collections/venues',             accent: BRAND.leaf,  icon: 'building' },
    rentals:            { key: 'rentals',            title: 'Rentals',            href: '/admin/collections/rentals',            accent: BRAND.stone, icon: 'car' },
    spa:                { key: 'spa',                title: 'Spa',                href: '/admin/collections/spa',                accent: BRAND.leaf,  icon: 'flower' },
    'ferry-tickets':    { key: 'ferry-tickets',      title: 'Ferry Tickets',      href: '/admin/collections/ferry-tickets',      accent: BRAND.stone, icon: 'anchor' },
    destinations:       { key: 'destinations',       title: 'Destinations',       href: '/admin/collections/destinations',       accent: BRAND.coral, icon: 'map' },
    categories:         { key: 'categories',         title: 'Categories',         href: '/admin/collections/categories',         accent: BRAND.stone, icon: 'category' },
    menu:               { key: 'menu',               title: 'Menu',               href: '/admin/collections/menus',              accent: BRAND.ocean, icon: 'menu' },
    media:              { key: 'media',              title: 'Media',              href: '/admin/collections/media',              accent: BRAND.coral, icon: 'image' },
    users:              { key: 'users',              title: 'Users',              href: '/admin/collections/users',              accent: BRAND.ocean, icon: 'users' },
    'site-features':    { key: 'site-features',      title: 'Site Features',      href: '/admin/globals/site-features',          accent: BRAND.leaf,  icon: 'sliders' },
    'site-settings':    { key: 'site-settings',      title: 'Site Settings',      href: '/admin/globals/site-settings',          accent: BRAND.stone, icon: 'settings' },
  }
  const DEFAULT_ADMIN_ACTION_KEYS = ['pages', 'tours', 'accommodations', 'water-activities', 'yachts', 'restaurants', 'venues', 'rentals', 'spa', 'menu']
  const DEFAULT_EDITOR_ACTION_KEYS = ['pages', 'tours', 'accommodations', 'water-activities', 'yachts', 'restaurants', 'venues', 'rentals', 'spa', 'media']
  const superActions: Action[] = [
    { key: 'new-page',       title: 'New Page',        href: '/admin/collections/pages/create',        accent: BRAND.ocean, icon: 'plus' },
    { key: 'new-dest',       title: 'New Destination', href: '/admin/collections/destinations/create', accent: BRAND.coral, icon: 'map' },
    { key: 'new-cat',        title: 'New Category',    href: '/admin/collections/categories/create',   accent: BRAND.stone, icon: 'category' },
    ACTION_REGISTRY.menu,
    ACTION_REGISTRY.media,
    ACTION_REGISTRY.users,
    ACTION_REGISTRY['site-features'],
    ACTION_REGISTRY['site-settings'],
  ]

  const nodeVersion = typeof process !== 'undefined' ? process.version : undefined

  // ── Phase 4.58 + 4.58.1 + 4.58.2 — Dashboard Widgets config ─
  // Load semua toggle, pilihan array, DAN status modul layanan dari
  // SiteFeatures. Modul yg di-off = otomatis di-skip di Quick Access.
  // Kalau global belum ada (pre-migration) atau field kosong → pakai default
  // hardcoded (dashboard tampil sama seperti sebelum Phase 4.58).
  let widgetToggles = {
    smartInsightSeo: false,
    smartInsightImageTag: false,
    topPerformingViews: false,
    topPerformingInquiries: false,
    analyticsProvider: 'none' as 'none' | 'own' | 'ga',
    atAGlanceEnabled: true,
    atAGlanceClickable: true,
    atAGlanceStats: [] as string[],
    recentActivityEnabled: true,
    recentActivityLimit: 10,
    quickAccessAdmin: [] as string[],
    quickAccessEditor: [] as string[],
    systemHealthAdmin: [] as HealthKey[],
    systemHealthEditor: [] as HealthKey[],
    // Phase 4.58.3 — title overrides (empty string → fallback default)
    headerTitle: '',
    headerSubtitle: '',
    atAGlanceTitle: '',
    recentActivityTitle: '',
    quickAccessTitle: '',
    systemHealthTitle: '',
    smartInsightTitle: '',
    topPerformingTitle: '',
    analyticsCardTitle: '',
  }
  let siteModules: Record<string, boolean> = {}
  try {
    const sf = await payload.findGlobal({ slug: 'site-features' as any })
    siteModules = (sf as any)?.modules ?? {}
    const dw = (sf as any)?.dashboardWidgets
    if (dw) {
      widgetToggles = {
        smartInsightSeo: dw.smartInsightSeo !== false,
        smartInsightImageTag: dw.smartInsightImageTag === true,
        topPerformingViews: dw.topPerformingViews !== false,
        topPerformingInquiries: dw.topPerformingInquiries !== false,
        analyticsProvider: (dw.analyticsProvider ?? 'none') as 'none' | 'own' | 'ga',
        atAGlanceEnabled: dw.atAGlanceEnabled !== false,
        atAGlanceClickable: dw.atAGlanceClickable !== false,
        atAGlanceStats: Array.isArray(dw.atAGlanceStats) ? dw.atAGlanceStats : [],
        recentActivityEnabled: dw.recentActivityEnabled !== false,
        recentActivityLimit: Number(dw.recentActivityLimit ?? 10),
        quickAccessAdmin: Array.isArray(dw.quickAccessAdmin) ? dw.quickAccessAdmin : [],
        quickAccessEditor: Array.isArray(dw.quickAccessEditor) ? dw.quickAccessEditor : [],
        systemHealthAdmin: Array.isArray(dw.systemHealthAdmin) ? dw.systemHealthAdmin : [],
        systemHealthEditor: Array.isArray(dw.systemHealthEditor) ? dw.systemHealthEditor : [],
        headerTitle: String(dw.headerTitle ?? ''),
        headerSubtitle: String(dw.headerSubtitle ?? ''),
        atAGlanceTitle: String(dw.atAGlanceTitle ?? ''),
        recentActivityTitle: String(dw.recentActivityTitle ?? ''),
        quickAccessTitle: String(dw.quickAccessTitle ?? ''),
        systemHealthTitle: String(dw.systemHealthTitle ?? ''),
        smartInsightTitle: String(dw.smartInsightTitle ?? ''),
        topPerformingTitle: String(dw.topPerformingTitle ?? ''),
        analyticsCardTitle: String(dw.analyticsCardTitle ?? ''),
      }
    }
  } catch {
    /* pre-migration or read error — keep defaults */
  }

  // ── Phase 4.58.3 — resolve title dgn fallback ke default hardcoded
  const t = (custom: string, fallback: string) => (custom.trim() || fallback)
  const titles = {
    header:         t(widgetToggles.headerTitle,         'Overview'),
    atAGlance:      t(widgetToggles.atAGlanceTitle,      'At a glance'),
    recentActivity: t(widgetToggles.recentActivityTitle, 'Recent activity'),
    quickAccess:    t(widgetToggles.quickAccessTitle,    'Quick access'),
    smartInsight:   t(widgetToggles.smartInsightTitle,   'Smart Insight'),
    topPerforming:  t(widgetToggles.topPerformingTitle,  'Top Performing'),
    analyticsCard:  t(widgetToggles.analyticsCardTitle,  'Traffic & Performance'),
  }
  // Subtitle: template dgn `{name}` placeholder → replace runtime.
  const subtitleTemplate = widgetToggles.headerSubtitle.trim()
    || 'Welcome back, {name} — here’s what’s happening across your site.'
  const subtitle = subtitleTemplate.replace(/\{name\}/g, String(displayName))

  // ── Phase 4.58.2 — Filter service slugs yg modulnya di-off ─
  // Peta slug (di-share Quick Access & At A Glance) → ServiceModule key di
  // SiteFeatures.modules. Sama dgn `SERVICE_TYPE_TO_MODULE` di
  // apps/web/src/lib/features.ts.
  const SLUG_TO_MODULE: Record<string, string> = {
    tours: 'tours',
    accommodations: 'accommodations',
    'water-activities': 'waterActivities',
    yachts: 'yacht',
    restaurants: 'restaurants',
    venues: 'weddings',
    rentals: 'rentals',
    spa: 'spa',
    'ferry-tickets': 'ferryTickets',
  }
  const isModuleActive = (slug: string): boolean => {
    const modKey = SLUG_TO_MODULE[slug]
    if (!modKey) return true // non-service slug (pages/media/menu/dst) — selalu aktif
    return siteModules[modKey] !== false
  }

  // ── Resolve stats untuk At A Glance (Phase 4.58.1 → 4.58.2) ─
  // Config array kosong → default (Pages/Dest/Cat/Services/Media/Users).
  // Filter `users` untuk non-super. Modul yg di-off di SiteFeatures →
  // stat modul spesifik (tours/accommodations/dst) di-hide.
  // Cap 6 (guard walau CMS sudah maxRows 6).
  const selectedStatKeys = widgetToggles.atAGlanceStats.length > 0
    ? widgetToggles.atAGlanceStats
    : DEFAULT_STAT_KEYS
  const stats: Stat[] = selectedStatKeys
    .filter((k) => k !== 'users' || isSuper)
    .filter((k) => isModuleActive(k)) // hide stat untuk modul off
    .map((k) => STAT_REGISTRY[k])
    .filter((s): s is Stat => Boolean(s))
    .slice(0, 6)

  // ── Resolve Quick Access per role (Phase 4.58.1 → 4.58.2) ─
  // Super = superActions (hardcoded 8, tak difilter CMS).
  // Admin/Editor = pilih dari registry via array config; kalau kosong → default.
  // 4.58.2: modul layanan yg di-off di SiteFeatures.modules OTOMATIS di-hide
  // dari Quick Access — mencegah ambigu (icon service yg module-nya inactive).
  // Cap 12 icon supaya muat 1 baris di kolom `.dnj-col--main` (2fr).
  const QUICK_ACCESS_CAP = 12
  const resolveActions = (roleKey: 'admin' | 'editor'): Action[] => {
    const selected = roleKey === 'admin' ? widgetToggles.quickAccessAdmin : widgetToggles.quickAccessEditor
    const defaults = roleKey === 'admin' ? DEFAULT_ADMIN_ACTION_KEYS : DEFAULT_EDITOR_ACTION_KEYS
    const keys = selected.length > 0 ? selected : defaults
    return keys
      .filter(isModuleActive)
      .map((k) => ACTION_REGISTRY[k])
      .filter((a): a is Action => Boolean(a))
      .slice(0, QUICK_ACCESS_CAP)
  }
  const actions: Action[] = isSuper
    ? superActions
    : role === 'admin'
      ? resolveActions('admin')
      : resolveActions('editor')

  // ── Resolve System Health per role (Phase 4.58.1) ─────────
  // Super = full list (5 rows). Admin/Editor = via CMS config; empty → default.
  const DEFAULT_HEALTH_ADMIN: HealthKey[] = ['media', 'storage', 'payload', 'node', 'backup']
  const DEFAULT_HEALTH_EDITOR: HealthKey[] = ['media', 'storage']
  const healthKeys: HealthKey[] = isSuper
    ? DEFAULT_HEALTH_ADMIN
    : role === 'admin'
      ? (widgetToggles.systemHealthAdmin.length > 0 ? widgetToggles.systemHealthAdmin : DEFAULT_HEALTH_ADMIN)
      : (widgetToggles.systemHealthEditor.length > 0 ? widgetToggles.systemHealthEditor : DEFAULT_HEALTH_EDITOR)

  const showAtAGlance = widgetToggles.atAGlanceEnabled && stats.length > 0
  const showRecentActivity = widgetToggles.recentActivityEnabled
  const showSmartInsight = isAdminUp && widgetToggles.smartInsightSeo
  const showTopPerforming = isAdminUp && (widgetToggles.topPerformingViews || widgetToggles.topPerformingInquiries)
  const smartInsightItems: SmartInsightItem[] = showSmartInsight ? await buildSmartInsight(payload) : []

  // Trim recent list to configured limit
  const recentList = recentAll.slice(0, Math.max(3, Math.min(20, widgetToggles.recentActivityLimit)))

  // ══ Render ═══════════════════════════════════════════════
  return (
    <div className="dnj-dash">
      {/* Header — judul saja. Logo situs ada di breadcrumb top-bar (graphics.Icon). */}
      <div className="dnj-dash__head">
        <div>
          <h2 className="dnj-dash__title">{titles.header}</h2>
          <p className="dnj-dash__subtitle">{subtitle}</p>
        </div>
      </div>

      {role === 'editor' ? (
        /* ── EDITOR: stat row + quick access, Media Usage (horizontal), activity ── */
        <>
          {showAtAGlance && <StatRow stats={stats} clickable={widgetToggles.atAGlanceClickable} title={titles.atAGlance} />}
          <QuickAccess actions={actions} prominent title={titles.quickAccess} />
          <SystemHealth mediaCount={mediaCount} mediaSize={mediaSize} healthKeys={healthKeys} horizontal titleOverride={widgetToggles.systemHealthTitle} />
          {/* Site-wide: collections don't track an editor (no updatedBy field). */}
          {showRecentActivity && <RecentActivity recents={recentList} title={titles.recentActivity} />}
        </>
      ) : (
        /* ── ADMIN / SUPER-ADMIN ── */
        <>
          {showAtAGlance && <StatRow stats={stats} clickable={widgetToggles.atAGlanceClickable} title={titles.atAGlance} />}
          {(showSmartInsight || showTopPerforming) && (
            <div className="dnj-widgets">
              {showSmartInsight && (
                <SmartInsightWidget items={smartInsightItems} imageTagEnabled={widgetToggles.smartInsightImageTag} title={titles.smartInsight} />
              )}
              {showTopPerforming && (
                <TopPerformingWidget
                  provider={widgetToggles.analyticsProvider}
                  showViews={widgetToggles.topPerformingViews}
                  showInquiries={widgetToggles.topPerformingInquiries}
                  title={titles.topPerforming}
                />
              )}
            </div>
          )}
          <div className="dnj-cols">
            <div className="dnj-col dnj-col--main">
              <AnalyticsCard title={titles.analyticsCard} />
              <QuickAccess actions={actions} title={titles.quickAccess} />
            </div>
            <div className="dnj-col dnj-col--side">
              {showRecentActivity && <RecentActivity recents={recentList} title={titles.recentActivity} />}
            </div>
          </div>
          {/* System Health / Media Usage — memanjang horizontal di bawah. */}
          <SystemHealth
            mediaCount={mediaCount}
            mediaSize={mediaSize}
            nodeVersion={nodeVersion}
            healthKeys={healthKeys}
            horizontal
            titleOverride={widgetToggles.systemHealthTitle}
          />
        </>
      )}
    </div>
  )
}

export default DashboardStats
