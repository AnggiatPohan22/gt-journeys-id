'use client'
/**
 * Phase 4.61.6 — Location Port info panel (Ferry Tickets, Tab 3).
 *
 * Read-only `ui` field yang menampilkan preview peta pelabuhan asal
 * (Origin Location) di dalam edit view Ferry Tickets. Data sepenuhnya
 * dibaca dari relationship `originLocation` (collections/Locations) —
 * tidak ada state form yang di-write dari sini.
 *
 * Fallback UX:
 *  - Origin belum di-set     → hint pilih Origin Location di Overview
 *  - Origin belum punya map  → link ke edit lokasi + instruksi
 *  - Origin punya map        → iframe embed + tombol "Open in Google Maps"
 */
import React, { useEffect, useState } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

type LocationDoc = {
  id: string | number
  name?: string
  terminalName?: string
  mapEmbedUrl?: string
  mapLink?: string
  timezone?: string
}

const LocationPortInfo: React.FC = () => {
  const [fields] = useAllFormFields()
  const originField = (fields as any)?.originLocation
  const originId = originField?.value ?? null

  const [loc, setLoc] = useState<LocationDoc | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!originId) {
      setLoc(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setErr(null)
    fetch(`/api/locations/${originId}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (!cancelled) setLoc(data as LocationDoc)
      })
      .catch((e) => {
        if (!cancelled) setErr(e?.message ?? 'Gagal memuat lokasi.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [originId])

  const wrapStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px dashed rgba(0,0,0,0.15)',
    borderRadius: 6,
    background: 'rgba(0,0,0,0.02)',
  }

  if (!originId) {
    return (
      <div style={wrapStyle}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>
          Belum ada <b>Origin Location</b>. Pilih di TAB <b>Overview → Description</b> untuk menampilkan
          peta pelabuhan di sini.
        </p>
      </div>
    )
  }

  if (loading) return <div style={wrapStyle}><p style={{ margin: 0, fontSize: 13 }}>Memuat lokasi…</p></div>
  if (err) return <div style={wrapStyle}><p style={{ margin: 0, fontSize: 13, color: '#c00' }}>Error: {err}</p></div>
  if (!loc) return null

  const editHref = `/admin/collections/locations/${loc.id}`
  const hasEmbed = !!loc.mapEmbedUrl
  const linkHref = loc.mapLink || loc.mapEmbedUrl || null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.8 }}>
        Origin: <b>{loc.name}</b>
        {loc.terminalName ? <> — {loc.terminalName}</> : null}
        {loc.timezone ? <> · <code>{loc.timezone}</code></> : null}
        {' · '}
        <a href={editHref} target="_blank" rel="noreferrer">Edit lokasi ini</a>
      </div>

      {hasEmbed ? (
        <>
          <div style={{ position: 'relative', paddingBottom: '45%', height: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
            <iframe
              src={loc.mapEmbedUrl!}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              title={`Map: ${loc.name}`}
            />
          </div>
          {linkHref && (
            <a href={linkHref} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
              Open in Google / Apple Maps ↗
            </a>
          )}
        </>
      ) : (
        <div style={wrapStyle}>
          <p style={{ margin: 0, fontSize: 13 }}>
            Lokasi <b>{loc.name}</b> belum punya <b>Map Embed URL</b>.{' '}
            <a href={editHref} target="_blank" rel="noreferrer">Isi di sini</a> — buka Google Maps →
            Share → <i>Embed a map</i> → copy nilai <code>src</code> dari iframe.
          </p>
        </div>
      )}
    </div>
  )
}

export default LocationPortInfo
