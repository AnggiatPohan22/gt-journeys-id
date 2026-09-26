'use client'
/**
 * ServiceModulesManager — custom admin UI (Phase 4.61.2).
 *
 * Menggantikan tampilan field checkbox/select polos di tab Modul Layanan
 * dengan grid KARTU per service: tiap service = 1 box berisi ikon + nama,
 * toggle aktif, dan pemilih desain kartu (3 opsi visual: Compact / Detailed /
 * Ticket). Ke-3 opsi tampil untuk semua service.
 *
 * Data tetap di field bawaan `modules.<key>` (checkbox) & `modules.<key>Design`
 * (select) yang di-hidden di SiteFeatures.ts. Komponen ini membaca/menulisnya
 * lewat useField(path) — 0 perubahan schema/migration.
 */
import React from 'react'
import { useField } from '@payloadcms/ui'
import { SERVICE_MODULES, CARD_DESIGN_OPTIONS, type CardDesignValue } from '../config/serviceModules'

// ── Mini skema visual tiap desain (murni CSS, tanpa asset) ──
const DesignThumb: React.FC<{ design: CardDesignValue; active: boolean }> = ({ design, active }) => {
  const line = (w: string, h = 4) => (
    <div style={{ width: w, height: h, borderRadius: 2, background: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-400)' }} />
  )
  const box: React.CSSProperties = {
    width: 44, height: 34, borderRadius: 4, padding: 4, display: 'flex', gap: 3,
    background: active ? 'var(--theme-success-500, #2e8b57)' : 'var(--theme-elevation-100)',
    border: `1px solid ${active ? 'transparent' : 'var(--theme-elevation-200)'}`,
  }
  if (design === 'compact') {
    return (
      <div style={{ ...box, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 12, borderRadius: 2, background: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-300)' }} />
        {line('20px', 3)}
        {line('12px', 3)}
      </div>
    )
  }
  if (design === 'detailed') {
    return (
      <div style={{ ...box, flexDirection: 'column' }}>
        <div style={{ width: '100%', height: 12, borderRadius: 2, background: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-300)' }} />
        {line('80%', 3)}
        {line('55%', 3)}
      </div>
    )
  }
  // ticket — dua kolom + panah
  return (
    <div style={{ ...box, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{line('12px', 3)}{line('8px', 3)}</div>
      <span style={{ fontSize: 10, color: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-400)' }}>→</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>{line('12px', 3)}{line('8px', 3)}</div>
    </div>
  )
}

const ServiceModuleCard: React.FC<{ name: string; label: string; icon: string }> = ({ name, label, icon }) => {
  const { value: enabled, setValue: setEnabled } = useField<boolean>({ path: `modules.${name}` })
  const { value: design, setValue: setDesign } = useField<string>({ path: `modules.${name}Design` })
  const isOn = enabled !== false

  return (
    <div
      style={{
        border: `1px solid ${isOn ? 'var(--theme-elevation-200)' : 'var(--theme-elevation-150)'}`,
        borderRadius: 10,
        padding: 14,
        background: isOn ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-50)',
        opacity: isOn ? 1 : 0.72,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'opacity .15s ease',
      }}
    >
      {/* Header: icon + label + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden>{icon}</span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9rem', color: 'var(--theme-text)' }}>{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={`${isOn ? 'Nonaktifkan' : 'Aktifkan'} ${label}`}
          onClick={() => setEnabled(!isOn)}
          style={{
            width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
            background: isOn ? 'var(--theme-success-500, #2e8b57)' : 'var(--theme-elevation-300)',
            display: 'flex', justifyContent: isOn ? 'flex-end' : 'flex-start', alignItems: 'center',
            transition: 'background .15s ease',
          }}
        >
          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.25)' }} />
        </button>
      </div>

      {/* Design picker — tampil hanya saat aktif */}
      {isOn ? (
        <div style={{ display: 'flex', gap: 8 }}>
          {CARD_DESIGN_OPTIONS.map((opt) => {
            const active = (design ?? '') === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                title={opt.desc}
                aria-pressed={active}
                onClick={() => setDesign(opt.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                  border: `1.5px solid ${active ? 'var(--theme-success-500, #2e8b57)' : 'var(--theme-elevation-200)'}`,
                  background: active ? 'var(--theme-success-50, rgba(46,139,87,.08))' : 'var(--theme-elevation-0)',
                }}
              >
                <DesignThumb design={opt.value} active={active} />
                <span style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 500, color: 'var(--theme-text)' }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--theme-elevation-400)' }}>Modul non-aktif — aktifkan untuk memilih desain kartu.</p>
      )}
    </div>
  )
}

const ServiceModulesManager: React.FC = () => {
  return (
    <div className="field-type" style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 14,
        }}
      >
        {SERVICE_MODULES.map((m) => (
          <ServiceModuleCard key={m.name} name={m.name} label={m.label} icon={m.icon} />
        ))}
      </div>
      <p style={{ margin: '14px 0 0', fontSize: '0.75rem', color: 'var(--theme-elevation-500)', lineHeight: 1.5 }}>
        <strong>Card design</strong> berlaku site-wide untuk listing service tsb.
        <br />
        <em>Ticket</em> = kartu rute (Origin → Arrival), cocok untuk ferry/transport.
        Untuk service non-rute, Ticket akan tampil sebagai Compact sampai didukung.
      </p>
    </div>
  )
}

export default ServiceModulesManager
