# CLAUDE.md — Pointer file untuk Claude Code

Project **DnJourneysBali** memakai [AGENTS.md](AGENTS.md) sebagai master rule untuk semua AI agent (termasuk Claude Code). File ini hanya pointer ringkas.

## Baca dulu

- **[AGENTS.md](AGENTS.md)** — master rules: struktur monorepo, deploy scheme, collection pattern, RBAC, design system, git workflow, phase reporting.
- **[docs/PROGRESS.md](docs/PROGRESS.md)** — timeline keseluruhan proyek + status fase saat ini.
- **[docs/phases/](docs/phases/)** — detail per phase. Setiap task baru = 1 file di sini.

## Aturan phase reporting

Setiap perintah user yang menghasilkan code change / schema change / deploy change wajib menghasilkan file `docs/phases/phase-<N>-*.md` sesuai template di AGENTS.md §14.

## Aturan khusus Security 🔒

Semua pekerjaan yang berkaitan dengan **security** (audit, hardening, patch CVE, pengetatan RBAC, CSP, rate-limit, secret rotation, access control, dsb.) **selain** phase report standar, juga wajib menambahkan entri garis-besar di:

👉 **[docs/08-SECURITY-PATCH.md](docs/08-SECURITY-PATCH.md)** — master log security

Konvensi:
- 1 phase = 1 baris di tabel series.
- 1 series security baru = 1 section baru (ikuti template di akhir file tersebut).
- File ini **index saja** — detail tetap di phase report. Jangan duplikasi isi.
- Status: ✅ selesai · ⏳ menunggu action manual · ⚠️ interim · 📋 reported · ❌ rolled back.

Alasan: developer baru (atau audit berkala) harus bisa cek dalam satu file "proteksi apa saja yang sudah terpasang + di mana" tanpa scroll PROGRESS.md yang bercampur dengan pekerjaan UI/content.

## Konvensi direktori docs

| File | Isi |
|---|---|
| `docs/00-PROJECT-OVERVIEW.md` | Overview tingkat atas |
| `docs/01-ARCHITECTURE.md` | Arsitektur monorepo + Cloudflare |
| `docs/02-DATABASE-SCHEMA.md` | ERD + per-collection schema |
| `docs/03-CONTENT-MODEL.md` | CMS content model + block system |
| `docs/04-RBAC.md` | Access control matrix |
| `docs/05-INFRA.md` | Deploy + env + secrets |
| `docs/06-MAINTENANCE-RUNBOOK.md` | Operasional day-to-day |
| `docs/07-DECISION-LOG.md` | ADR arsitektur |
| **`docs/08-SECURITY-PATCH.md`** | **Master security log (baru, Phase 4.66+)** |
| `docs/PROGRESS.md` | Timeline keseluruhan |
| `docs/phases/*.md` | Detail per phase |

## Yang tidak boleh dilakukan tanpa approval

Lihat AGENTS.md §11 — ringkas: schema change, install package baru, perubahan deploy config, rename collection/field, perubahan access control, delete file/feature existing — selalu konfirmasi dulu.
