import type { Field } from 'payload'

/**
 * Reusable advanced styling field group — dipakai sebagai "Advanced" tab
 * di block yang butuh custom bg/button/padding/animation.
 *
 * Semua nilai select terikat design tokens di apps/web/tailwind.config.mjs
 * (ocean/coral/leaf/sand/stone/midnight) — TIDAK bikin sistem warna baru
 * lepas dari palette existing.
 *
 * Emoji chip di label = hint visual warna approx. Untuk swatch chip presisi,
 * upgrade ke custom admin Field component (follow-up).
 *
 * Semua field opsional dengan default aman → block instance tanpa Advanced
 * tab config tetap render sesuai theme.
 */

const colorTokenOptions = [
  { label: '◽ Default (theme)', value: 'default' },
  { label: '🟨 Sand (warm cream)', value: 'sand' },
  { label: '🟦 Ocean (primary teal)', value: 'ocean' },
  { label: '🟧 Coral (accent orange)', value: 'coral' },
  { label: '🟩 Leaf (secondary green)', value: 'leaf' },
  { label: '🟪 Stone (neutral dark)', value: 'stone' },
  { label: '⬛ Midnight (darkest)', value: 'midnight' },
  { label: '⬜ White', value: 'white' },
]

const textColorOptions = [
  { label: '◽ Default (auto contrast)', value: 'default' },
  { label: '🟦 Ocean', value: 'ocean' },
  { label: '⬜ White', value: 'white' },
  { label: '🟪 Stone', value: 'stone' },
  { label: '🟧 Coral', value: 'coral' },
]

// Button styling field group — extracted supaya block yg tidak punya CTA
// (Image, Gallery) bisa pakai advancedStyleFieldsNoButton tanpa button.
const buttonStyleField: Field = {
  name: 'button',
  type: 'group',
  admin: {
    description: 'Styling primary button (CTA). Kosongkan kalau block tidak punya button.',
  },
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
          name: 'color',
          type: 'select',
          defaultValue: 'coral',
          admin: { width: '50%' },
          options: colorTokenOptions.filter((o) => o.value !== 'default'),
        },
      ],
    },
    {
      type: 'row',
      fields: [
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
        {
          name: 'hoverAnimation',
          type: 'select',
          defaultValue: 'scale',
          admin: { width: '50%' },
          options: [
            { label: 'Scale up', value: 'scale' },
            { label: 'Fade', value: 'fade' },
            { label: 'Slide underline', value: 'underline' },
            { label: 'None', value: 'none' },
          ],
        },
      ],
    },
    {
      name: 'textColor',
      type: 'select',
      defaultValue: 'default',
      admin: { description: 'Warna teks button. Default = auto kontras dari button color.' },
      options: textColorOptions,
    },
  ],
}

// Spacing presets — shared between sectionPadding and spacingOverride margin selects.
const spacingPresetOptions = [
  { label: 'None (0px)', value: 'none' },
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Spacious', value: 'spacious' },
  { label: 'Custom (set pixel value)', value: 'custom' },
]

// Common fields (layout + animation + background) — dipakai di kedua variant.
const commonAdvancedFields: Field[] = [
  // ── Layout row: padding + alignment + container width ─────
  {
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
        admin: { width: '33%', description: 'Perataan konten (heading, teks, CTA).' },
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
        admin: { width: '33%', description: 'Lebar max konten di dalam section.' },
        options: [
          { label: 'Full (edge to edge)', value: 'full' },
          { label: 'Wide (~1280px)', value: 'wide' },
          { label: 'Normal (~1024px)', value: 'normal' },
          { label: 'Narrow (~768px)', value: 'narrow' },
        ],
      },
    ],
  },

  // ── Entry animation (scroll reveal) ───────────────────────
  {
    name: 'entryAnimation',
    type: 'select',
    defaultValue: 'reveal',
    admin: { description: 'Animasi masuk section saat mendekati viewport.' },
    options: [
      { label: 'Fade Up (reveal, default)', value: 'reveal' },
      { label: 'Fade In', value: 'fade' },
      { label: 'Zoom In', value: 'zoom' },
      { label: 'Slide from Left', value: 'slide-left' },
      { label: 'Slide from Right', value: 'slide-right' },
      { label: 'None', value: 'none' },
    ],
  },

  // ── Background group ─────────────────────────────────────
  {
    name: 'background',
    type: 'group',
    admin: { description: 'Background section (default = theme bg dari block).' },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'select',
            defaultValue: 'default',
            admin: { width: '50%' },
            options: [
              { label: 'Default (theme)', value: 'default' },
              { label: 'Solid Color', value: 'color' },
              { label: 'Image', value: 'image' },
            ],
          },
          {
            name: 'color',
            type: 'select',
            admin: {
              width: '50%',
              condition: (_, siblingData) => siblingData?.type === 'color',
            },
            options: colorTokenOptions,
          },
        ],
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        admin: { condition: (_, siblingData) => siblingData?.type === 'image' },
      },
      {
        name: 'overlayOpacity',
        type: 'number',
        min: 0,
        max: 100,
        defaultValue: 40,
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'image',
          description: 'Overlay hitam opacity di atas image (0-100, default 40%). Buat teks terbaca.',
        },
      },
    ],
  },

  // ── Padding Override (Phase 4.24 Part 2) ─────────────────────
  // Override internal top/bottom padding untuk block ini. Default OFF =
  // pakai global SiteSettings.layout.blockPadding. Nama field pendek (`pad`)
  // supaya total table+column name (mis water_activities_blocks_stats_banner_
  // pad_top_desk_px) tetap di bawah 63-char limit Drizzle.
  {
    name: 'pad',
    label: 'Padding Override (internal)',
    type: 'group',
    admin: { description: 'Override padding internal (top/bottom) block ini. Default OFF = pakai global Block Padding.' },
    fields: [
      { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'Enable Padding Override' },
      {
        type: 'row',
        admin: { condition: (_: any, s: any) => s?.enabled === true },
        fields: [
          { name: 'top',    type: 'select', label: 'Top',    defaultValue: 'inherit', admin: { width: '50%', description: '"Inherit" = ikut global.' }, options: [
            { label: 'Inherit (pakai global)', value: 'inherit' },
            { label: 'None (0)', value: 'none' },
            { label: 'Compact (~32/48)', value: 'compact' },
            { label: 'Normal (~48/64)', value: 'normal' },
            { label: 'Spacious (~80/96)', value: 'spacious' },
            { label: 'Custom (isi px di bawah)', value: 'custom' },
          ]},
          { name: 'bottom', type: 'select', label: 'Bottom', defaultValue: 'inherit', admin: { width: '50%' }, options: [
            { label: 'Inherit (pakai global)', value: 'inherit' },
            { label: 'None (0)', value: 'none' },
            { label: 'Compact (~32/48)', value: 'compact' },
            { label: 'Normal (~48/64)', value: 'normal' },
            { label: 'Spacious (~80/96)', value: 'spacious' },
            { label: 'Custom (isi px di bawah)', value: 'custom' },
          ]},
        ],
      },
      {
        type: 'row',
        admin: { condition: (_: any, s: any) => s?.enabled === true && (s?.top === 'custom' || s?.bottom === 'custom') },
        fields: [
          { name: 'topMobPx',  type: 'number', label: 'Top Custom Mobile (px)',  min: 0, max: 400, admin: { width: '25%', condition: (_: any, s: any) => s?.top === 'custom' } },
          { name: 'topDeskPx', type: 'number', label: 'Top Custom Desktop (px)', min: 0, max: 400, admin: { width: '25%', condition: (_: any, s: any) => s?.top === 'custom' } },
          { name: 'btmMobPx',  type: 'number', label: 'Bottom Custom Mobile (px)',  min: 0, max: 400, admin: { width: '25%', condition: (_: any, s: any) => s?.bottom === 'custom' } },
          { name: 'btmDeskPx', type: 'number', label: 'Bottom Custom Desktop (px)', min: 0, max: 400, admin: { width: '25%', condition: (_: any, s: any) => s?.bottom === 'custom' } },
        ],
      },
    ],
  },

  // ── Spacing Override (Phase 4.22) ────────────────────────────
  {
    name: 'spacingOverride',
    type: 'group',
    admin: { description: 'Override jarak (margin) block ini terhadap block sebelum/sesudahnya. Default OFF = ikut global Block Gap.' },
    fields: [
      { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'Enable Spacing Override' },
      {
        type: 'row',
        admin: { condition: (_: any, s: any) => s?.enabled === true },
        fields: [
          { name: 'mt', type: 'select', label: 'Margin Top', admin: { width: '50%' }, options: spacingPresetOptions },
          { name: 'mb', type: 'select', label: 'Margin Bottom', admin: { width: '50%' }, options: spacingPresetOptions },
        ],
      },
      {
        type: 'row',
        admin: { condition: (_: any, s: any) => s?.enabled === true },
        fields: [
          { name: 'topPx', type: 'number', label: 'Custom Top (px)', min: 0, max: 500, admin: { width: '50%', condition: (_: any, s: any) => s?.mt === 'custom' } },
          { name: 'btmPx', type: 'number', label: 'Custom Bottom (px)', min: 0, max: 500, admin: { width: '50%', condition: (_: any, s: any) => s?.mb === 'custom' } },
        ],
      },
    ],
  },

]

// Full advanced fields (with button styling) — untuk Hero, CTA, dan block
// lain yg punya CTA button.
export const advancedStyleFields: Field[] = [
  ...commonAdvancedFields,
  buttonStyleField,
]

// Advanced fields tanpa button — untuk Image, Gallery, dan block yg
// tidak punya CTA button.
export const advancedStyleFieldsNoButton: Field[] = [...commonAdvancedFields]
