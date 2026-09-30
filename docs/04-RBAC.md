# 04 — RBAC (Role-Based Access Control)

> Sistem hak akses proyek **DnJourneysBali** — 3 role (Super Admin / Admin / Editor) yang diimplementasikan di Payload CMS 3.x. Semua aturan didefinisikan di [apps/cms/src/access/roles.ts](apps/cms/src/access/roles.ts) dan di-attach per koleksi/global/field.

---

## 1. Matriks Hak Akses Peran

Legenda: ✅ boleh · ❌ tidak boleh · ⚠️ terbatas (lihat keterangan).

### 1.1 Koleksi & Globals

| Fitur / Koleksi | Super Admin | Admin | Editor | Publik | Keterangan |
|---|---|---|---|---|---|
| **Users** — read | ✅ | ⚠️ | ⚠️ | ❌ | Read = semua user yang login (`authenticatedRead`). |
| **Users** — create | ✅ | ❌ | ❌ | ❌ | Hanya super admin bisa buat user baru. |
| **Users** — update | ✅ | ⚠️ | ⚠️ | ❌ | Admin/Editor hanya bisa update **dirinya sendiri**. Field `role` khusus super-admin. |
| **Users** — delete | ✅ | ❌ | ❌ | ❌ | |
| **Media** — read | ✅ | ✅ | ✅ | ✅ | Publik — file gambar dibutuhkan browser. |
| **Media** — create/upload | ✅ | ✅ | ✅ | ❌ | Semua user login boleh upload. |
| **Media** — update | ✅ | ✅ | ✅ | ❌ | |
| **Media** — delete | ✅ | ✅ | ❌ | ❌ | Editor tidak boleh hapus file. |
| **Pages** (halaman + block builder) — read | ✅ | ✅ | ✅ | ✅ | |
| **Pages** — **create** | ✅ | ❌ | ❌ | ❌ | Hanya super admin boleh **tambah halaman baru**. |
| **Pages** — update | ✅ | ✅ | ✅ | ❌ | Editor & Admin boleh edit isi halaman yang sudah ada. |
| **Pages** — delete | ✅ | ❌ | ❌ | ❌ | |
| **Menus** — read | ✅ | ✅ | ✅ | ✅ | |
| **Menus** — create/update/delete | ✅ | ❌ | ❌ | ❌ | Menu = struktur navigasi, super-admin only. |
| **Destinations** — read | ✅ | ✅ | ✅ | ✅ | |
| **Destinations** — create | ✅ | ✅ | ❌ | ❌ | |
| **Destinations** — update | ✅ | ✅ | ✅ | ❌ | Editor boleh edit destinasi existing. |
| **Destinations** — delete | ✅ | ❌ | ❌ | ❌ | |
| **Categories** — read | ✅ | ✅ | ✅ | ✅ | |
| **Categories** — create / update / delete | idem Destinations | | | | |
| **Destination Types** — read | ✅ | ✅ | ✅ | ✅ | Public read (Phase 3.23). |
| **Destination Types** — create / delete | ✅ | ❌ | ❌ | ❌ | Super-admin only. |
| **Destination Types** — update | ✅ | ⚠️ | ❌ | ❌ | Admin **hanya** saat toggle `destinationTypesEnabled` ON (soft-gate via async access baca SiteFeatures). Super-admin selalu. |
| **Tours, Accommodations, WaterActivities, Yachts, Restaurants, Venues, Rentals** — read | ✅ | ✅ | ✅ | ✅ | |
| Service — create | ✅ | ✅ | ❌ | ❌ | Editor tidak boleh tambah entry baru. |
| Service — update | ✅ | ✅ | ✅ | ❌ | Editor boleh edit entry existing. |
| Service — delete | ✅ | ❌ | ❌ | ❌ | |
| **Global `site-settings`** — update | ✅ | ❌ | ❌ | ❌ | Brand, kontak, WA defaults, footer copyright. |
| **Global `header-settings`** — update | ✅ | ❌ | ❌ | ❌ | Menu utama, CTA header. |
| **Global `footer-settings`** — update | ✅ | ❌ | ❌ | ❌ | Kolom footer. |
| **Global `site-features`** — update | ✅ | ❌ | ❌ | ❌ | Toggle modul/section/fitur — keputusan owner, bukan editor. |
| **Global `site-features`** — read | ✅ | ✅ | ✅ | ✅ | Publik: frontend butuh fetch tanpa auth. |
| **Bookings** — read/create/update | ✅ | ✅ | ❌ | ❌ | Public REST ditutup (Phase 4.62). Public checkout page write via API-key user (`/api/bookings/create`). |
| **Bookings** — delete | ✅ | ❌ | ❌ | ❌ | Super-admin only. |
| **Bookings** — confirmation page public | — | — | — | ⚠️ | Phase 4.66.5: `/checkout/…/confirmation/<ref>` butuh query `?t=<accessToken>` 128-bit yang match record. Ref saja tidak cukup — mencegah IDOR. |

### 1.2 Field-level & Fitur Khusus

| Fitur | Super Admin | Admin | Editor | Keterangan |
|---|---|---|---|---|
| Field `users.role` | ✅ | ❌ | ❌ | Hanya super-admin bisa mengubah role user lain. |
| Field `status` (draft/published) di semua service + destinations + categories + pages | ✅ | ✅ | ❌ | Editor tidak boleh **publish** — hanya edit isi. Guard: [fields/status.ts:14](apps/cms/src/fields/status.ts#L14) pakai `adminFieldAccess`. |
| Field `additionalBlocks` (Custom Sections) di setiap service | ✅ | ❌ | ❌ | Block extra di detail page — super-admin only. Guard: `superAdminFieldAccess`. |
| Field `bookings.passengers[].passportNumber` — update | ✅ | ❌ | ❌ | Phase 4.66.7: passport paling sensitif. Admin **read** (untuk ticketing) tapi tidak **update** — naik ke super-admin. |
| Upload file baru ke Media Library | ✅ | ✅ | ✅ | Semua login. |
| Hapus file Media | ✅ | ✅ | ❌ | |
| Module toggle (Global `site-features.modules.*`) | ✅ | ❌ | ❌ | Sudah di CMS via [SiteFeatures.ts](apps/cms/src/globals/SiteFeatures.ts). Update = super-admin only; effect butuh rebuild frontend (SSG). |
| Ubah block library / field schema | ❌ | ❌ | ❌ | Semua role — perlu developer (edit kode). |

<!-- GAP: belum ada control granular seperti "Editor tur X hanya boleh edit tur X" — semua service entry di-share level akses yang sama untuk semua Editor. Perlu owner/assignedTo field kalau butuh scoping. -->

---

## 2. Struktur Implementasi RBAC Saat Ini

### 2.1 Role di User Schema

File: [apps/cms/src/collections/Users.ts:29-44](apps/cms/src/collections/Users.ts#L29)

```ts
{
  name: 'role',
  type: 'select',
  required: true,
  defaultValue: 'editor',
  options: [
    { label: 'Editor', value: 'editor' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'super-admin' },
  ],
  access: {
    update: ({ req: { user } }) => user?.role === 'super-admin',
  },
  admin: {
    position: 'sidebar',
  },
}
```

Karakteristik:
- Enum tersimpan sebagai string di kolom `role` (SQLite TEXT).
- User baru default = `editor`.
- Field `role` sendiri di-guard: hanya super-admin boleh update — mencegah escalation privilege.

### 2.2 Shared Access Helpers

Semua fungsi RBAC ada di satu file — [apps/cms/src/access/roles.ts](apps/cms/src/access/roles.ts). Pola: **shared utility functions**, di-import per koleksi.

```ts
import type { Access, FieldAccess } from 'payload'

// ─── Role Checkers ───────────────────────────────────────
export const isEditor: Access = ({ req: { user } }) => !!user
export const isAdmin:  Access = ({ req: { user } }) =>
  !!user && ['admin', 'super-admin'].includes(user.role)
export const isSuperAdmin: Access = ({ req: { user } }) =>
  !!user && user.role === 'super-admin'

// ─── Collection-level Access ─────────────────────────────
export const authenticatedRead:  Access = ({ req: { user } }) => !!user
export const adminCreate:        Access = isAdmin
export const authenticatedUpdate: Access = ({ req: { user } }) => !!user
export const superAdminDelete:   Access = isSuperAdmin

// ─── Field-level Access ──────────────────────────────────
export const adminFieldAccess: FieldAccess = ({ req: { user } }) =>
  !!user && ['admin', 'super-admin'].includes(user.role)
export const superAdminFieldAccess: FieldAccess = ({ req: { user } }) =>
  !!user && user.role === 'super-admin'
```

### 2.3 Pola Pemakaian per Collection

**Pattern service collections** (Tours, Accommodations, WaterActivities, Yachts, Restaurants, Venues, Rentals):

```ts
// apps/cms/src/collections/Tours.ts:21
access: {
  read: () => true,              // publik — Astro fetch anonim
  create: adminCreate,           // admin+
  update: authenticatedUpdate,   // semua yg login
  delete: superAdminDelete,      // super-admin only
}
```

**Pages** ([Pages.ts:11](apps/cms/src/collections/Pages.ts#L11)):

```ts
access: {
  read: () => true,
  create: isSuperAdmin,          // ← tambah halaman = super-admin only
  update: authenticatedUpdate,
  delete: isSuperAdmin,
}
```

**Menus** ([Menus.ts:7](apps/cms/src/collections/Menus.ts#L7)) — super-admin only untuk mutasi apapun:

```ts
access: { read: () => true, create: isSuperAdmin, update: isSuperAdmin, delete: isSuperAdmin }
```

**Media** ([Media.ts:18](apps/cms/src/collections/Media.ts#L18)):

```ts
access: {
  read: () => true,              // publik — browser butuh URL image
  create: authenticatedRead,     // semua yg login
  update: authenticatedRead,
  delete: isAdmin,               // admin+ boleh hapus
}
```

**Users** ([Users.ts:11](apps/cms/src/collections/Users.ts#L11)) — self-update pattern:

```ts
access: {
  read: authenticatedRead,
  create: isSuperAdmin,
  update: ({ req: { user }, id }) => {
    if (!user) return false
    if (user.role === 'super-admin') return true
    return user.id === id           // user boleh update dirinya sendiri
  },
  delete: isSuperAdmin,
}
```

**Globals** (SiteSettings/HeaderSettings/FooterSettings) — semua:

```ts
access: { read: () => true, update: isSuperAdmin }
```

**Field-level examples:**

- Field `status` di [status.ts:13](apps/cms/src/fields/status.ts#L13):

  ```ts
  { name: 'status', type: 'select', options: [...],
    access: { update: adminFieldAccess } }
  ```

- Field `additionalBlocks` di setiap service (contoh [Tours.ts:200](apps/cms/src/collections/Tours.ts#L200)):

  ```ts
  {
    name: 'additionalBlocks', type: 'blocks',
    access: { update: superAdminFieldAccess },
    blocks,
  }
  ```

### 2.4 Ringkasan pola

- ✅ Shared helpers — DRY, semua rule di satu file.
- ✅ Collection-level (`access` object) + Field-level (`field.access`) dua-duanya dipakai.
- ⚠️ Belum ada **Admin UI-level hiding** (`admin.hidden`) berdasarkan role — semua role melihat semua koleksi di sidebar (kecuali submit-nya di-block). Lihat §3.c untuk cara pasang.
- ⚠️ Belum ada **row-level ownership** (e.g. "user hanya bisa edit entry yang dia buat").

---

## 3. Panduan Developer: Cara Membatasi Akses

### 3.a Collection-Level Access

Semua koleksi Payload menerima objek `access` dengan 4 kunci: `read`, `create`, `update`, `delete`. Setiap value = fungsi `Access` yang menerima `{ req, id, data }` dan return `boolean` atau **query filter** (untuk row-level).

**Contoh 1: Editor boleh Read/Update, tidak boleh Create/Delete**

```ts
// apps/cms/src/collections/BlogPosts.ts
import { authenticatedRead, adminCreate, authenticatedUpdate, superAdminDelete }
  from '../access/roles'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  access: {
    read: () => true,             // publik
    create: adminCreate,          // admin+ only
    update: authenticatedUpdate,  // editor+ boleh edit isi existing
    delete: superAdminDelete,     // super-admin only
  },
  fields: [ /* ... */ ],
}
```

**Contoh 2: Row-level — user hanya bisa edit entry yang dia buat sendiri**

```ts
access: {
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'super-admin') return true
    return { createdBy: { equals: user.id } }  // query filter
  },
}
```

Untuk pattern ini, tambahkan field `createdBy` yang di-set otomatis di `hooks.beforeChange`.

**Contoh 3: Guard berdasarkan status entry (mis. published entry tidak boleh dihapus editor)**

```ts
access: {
  delete: ({ req: { user }, id, data }) => {
    if (user?.role === 'super-admin') return true
    if (data?.status === 'published') return false
    return user?.role === 'admin'
  },
}
```

### 3.b Field-Level Access

Setiap field bisa punya `access: { read, create, update }`. Kalau `read` return false, field tidak dikirim ke client; kalau `update` false, field di-lock di admin.

**Contoh: Field `slug` hanya bisa diedit admin+**

```ts
{
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  access: {
    update: adminFieldAccess,        // editor tidak bisa ubah slug
  },
}
```

**Contoh: Field SEO group super-admin only**

```ts
{
  name: 'seo',
  type: 'group',
  access: {
    read: () => true,
    update: superAdminFieldAccess,
  },
  fields: [
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea', maxLength: 160 },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
  ],
}
```

**Contoh: Sembunyikan field internal dari Editor**

```ts
{
  name: 'internalNotes',
  type: 'textarea',
  access: {
    read: ({ req: { user } }) => user?.role !== 'editor',
    update: adminFieldAccess,
  },
  admin: {
    condition: (_, __, { user }) => user?.role !== 'editor',
  },
}
```

### 3.c Admin UI Access Control (Hide Sidebar Menu)

Payload punya `admin.hidden` di collection/global config — bisa function `(user) => boolean`.

**Contoh: Sembunyikan koleksi `users` dari Editor**

```ts
// apps/cms/src/collections/Users.ts
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System',
    hidden: ({ user }) => user?.role === 'editor',   // ← hide dari sidebar
  },
  // ... access, fields
}
```

**Contoh: Sembunyikan semua globals dari Editor**

```ts
// SiteSettings.ts
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'System',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: { read: () => true, update: isSuperAdmin },
  fields: [ /* ... */ ],
}
```

**Contoh: Hide Menus koleksi kecuali super-admin**

```ts
// Menus.ts
admin: {
  useAsTitle: 'name',
  group: 'Layout',
  hidden: ({ user }) => user?.role !== 'super-admin',
}
```

> ⚠️ **Penting**: `admin.hidden` hanya menyembunyikan di UI. Access rules di `access: { … }` tetap wajib — user tetap bisa hit REST API langsung. Selalu **defense in depth**.

### 3.d Menambah Role Baru

Contoh: menambah role `content-manager` (di antara editor dan admin — boleh create service, tapi tidak boleh delete atau ubah global).

**Langkah 1** — Tambah option di [Users.ts:32-36](apps/cms/src/collections/Users.ts#L32):

```ts
options: [
  { label: 'Editor', value: 'editor' },
  { label: 'Content Manager', value: 'content-manager' },  // ← baru
  { label: 'Admin', value: 'admin' },
  { label: 'Super Admin', value: 'super-admin' },
],
```

**Langkah 2** — Tambah role checker di [access/roles.ts](apps/cms/src/access/roles.ts):

```ts
export const isContentManager: Access = ({ req: { user } }) =>
  !!user && ['content-manager', 'admin', 'super-admin'].includes(user.role)

// Update helper existing yang perlu include role baru:
export const adminCreate: Access = ({ req: { user } }) =>
  !!user && ['content-manager', 'admin', 'super-admin'].includes(user.role)
```

**Langkah 3** — Update field-level guard yang relevan:

```ts
// fields/status.ts
export const adminFieldAccess: FieldAccess = ({ req: { user } }) =>
  !!user && ['content-manager', 'admin', 'super-admin'].includes(user.role)
```

**Langkah 4** — Regenerate types + migrate:

```bash
pnpm generate:types
pnpm dev:cms   # atau: payload migrate:create + payload migrate untuk produksi
```

**Langkah 5** — Update tipe user di kode yang men-cast `user.role` secara literal (grep untuk `super-admin`, `admin`, `editor`).

**Testing checklist (untuk role baru):**
- [ ] Login sebagai `content-manager` — sidebar menu sesuai expectation
- [ ] Coba create entry service — berhasil
- [ ] Coba delete entry service — gagal (403)
- [ ] Coba update `site-settings` — gagal
- [ ] Coba akses REST API langsung dgn token: `curl -H "Authorization: JWT <token>" /api/site-settings` (POST) — harus 403

---

## 4. Checklist Deployment & Testing RBAC

### 4.1 Sebelum Deploy Perubahan RBAC

- [ ] Semua fungsi `Access` return **boolean** atau **query filter** (bukan `undefined` — akan silently allow di beberapa case).
- [ ] Tidak ada koleksi tanpa `access` block — jika lupa, Payload default = **allow all authenticated**, tapi belum tentu itu yang diinginkan.
- [ ] Field sensitif (`role`, `status`, `additionalBlocks`, credentials, internal notes) sudah di-guard field-level.
- [ ] `admin.hidden` dipasang di koleksi/global yang tidak seharusnya kelihatan role tertentu — untuk UX bersih, tapi jangan andalkan ini sebagai security (defense in depth).
- [ ] `pnpm generate:types` sudah dijalankan setelah ubah field `role` (biar `user.role` union type di TS sesuai).
- [ ] Migrasi database sudah dijalankan (`payload migrate:create` + `payload migrate`).
- [ ] Test tiap role di staging sebelum production.

### 4.2 Cara Test Lokal per Role

1. Nyalakan CMS lokal:

   ```bash
   pnpm dev:cms
   ```

2. Buka `http://localhost:3030/admin`. Kalau pertama kali, buat super-admin.
3. Buat 2 user tambahan via admin panel (login sebagai super-admin dulu):
   - `admin@test.local` — role: Admin
   - `editor@test.local` — role: Editor
4. Logout, login satu per satu, verifikasi:

**Sebagai Editor (`editor@test.local`):**
- [ ] Sidebar TIDAK menampilkan menu "Users" (kalau `admin.hidden` sudah dipasang)
- [ ] Sidebar TIDAK menampilkan globals `site-settings`, `header-settings`, `footer-settings` (kalau hidden dipasang) — tapi tetap tidak bisa update (403 di REST)
- [ ] Buka koleksi Tours: bisa lihat list, bisa klik entry, bisa edit field content
- [ ] Field `status` — locked / readonly
- [ ] Field `additionalBlocks` (Custom Sections tab) — locked
- [ ] Tombol "Create New" di Tours — gagal / disabled (adminCreate = admin+)
- [ ] Tombol Delete di entry — gagal

**Sebagai Admin (`admin@test.local`):**
- [ ] Bisa Create + Update service entries di semua koleksi service
- [ ] Bisa toggle `status` draft ↔ published
- [ ] TIDAK bisa Delete entry (superAdminDelete)
- [ ] TIDAK bisa buat halaman baru di koleksi Pages (isSuperAdmin)
- [ ] TIDAK bisa ubah globals (site-settings/header/footer)
- [ ] TIDAK bisa Create user baru
- [ ] TIDAK bisa ubah field `additionalBlocks` (Custom Sections)

**Sebagai Super Admin:**
- [ ] Full CRUD semua koleksi termasuk Users
- [ ] Bisa buat halaman baru di Pages
- [ ] Bisa ubah semua globals
- [ ] Bisa ubah role user lain

### 4.3 Test via REST API (defense in depth)

`admin.hidden` cuma UI. Verifikasi rules asli:

```bash
# Login sebagai editor untuk dapat JWT
curl -X POST http://localhost:3030/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@test.local","password":"..."}'

# Coba create tour (harus 403)
curl -X POST http://localhost:3030/api/tours \
  -H "Authorization: JWT <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","slug":"test","destination":1}'

# Coba update site-settings (harus 403)
curl -X POST http://localhost:3030/api/globals/site-settings \
  -H "Authorization: JWT <token>" \
  -H "Content-Type: application/json" \
  -d '{"siteName":"Hacked"}'

# Coba escalate role (harus 403 pada field role)
curl -X PATCH http://localhost:3030/api/users/<own-id> \
  -H "Authorization: JWT <token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"super-admin"}'
```

### 4.4 Validasi akhir

- [ ] Editor tidak bisa akses halaman yang dibatasi (Users, Globals, Pages create)
- [ ] Admin tidak bisa manage users (create/delete)
- [ ] Super Admin punya full access (semua koleksi + globals + user)
- [ ] Module toggle — <!-- GAP: saat ini di file config, belum ada di CMS. Ketika di-CMS-kan, restrict update ke super-admin. -->
- [ ] Semua field sensitif (role, status, additionalBlocks) verified via REST API
- [ ] Log audit — <!-- GAP: belum ada hook `afterOperation` untuk audit trail perubahan RBAC. Rekomendasi Phase 4. -->

---

## Referensi silang

- Schema field lengkap tiap koleksi → [02-DATABASE-SCHEMA.md](docs/02-DATABASE-SCHEMA.md)
- Pemetaan siapa boleh apa dari sudut pandang content manager → [03-CONTENT-MODEL.md](docs/03-CONTENT-MODEL.md) §4
- File access helpers → [apps/cms/src/access/roles.ts](apps/cms/src/access/roles.ts)
