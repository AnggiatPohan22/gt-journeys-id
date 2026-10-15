# PROMPT 04 — RBAC.md

> **Copy-paste prompt ini ke Claude Code untuk generate `docs/04-RBAC.md`**

---

## Instruksi

Kamu adalah AI security architect yang sedang mendokumentasikan sistem RBAC proyek **DnJourneysBali**.

### Konteks Proyek
- **CMS**: Payload CMS 3.x di `apps/cms`
- **3 Role**: Super Admin, Admin, Editor
- **Aturan Akses**:
  - Editor & Admin: hanya bisa edit halaman/konten yang sudah ada (existing)
  - Super Admin: bisa tambah halaman baru, section baru, kelola user, dan pengaturan sistem
- **Module Toggle**: Beberapa modul bisa di-enable/disable — akses toggle ini harus dibatasi per role
- **Tujuan**: Template reusable untuk client travel agency lain — RBAC harus scalable

### Task

**Langkah 1 — AUDIT:**
Periksa implementasi RBAC dan manajemen pengguna di `apps/cms`:
- User collection config (role field, enum/select options)
- Access control functions di masing-masing collection dan global
- Field-level access control
- Admin UI visibility control

**Langkah 2 — GENERATE:**
Buatkan `docs/04-RBAC.md` berdasarkan audit tersebut.

### Konten Wajib

#### 1. MATRIKS HAK AKSES PERAN (Role Access Matrix)
Petakan 3 role utama dengan tabel matriks:

| Fitur / Koleksi / Section | Super Admin | Admin | Editor | Keterangan & Batasan |
|--------------------------|-------------|-------|--------|---------------------|

Jelaskan detail batasan operasional:
- Siapa boleh **mengedit** halaman existing?
- Siapa boleh **menambah** halaman atau section baru?
- Siapa punya akses ke **pengaturan global**, variabel sistem, atau **manajemen user**?
- Siapa boleh **menghapus** konten?
- Siapa boleh mengubah **module toggle** (enable/disable modul)?
- Siapa boleh mengakses **Media Library** dan upload file?

#### 2. STRUKTUR IMPLEMENTASI KODE RBAC SAAT INI
- Bagaimana role disimpan dalam schema User Payload CMS (field type, enum values)
- Lokasi file fungsi access control di `apps/cms`
- Pola yang digunakan: inline access functions vs shared utility functions
- Contoh kode access control yang sudah ada

#### 3. PANDUAN MANDIRI (Developer Guideline): CARA MEMBATASI HAK AKSES

a. **Collection-Level Access** (Membatasi akses ke seluruh koleksi):
   - Cara membatasi Read, Create, Update, Delete berdasarkan Role
   - Contoh: Editor hanya bisa Read/Update, tidak bisa Create/Delete
   - Snippet kode TypeScript Payload CMS yang valid

b. **Field-Level Access** (Membatasi akses per field):
   - Cara menyembunyikan field tertentu dari role tertentu
   - Contoh: field `slug`, `status`, `SEO metadata` hanya visible untuk Admin/Super Admin
   - Snippet kode

c. **Admin UI Access Control** (Menyembunyikan menu/navigasi):
   - Cara hide koleksi atau global dari sidebar Admin Panel berdasarkan role
   - Editor tidak melihat menu Settings, User Management, dll.
   - Snippet kode

d. **Menambah Role Baru di Masa Mendatang**:
   - Langkah menambah role baru ke type definition dan enum/select
   - Update access control functions
   - Testing checklist

#### 4. CHECKLIST DEPLOYMENT & TESTING RBAC
- Prosedur aman sebelum deploy perubahan RBAC ke production
- Cara menguji hak akses per role secara lokal (buat akun test per role)
- Checklist validasi:
  - [ ] Editor tidak bisa akses halaman yang dibatasi
  - [ ] Admin tidak bisa manage users
  - [ ] Super Admin punya full access
  - [ ] Module toggle hanya bisa diubah oleh role yang tepat

### Aturan Penulisan
1. **Wajib baca kode proyek dulu** — semua harus berdasarkan implementasi nyata
2. Ditulis dalam **Bahasa Indonesia** yang lugas
3. Snippet kode harus valid Payload CMS 3.x TypeScript
4. Jika RBAC belum diimplementasi di beberapa collection, catat sebagai `<!-- GAP: belum ada access control -->`
5. Hanya buat `docs/04-RBAC.md` — jangan ubah file lain
