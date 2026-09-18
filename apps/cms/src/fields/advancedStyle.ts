import type { Field } from 'payload'
import { colorPickerField } from './colorPicker'
import type { TextElement } from './textStyle'

/**
 * Reusable "Advanced" tab builder untuk block CMS.
 *
 * Phase 4.55 — refactor besar dari flat `Field[]` (v1) jadi function
 * `(opts) => Field[]` (v2). Sekarang layout Advanced tab konsisten di semua
 * 22 block:
 *
 *   Row 1 (visible):    padding · alignment · container width
 *   Row 2 (visible):    entry animation
 *   Row 3 (collapsed):  Background (50%)         · Button (50%, opsional)
 *   Row 4 (collapsed):  Text Styles (50%)        · Padding Override (50%)
 *   Row 5 (collapsed):  Spacing Override (50%, alone)
 *
 * 5 field warna (background/button/textColor + per-text heading/subheading/dst)
 * pakai `colorPickerField` dgn `compact: true` (swatch + hex text di bawah,
 * description → tooltip "?" di label, tanpa hex input inline). Value tetap
 * string di kolom `text` existing → 0 migration.
 *
 * BACKWARD COMPAT DATA: value token slug lama (`"coral"`, `"ocean"`, `"inherit"`)
 * tetap disimpan sbg-nya. Frontend `blockStyles.ts` deteksi hex vs slug (dual-
 * mode) → slug map ke Tailwind class, hex render inline `style`.
 *
 * BACKWARD COMPAT PEMAKAIAN: dulu blocks pakai `...advancedStyleFields`
 * (spread flat array). Sekarang `advancedStyleFields({ textElements: [...] })`
 * (function call). Panggil tanpa options → default no text styles.
 */

// Theme palette hex — mirror `apps/web/tailwind.config.mjs`.
const THEME_PRESETS = [
  '#1B3A4B', // ocean
  '#E07A5F', // coral
  '#6B9080', // leaf
  '#F5F0E8', // sand
  '#3D405B', // stone
  '#0D1B2A', // midnight
  '#FFFFFF', // white
]

const spacingPresetOptions = [
  { label: 'None (0px)', value: 'none' },
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Spacious', value: 'spacious' },
  { label: 'Custom (set pixel value)', value: 'custom' },
]

const textAnimInOptions = [
  { label: 'Inherit (from block Advanced)', value: 'inherit' },
  { label: 'None (no animation)', value: 'none' },
  { label: 'Fade', value: 'fade' },
  { label: 'Fade Up', value: 'fade-up' },
  { label: 'Fade Down', value: 'fade-down' },
  { label: 'Zoom In', value: 'zoom' },
  { label: 'Slide from Left', value: 'slide-left' },
  { label: 'Slide from Right', value: 'slide-right' },
  { label: 'Blur In', value: 'blur' },
]

// ── Layout row (padding · alignment · container width) ────────────
const layoutRow: Field = {
  type: 'row',
  fields: [
    {
      name: 'sectionPadding',
      type: 'select',
      defaultValue: 'normal',
      admin: { width: '34%', description: 'Vertical padding section.' },
      options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Normal', value: 'normal' },
        { label: 'Spacious', value: 'spacious' },
      ],
    },
    {
      name: 'contentAlignment',
      type: 'select',
      defaultValue: 'center',
      admin: { width: '33%', description: 'Perataan konten.' },
      options: [
        { label: '⇤ Left', value: 'left' },
        { label: '⇔ Center', value: 'center' },
        { label: '⇥ Right', value: 'right' },
      ],
    },
    {
      name: 'containerWidth',
      type: 'select',
      defaultValue: 'normal',
      admin: { width: '33%', description: 'Lebar max konten.' },
      options: [
        { label: 'Full (edge to edge)', value: 'full' },
        { label: 'Wide (~1280px)', value: 'wide' },
        { label: 'Normal (~1024px)', value: 'normal' },
        { label: 'Narrow (~768px)', value: 'narrow' },
      ],
    },
  ],
}

// Phase 4.56 — Entry animation dijalankan lewat IntersectionObserver saat
// section mendekati viewport (bukan lagi @keyframes-on-load). Speed dipisah
// jadi field sendiri, default 'normal' (900ms). Nama field `entrySpeed` &
// `entryDurMs` SENGAJA pendek supaya identifier enum di postgres/drizzle
// tetap < 63 char pada table terpanjang (mis. water_activities_blocks_featured_post).
const entryAnimationRow: Field = {
  type: 'row',
  fields: [
    {
      name: 'entryAnimation',
      type: 'select',
      defaultValue: 'reveal',
      admin: { width: '50%', description: 'Animasi masuk section saat mendekati viewport.' },
      options: [
        { label: 'Fade Up (reveal, default)', value: 'reveal' },
        { label: 'Fade In', value: 'fade' },
        { label: 'Zoom In', value: 'zoom' },
        { label: 'Slide from Left', value: 'slide-left' },
        { label: 'Slide from Right', value: 'slide-right' },
        { label: 'None', value: 'none' },
      ],
    },
    {
      name: 'entrySpeed',
      label: 'Entry Animation Speed',
      type: 'select',
      defaultValue: 'normal',
      admin: {
        width: '50%',
        description: 'Kecepatan animasi masuk.',
        condition: (_, s) => s?.entryAnimation && s.entryAnimation !== 'none',
      },
      options: [
        { label: 'Slow (1500ms)', value: 'slow' },
        { label: 'Normal (900ms, default)', value: 'normal' },
        { label: 'Fast (500ms)', value: 'fast' },
        { label: 'Custom (isi ms di bawah)', value: 'custom' },
      ],
    },
  ],
}

const entryAnimationCustomField: Field = {
  name: 'entryDurMs',
  label: 'Entry Animation Duration (ms)',
  type: 'number',
  min: 100,
  max: 5000,
  defaultValue: 900,
  admin: {
    description: 'Durasi custom (ms) — hanya berlaku kalau Speed = Custom.',
    condition: (_, s) => s?.entrySpeed === 'custom' && s?.entryAnimation && s.entryAnimation !== 'none',
  },
}

// ── Background collapsible (compact color picker) ─────────────────
const buildBackgroundCollapsible = (): Field => ({
  type: 'collapsible',
  label: 'Background',
  admin: {
    initCollapsed: true,
    width: '50%',
    description: 'Background section — default (theme), solid color (hex bebas), atau image.',
  },
  fields: [
    {
      name: 'background',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default (theme)', value: 'default' },
            { label: 'Solid Color', value: 'color' },
            { label: 'Image', value: 'image' },
          ],
        },
        colorPickerField(
          'color',
          'Background Color',
          'Pilih dari palette theme atau isi hex bebas. Value existing (mis. "coral") tetap terpakai.',
          '#1B3A4B',
          { presets: THEME_PRESETS, compact: true },
        ),
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { condition: (_, s) => s?.type === 'image' },
        },
        {
          name: 'overlayOpacity',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 40,
          admin: {
            condition: (_, s) => s?.type === 'image',
            description: 'Overlay hitam di atas image (0-100%). Buat teks terbaca.',
          },
        },
      ],
    },
  ],
})

// ── Button collapsible (compact) ──────────────────────────────────
const buildButtonCollapsible = (): Field => ({
  type: 'collapsible',
  label: 'Button (CTA)',
  admin: { initCollapsed: true, width: '50%', description: 'Styling CTA button. Kosongkan kalau block tanpa button.' },
  fields: [
    {
      name: 'button',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'variant',
              type: 'select',
              defaultValue: 'solid',
              admin: { width: '50%' },
              options: [
                { label: 'Solid', value: 'solid' },
                { label: 'Outline', value: 'outline' },
                { label: 'Ghost (transparent)', value: 'ghost' },
              ],
            },
            {
              name: 'radius',
              type: 'select',
              defaultValue: 'rounded',
              admin: { width: '50%' },
              options: [
                { label: 'Sharp', value: 'sharp' },
                { label: 'Rounded', value: 'rounded' },
                { label: 'Pill', value: 'pill' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            colorPickerField(
              'color',
              'Button Color',
              'Bg (solid) atau border+text (outline/ghost). Default coral.',
              '#E07A5F',
              { presets: THEME_PRESETS, width: '50%', compact: true },
            ),
            colorPickerField(
              'textColor',
              'Text Color',
              'Warna teks button. Kosongkan = auto-kontras dari button color.',
              '#FFFFFF',
              { presets: THEME_PRESETS, width: '50%', compact: true },
            ),
          ],
        },
        {
          name: 'hoverAnimation',
          type: 'select',
          defaultValue: 'scale',
          options: [
            { label: 'Scale up', value: 'scale' },
            { label: 'Fade', value: 'fade' },
            { label: 'Slide underline', value: 'underline' },
            { label: 'None', value: 'none' },
          ],
        },
      ],
    },
  ],
})

// ── Text Styles collapsible (compact per-element color picker) ────
// `elements` = ['heading'], ['heading','subheading'], ['paragraph'], dst.
const buildTextStylesCollapsible = (elements: TextElement[]): Field => ({
  type: 'collapsible',
  label: 'Text Styles',
  admin: { initCollapsed: true, width: '50%', description: 'Warna & animasi per-element text.' },
  fields: [
    {
      // Short group name (`ts`) — jaga <63-char identifier di postgres/drizzle.
      name: 'ts',
      type: 'group',
      label: 'Text Styles',
      fields: elements.flatMap((el) => [
        {
          type: 'row' as const,
          fields: [
            colorPickerField(
              `${el}Color`,
              `${el.charAt(0).toUpperCase()}${el.slice(1)} Color`,
              `Warna ${el}. Kosongkan = inherit theme/block.`,
              '#FFFFFF',
              { presets: THEME_PRESETS, width: '50%', compact: true },
            ),
            {
              name: `${el}AnimIn`,
              type: 'select' as const,
              defaultValue: 'inherit',
              options: textAnimInOptions,
              admin: { width: '50%', description: `Animasi masuk ${el}.` },
            },
          ],
        },
      ]),
    },
  ],
})

// ── Padding Override collapsible ──────────────────────────────────
const padOverrideCollapsible: Field = {
  type: 'collapsible',
  label: 'Padding Override',
  admin: { initCollapsed: true, width: '50%', description: 'Override padding internal top/bottom block ini. Default OFF = pakai global.' },
  fields: [
    {
      name: 'pad',
      label: 'Padding Override (internal)',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'Enable Padding Override' },
        {
          type: 'row',
          admin: { condition: (_, s) => s?.enabled === true },
          fields: [
            { name: 'top', type: 'select', label: 'Top', defaultValue: 'inherit', admin: { width: '50%' }, options: [
              { label: 'Inherit (pakai global)', value: 'inherit' },
              { label: 'None (0)', value: 'none' },
              { label: 'Compact (~32/48)', value: 'compact' },
              { label: 'Normal (~48/64)', value: 'normal' },
              { label: 'Spacious (~80/96)', value: 'spacious' },
              { label: 'Custom (isi px)', value: 'custom' },
            ]},
            { name: 'bottom', type: 'select', label: 'Bottom', defaultValue: 'inherit', admin: { width: '50%' }, options: [
              { label: 'Inherit (pakai global)', value: 'inherit' },
              { label: 'None (0)', value: 'none' },
              { label: 'Compact (~32/48)', value: 'compact' },
              { label: 'Normal (~48/64)', value: 'normal' },
              { label: 'Spacious (~80/96)', value: 'spacious' },
              { label: 'Custom (isi px)', value: 'custom' },
            ]},
          ],
        },
        {
          type: 'row',
          admin: { condition: (_, s) => s?.enabled === true && (s?.top === 'custom' || s?.bottom === 'custom') },
          fields: [
            { name: 'topMobPx', type: 'number', label: 'Top Mobile (px)', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.top === 'custom' } },
            { name: 'topDeskPx', type: 'number', label: 'Top Desktop (px)', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.top === 'custom' } },
            { name: 'btmMobPx', type: 'number', label: 'Bottom Mobile (px)', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.bottom === 'custom' } },
            { name: 'btmDeskPx', type: 'number', label: 'Bottom Desktop (px)', min: 0, max: 400, admin: { width: '25%', condition: (_, s) => s?.bottom === 'custom' } },
          ],
        },
      ],
    },
  ],
}

// ── Spacing Override collapsible ──────────────────────────────────
const spacingOverrideCollapsible: Field = {
  type: 'collapsible',
  label: 'Spacing Override',
  admin: { initCollapsed: true, width: '50%', description: 'Override margin block terhadap block sekitar. Default OFF = ikut global.' },
  fields: [
    {
      name: 'spacingOverride',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'Enable Spacing Override' },
        {
          type: 'row',
          admin: { condition: (_, s) => s?.enabled === true },
          fields: [
            { name: 'mt', type: 'select', label: 'Margin Top', admin: { width: '50%' }, options: spacingPresetOptions },
            { name: 'mb', type: 'select', label: 'Margin Bottom', admin: { width: '50%' }, options: spacingPresetOptions },
          ],
        },
        {
          type: 'row',
          admin: { condition: (_, s) => s?.enabled === true },
          fields: [
            { name: 'topPx', type: 'number', label: 'Custom Top (px)', min: 0, max: 500, admin: { width: '50%', condition: (_, s) => s?.mt === 'custom' } },
            { name: 'btmPx', type: 'number', label: 'Custom Bottom (px)', min: 0, max: 500, admin: { width: '50%', condition: (_, s) => s?.mb === 'custom' } },
          ],
        },
      ],
    },
  ],
}

export type AdvancedFieldsOpts = {
  /** Element text yang punya per-element style control (heading, paragraph, dst). Kosong = skip Text Styles section. */
  textElements?: TextElement[]
  /**
   * Hilangkan Background collapsible (mis. block yg pakai kolom bg custom di
   * legacy schema). Menggantikan `.filter(f => f.name !== 'background')` lama.
   */
  omitBackground?: boolean
}

const buildAdvancedRows = (opts: AdvancedFieldsOpts, withButton: boolean): Field[] => {
  const textElements = opts.textElements ?? []
  const hasTextStyles = textElements.length > 0

  const bg = opts.omitBackground ? null : buildBackgroundCollapsible()
  const btn = withButton ? buildButtonCollapsible() : null
  const ts = hasTextStyles ? buildTextStylesCollapsible(textElements) : null

  // Susun row1 (50/50) prefer bg+btn kalau ada. Kalau tak ada button, bg+ts.
  // Selebihnya di row 2/3 supaya semua 50/50 dan tidak ada yang mepet.
  const collapsibles = [bg, btn, ts, padOverrideCollapsible, spacingOverrideCollapsible].filter(
    (f): f is Field => f !== null,
  )

  const rows: Field[] = []
  for (let i = 0; i < collapsibles.length; i += 2) {
    const pair = collapsibles.slice(i, i + 2)
    rows.push({ type: 'row', fields: pair })
  }
  return rows
}

/**
 * Advanced tab fields WITH button styling.
 *
 * @example
 *   fields: advancedStyleFields({ textElements: ['heading', 'subheading'] })
 */
export const advancedStyleFields = (opts: AdvancedFieldsOpts = {}): Field[] => [
  layoutRow,
  entryAnimationRow,
  entryAnimationCustomField,
  ...buildAdvancedRows(opts, true),
]

/**
 * Advanced tab fields TANPA button (utk block tanpa CTA: Image, Gallery, dst).
 */
export const advancedStyleFieldsNoButton = (opts: AdvancedFieldsOpts = {}): Field[] => [
  layoutRow,
  entryAnimationRow,
  entryAnimationCustomField,
  ...buildAdvancedRows(opts, false),
]
