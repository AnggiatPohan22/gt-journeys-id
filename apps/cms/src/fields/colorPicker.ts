/**
 * Reusable Payload field helper — text (hex) with ColorSwatchField Field
 * component. Value tetap disimpan sebagai string hex `#XXX` / `#XXXXXX`
 * → drop-in ke schema text existing tanpa migration.
 *
 * Phase 4.42 (Header) → dirancang untuk dipakai lagi di FooterSettings,
 * SiteSettings tema, atau field warna global lain.
 *
 * Contoh:
 *   colorPickerField('menuActiveColor', 'Active', 'Warna link halaman aktif.', '#1B3A4B', { access: { update: superAdminFieldAccess } })
 */
import type { TextField, FieldAccess } from 'payload'

// Phase 4.45 — dukung 3/4/6/8-digit hex (dgn alpha). `#RRGGBBAA` untuk
// warna dengan transparansi (mis. backdrop 60% alpha = `...99`).
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

export type ColorPickerOpts = {
  access?: { update?: FieldAccess }
  presets?: string[]
  width?: string
  /** Matikan alpha channel di picker (default true = alpha ON). */
  alpha?: boolean
}

export const colorPickerField = (
  name: string,
  label: string,
  description: string,
  swatchDefault: string,
  opts: ColorPickerOpts = {},
): TextField => ({
  name,
  type: 'text',
  label,
  access: opts.access,
  validate: (val) => {
    if (!val) return true // empty = fallback to system default
    return HEX_RE.test(String(val)) || 'Format harus hex, mis. #1B3A4B, #FFF, atau #1B3A4B99 (dgn alpha).'
  },
  admin: {
    description,
    width: opts.width,
    components: {
      Field: '/components/ColorSwatchField#default',
    },
    custom: {
      swatchDefault,
      presets: opts.presets ?? [],
      alpha: opts.alpha !== false,
    },
  },
})
