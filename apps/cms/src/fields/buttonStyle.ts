/**
 * Reusable Payload field helpers for button styling — Phase 4.42.
 *
 * Kontrak: setiap opsi = string yang dipakai frontend sebagai CSS custom
 * property (mis. `--h-cta-radius: 9999px`). Frontend memutuskan mapping
 * lewat lookup map (lihat HeaderRenderer.astro).
 *
 * Dirancang untuk dipakai lagi di FooterSettings CTA, Popup CTA, dsb.
 */
import type { Field, FieldAccess } from 'payload'

export const BUTTON_RADIUS_OPTIONS = [
  { label: 'Pill (fully rounded)',   value: 'pill' },
  { label: 'Rounded (12px)',          value: 'rounded' },
  { label: 'Rounded medium (6px)',    value: 'rounded-md' },
  { label: 'Square',                  value: 'square' },
] as const

export type ButtonRadiusValue = typeof BUTTON_RADIUS_OPTIONS[number]['value']

/** Map preset → nilai CSS `border-radius`. Diekspor supaya frontend bisa pakai persis pemetaan yang sama. */
export const BUTTON_RADIUS_CSS: Record<ButtonRadiusValue, string> = {
  pill: '9999px',
  rounded: '12px',
  'rounded-md': '6px',
  square: '0px',
}

export type ButtonStyleOpts = {
  access?: { update?: FieldAccess }
  namePrefix?: string        // default '' (langsung `radius`) — pakai `cta` jadi `ctaRadius`
  radiusLabel?: string
  radiusDescription?: string
  defaultRadius?: ButtonRadiusValue
}

/**
 * Kumpulan field style tombol. Sekarang hanya `<prefix>Radius` (select).
 * Nanti kalau perlu bisa tambah size/weight/uppercase — bentuk kontrak
 * & mapping-nya sudah kepake. Kembalikan array supaya bisa spread ke
 * `fields:`.
 */
export const buttonStyleFields = (opts: ButtonStyleOpts = {}): Field[] => {
  const prefix = opts.namePrefix ?? ''
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const fieldName = prefix ? `${prefix}Radius` : 'radius'
  return [
    {
      name: fieldName,
      type: 'select',
      label: opts.radiusLabel ?? `${prefix ? capitalize(prefix) + ' ' : ''}Button shape`,
      defaultValue: opts.defaultRadius ?? 'pill',
      options: [...BUTTON_RADIUS_OPTIONS],
      access: opts.access,
      admin: {
        description: opts.radiusDescription
          ?? 'Bentuk sudut tombol. Layout theme tetap; hanya radius yang berubah.',
      },
    },
  ]
}
