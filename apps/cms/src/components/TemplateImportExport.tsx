'use client'
import React, { useRef, useState } from 'react'
import {
  validateExport,
  getTemplate,
  REGISTRY_ID,
  REGISTRY_VERSION,
  SCHEMA_VERSION,
  type TemplateKind,
  type TemplateExport,
} from '../../../../packages/shared/src/template-registry'

/**
 * TemplateImportExport — panel Export/Import config Header/Footer (Phase 3.24).
 * UI field yang tampil di halaman global. Menghasilkan/menerima file JSON PORTABLE
 * (ref relationship = slug, bukan id) → bisa dipakai di project Payload lain.
 *
 * custom: { slug: 'header-settings', kind: 'header' }
 */

// Deteksi objek relationship menu (punya slug + items[]) → ref portable {menuSlug}.
const isMenuObj = (v: any) => v && typeof v === 'object' && typeof v.slug === 'string' && Array.isArray(v.items)
const isMediaObj = (v: any) => v && typeof v === 'object' && typeof v.filename === 'string' && typeof v.mimeType === 'string'

const SYSTEM_KEYS = new Set(['id', 'globalType', 'createdAt', 'updatedAt', '_status'])

/** Ubah nilai populated → ref portable (rekursif). */
const toPortable = (val: any): any => {
  if (Array.isArray(val)) return val.map(toPortable)
  if (isMenuObj(val)) return { menuSlug: val.slug }
  if (isMediaObj(val)) return { mediaRef: val.filename }
  if (val && typeof val === 'object') {
    const out: any = {}
    for (const [k, v] of Object.entries(val)) {
      if (SYSTEM_KEYS.has(k)) continue
      out[k] = toPortable(v)
    }
    return out
  }
  return val
}

const TemplateImportExport: React.FC<any> = (props) => {
  const slug: string = props?.field?.admin?.custom?.slug ?? 'header-settings'
  const kind: TemplateKind = props?.field?.admin?.custom?.kind ?? 'header'
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<{ type: 'ok' | 'warn' | 'err'; msg: string }[]>([])

  const say = (type: 'ok' | 'warn' | 'err', msg: string) => setLog((l) => [...l, { type, msg }])

  // ── EXPORT ────────────────────────────────────────────────────────────
  const doExport = async () => {
    setBusy(true); setLog([])
    try {
      const res = await fetch(`/api/globals/${slug}?depth=1`, { credentials: 'include' })
      if (!res.ok) throw new Error(`GET gagal (${res.status})`)
      const data = await res.json()
      const content = toPortable(data)
      delete content.template
      const payload: TemplateExport = {
        schemaVersion: SCHEMA_VERSION,
        kind,
        templateId: data.template ?? '',
        registryId: REGISTRY_ID,
        registryVersion: REGISTRY_VERSION,
        exportedAt: new Date().toISOString(),
        exportedFrom: 'gtjourneysid',
        content,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-${data.template ?? 'template'}.json`
      a.click()
      URL.revokeObjectURL(url)
      say('ok', `Export berhasil: template "${data.template}".`)
    } catch (e: any) {
      say('err', `Export error: ${e?.message ?? e}`)
    } finally { setBusy(false) }
  }

  // Resolve ref portable → id lokal (rekursif). Warn kalau tak ketemu.
  const resolveRefs = async (val: any, warnings: string[]): Promise<any> => {
    if (Array.isArray(val)) return Promise.all(val.map((v) => resolveRefs(v, warnings)))
    if (val && typeof val === 'object') {
      if (typeof val.menuSlug === 'string') {
        const r = await fetch(`/api/menus?where[slug][equals]=${encodeURIComponent(val.menuSlug)}&limit=1&depth=0`, { credentials: 'include' })
        const j = await r.json().catch(() => ({}))
        const id = j?.docs?.[0]?.id
        if (!id) { warnings.push(`Menu "${val.menuSlug}" tidak ada di project ini — dilewati.`); return null }
        return id
      }
      if (typeof val.mediaRef === 'string') {
        const r = await fetch(`/api/media?where[filename][equals]=${encodeURIComponent(val.mediaRef)}&limit=1&depth=0`, { credentials: 'include' })
        const j = await r.json().catch(() => ({}))
        const id = j?.docs?.[0]?.id
        if (!id) { warnings.push(`Media "${val.mediaRef}" tidak ada — dilewati.`); return null }
        return id
      }
      const out: any = {}
      for (const [k, v] of Object.entries(val)) out[k] = await resolveRefs(v, warnings)
      return out
    }
    return val
  }

  // ── IMPORT ────────────────────────────────────────────────────────────
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setLog([])
    try {
      const parsed = JSON.parse(await file.text())
      const v = validateExport(parsed, kind)
      v.warnings.forEach((w) => say('warn', w))
      if (!v.ok) { v.errors.forEach((er) => say('err', er)); return }

      const tpl = getTemplate(parsed.templateId)!
      const warnings: string[] = []
      const resolvedContent = await resolveRefs(parsed.content ?? {}, warnings)
      warnings.forEach((w) => say('warn', w))

      // Hanya kirim slot yang didukung template + set template.
      const body: any = { template: parsed.templateId }
      for (const [k, val] of Object.entries(resolvedContent)) {
        if (tpl.slots.includes(k as any) || ['showBrandColumn', 'columns', 'showServicesColumn', 'servicesColumnLabel',
          'servicesMenu', 'showContactColumn', 'contactColumnLabel', 'showCtaButton', 'ctaText', 'ctaType',
          'ctaCustomLink', 'stickyOnScroll', 'transparentOnTop', 'primaryMenu', 'secondaryMenu', 'showSearch',
          'showSocialLinks', 'showNewsletter', 'legalLinks', 'bottomBarRightText', 'brandTaglineOverride',
          'showTopBarAddress', 'showTopBarPhone', 'topBarText'].includes(k)) {
          body[k] = val
        }
      }

      const res = await fetch(`/api/globals/${slug}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Simpan gagal (${res.status})`)
      say('ok', `Import berhasil → template "${parsed.templateId}". Muat ulang halaman…`)
      setTimeout(() => window.location.reload(), 1200)
    } catch (er: any) {
      say('err', `Import error: ${er?.message ?? er}`)
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ margin: '1.5rem 0', padding: 16, border: '1px solid var(--theme-elevation-150,#ddd)', borderRadius: 8 }}>
      <h4 style={{ margin: '0 0 4px' }}>Import / Export Template Config</h4>
      <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 12px' }}>
        File JSON portable (ref = slug) — bisa dipakai di project Payload lain dengan registry sama.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn--style-secondary" disabled={busy} onClick={doExport}>
          ⬇ Export JSON
        </button>
        <button type="button" className="btn btn--style-secondary" disabled={busy} onClick={() => fileRef.current?.click()}>
          ⬆ Import JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: 'none' }} />
      </div>
      {log.length > 0 && (
        <ul style={{ marginTop: 12, fontSize: 12, listStyle: 'none', padding: 0 }}>
          {log.map((l, i) => (
            <li key={i} style={{ color: l.type === 'err' ? '#c0392b' : l.type === 'warn' ? '#b8860b' : '#2e8b57', padding: '2px 0' }}>
              {l.type === 'err' ? '✖' : l.type === 'warn' ? '⚠' : '✓'} {l.msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TemplateImportExport
export { TemplateImportExport }
