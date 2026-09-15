# Phase 4.42 — Color Swatch Picker + CTA Button Shape

**Status:** ✅ Code complete · ✅ Migration applied local · ⏳ Owner UAT
**Branch:** `feature/phase4-polish-launch`
**Scope:** Ganti 9 text-hex-input di Header Settings → Advanced dengan visual **ColorSwatchField** (swatch + popover HexColorPicker + hex input). Tambah **CTA button shape** (pill / rounded / rounded-md / square). Field & helper dirancang **reusable** — dipakai lagi di FooterSettings/SiteSettings/global lain lewat 1-baris config.

## Motivasi (owner request)

> "Untuk pemilihan warna itu bisa memilih warna seperti di gambar, jadi developer tidak perlu ketik hex … dan sudah ada langsung display warna tersebut di CMS. Lalu untuk CTA Button Colors saya mau ada juga di situ untuk Superadmin memilih mode button-nya, jadi dia bisa atur untuk bulatan lingkaran button. Saya mau pemilihan Colors dan tampilan button ini reusable dan future."

## Perubahan

### 1. New reusable Field component

[`apps/cms/src/components/ColorSwatchField.tsx`](../../apps/cms/src/components/ColorSwatchField.tsx) — client component. Pakai `useField` Payload untuk read/write value string hex. UI:

- Swatch button 38×38 (fill = current value; kalau kosong → checker-pattern di atas default).
- Hex text input inline (validasi visual: border merah kalau format salah).
- Tombol **Reset** kalau ada value (clear → frontend fallback ke default template).
- Popover: `react-colorful` **HexColorPicker** (SV rectangle + hue slider) + **HexColorInput**. ESC / outside-click tutup.
- Optional `presets` chip (via `admin.custom.presets`) — belum dipakai di Header, siap untuk konsumen lain.

Value tetap string hex → **drop-in** ke kolom `text` existing, **0 migration** untuk swap dari text-input biasa ke picker.

### 2. New reusable field helpers

- [`apps/cms/src/fields/colorPicker.ts`](../../apps/cms/src/fields/colorPicker.ts) — `colorPickerField(name, label, description, swatchDefault, opts?)` mengembalikan `TextField` config yang sudah wire `admin.components.Field: '/components/ColorSwatchField#default'` + validate hex + `admin.custom.swatchDefault`. Opts: `access.update`, `presets`, `width` (row layout).
- [`apps/cms/src/fields/buttonStyle.ts`](../../apps/cms/src/fields/buttonStyle.ts) — `buttonStyleFields({namePrefix, access, ...})` mengembalikan array field style tombol. Sekarang berisi `<prefix>Radius` (select: pill / rounded / rounded-md / square). Export juga `BUTTON_RADIUS_CSS` (mapping `preset → CSS value`), dipakai frontend untuk konsistensi.

### 3. Header Settings — Advanced tab dirapikan

- 9 warna override lama dan CTA shape baru sekarang dibuild lewat helper — 1 baris per field.
- Layout row: 3 kolom warna per grup (menu, CTA colors) → visualnya jauh lebih rapi & scannable.
- Grup "CTA Button Colors" diganti judulnya jadi **"CTA Button Colors & Shape"** karena sekarang isinya warna + shape selector.

### 4. Migration

[`apps/cms/src/migrations/20260915_043455.ts`](../../apps/cms/src/migrations/20260915_043455.ts) — `ALTER TABLE header_settings ADD advanced_cta_radius text DEFAULT 'pill'`. Reversible. Applied batch 11.

### 5. Frontend

`HeaderRenderer.astro` menambah:
```ts
const CTA_RADIUS_CSS = { pill: '9999px', rounded: '12px', 'rounded-md': '6px', square: '0px' }
const ctaRadius = CTA_RADIUS_CSS[adv.ctaRadius ?? 'pill'] ?? '9999px'
// → --h-cta-radius diset di style header
```
`<style is:global>` di renderer nambah `.dnj-cta { border-radius: var(--h-cta-radius, 9999px) }`.
Templates T1/T3: Tailwind `rounded-full` di element `.dnj-cta` dihapus (biar var yang kontrol). Logo `rounded-full` (avatar) tetap.

## Non-impact

- Value hex existing (kalau ada yang di-set sebelum Phase 4.42) tetap bekerja — schema kolom sama.
- Field baru (`ctaRadius`) default `'pill'` → look tombol identik dengan sebelumnya. Zero visual regression tanpa tweak.
- Kalau field `ctaRadius` di-set kosong lewat manual DB → renderer fallback `'pill'` juga. Aman.

## Files touched

- **New:** `apps/cms/src/components/ColorSwatchField.tsx`, `apps/cms/src/fields/colorPicker.ts`, `apps/cms/src/fields/buttonStyle.ts`, `apps/cms/src/migrations/20260915_043455.ts` + `.json`, `docs/phases/phase-4.42-color-swatch-and-button-style.md`
- **Modified:** `apps/cms/src/globals/HeaderSettings.ts`, `apps/cms/src/migrations/index.ts`, `apps/cms/src/app/(payload)/admin/importMap.js` (auto), `apps/web/src/components/navigation/HeaderRenderer.astro`, `apps/web/src/components/navigation/templates/HeaderTemplate1.astro`, `apps/web/src/components/navigation/templates/HeaderTemplate3.astro`, `packages/shared/src/types/payload-types.ts` (regen), `apps/cms/package.json` (`react-colorful` +1)

## Rekomendasi rollout ke project lain (jawab pertanyaan owner)

Rendah risiko, tinggi reuse. Pola:

1. **Import helper** di global manapun:
   ```ts
   import { colorPickerField } from '../fields/colorPicker'
   import { buttonStyleFields } from '../fields/buttonStyle'
   ```
2. **Ganti** `type: 'text'` warna lama:
   ```ts
   colorPickerField('primaryBrand', 'Primary Brand', 'Warna dominan.', '#1B3A4B', { access: saAccess })
   ```
3. **Wire var** di frontend template konsumen — mirror pattern `HeaderRenderer.astro` (baca `advanced.*`, fallback default, serialize jadi inline `style`).

Kandidat berikutnya:
- **FooterSettings** — warna newsletter CTA + link footer.
- **PromoBanner** — bg/text/CTA warna.
- **AnnouncementBar** — sudah punya theme select; bisa opsional custom color.
- **SiteSettings tema** — kalau nanti ada global brand palette.

Zero schema-level rebuild yang dibutuhkan untuk warna (kolom `text` existing kompatibel). Untuk button shape butuh migration 1 kolom (`text` enum-as-string default `'pill'`).

## UAT checklist

1. Login **super-admin** → Header Settings → tab **Advanced** → tiap field warna sekarang punya **swatch + hex input + tombol picker**.
2. Klik swatch → popover SV + hue slider muncul. Drag di area SV → hex text ikut update live. Klik outside / ESC → tutup.
3. Klik **Reset** pada field yang ada nilai → nilai hilang, swatch berubah ke checker + default. Frontend fallback ke warna default template.
4. Tambah **CTA button shape** → dropdown 4 opsi (Pill / Rounded / Rounded-md / Square). Pilih **Square** → Save → refresh frontend → tombol CTA jadi sudut siku.
5. Login **admin (non-SA)** → tab Advanced masih tidak terlihat (perilaku Phase 4.41 dipertahankan).
6. Frontend sanity: header CTA radius berubah sesuai pilihan tanpa mengganggu ukuran/padding.
