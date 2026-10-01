# 08 — SECURITY PATCH LOG

> Master log untuk **semua pekerjaan security** di proyek **DnJourneysBali**. Satu entri per series/phase, dari discovery → mitigation → verification. Developer baru buka file ini untuk tahu "apa saja yang sudah di-hardening dan dari mana" tanpa harus scroll PROGRESS.md yang bercampur dengan pekerjaan UI/content/CMS.
>
> **Lokasi file terkait:**
> - Detail per-step: `docs/phases/phase-<N>-*.md`
> - Timeline keseluruhan proyek (bukan hanya security): [docs/PROGRESS.md](PROGRESS.md)
> - Decision log arsitektur: [docs/07-DECISION-LOG.md](07-DECISION-LOG.md)
> - RBAC rules: [docs/04-RBAC.md](04-RBAC.md)
> - Infra & secret handling: [docs/05-INFRA.md](05-INFRA.md)

---

## Konvensi pengisian

Setiap kali ada perintah user yang menyentuh security (audit, hardening, penambahan proteksi, patch CVE, perubahan access control, dsb.), **wajib**:

1. Jalankan task sebagai phase bernomor di [`docs/phases/phase-<N>-*.md`](phases/) (sesuai aturan AGENTS.md §14).
2. Tambah entri garis-besar di file ini (section "Patch series" di bawah) — satu baris per phase, dengan severity, finding ID (kalau ada), link ke phase report, status.
3. **Tidak** menduplikasi isi phase report ke sini — file ini index saja. Kalau isi phase diperbaharui, update ringkasan baris di sini bila diperlukan.
4. Setelah entri ditambahkan, catat juga di [docs/PROGRESS.md](PROGRESS.md) seperti phase biasa.

Severity vocab (match standar industri):
- **Critical** — eksploit remote tanpa auth, atau akses penuh ke sistem/data pelanggan.
- **High** — eksploit yang perlu kondisi tertentu tapi langsung berdampak PII / integrity / availability.
- **Medium** — defense-in-depth, hardening, misconfigurasi tanpa path eksploit langsung.
- **Low** — hygiene, dokumentasi, cosmetic. Mengurangi serangan masa depan.

---

## Patch series

### Phase 4.66 — Checkout Security Hardening (2026-09-30)

**Context:** Audit pertama terhadap checkout flow Ferry Ticket (Select Trip → Passenger Info → Confirmation → WhatsApp). Belum ada payment gateway. Target: pastikan PII customer (nama, email, WA, passport, dsb.) tidak bocor, tidak dapat ditebak orang luar, dan arsitektur siap untuk gateway nanti.

**Baseline audit:** [phase-4.66-security-patch-v0.1.md](phases/phase-4-polish-launch/security-patch/phase-4.66-security-patch-v0.1.md) — 13 findings (1 Critical, 4 High, 5 Medium, 3 Low).

**Status series:** 11 sub-phase code+docs selesai, 1 docs wrap-up, 1 debt tracking. Branch `fix/checkout-security` menunggu merge + deploy.

| # | Finding | Severity | Phase report | Ringkas | Status |
|---|---|---|---|---|---|
| S-01 | `PAYLOAD_SECRET` di `wrangler.toml [vars]` (git-tracked) | Critical | [4.66.1](phases/phase-4-polish-launch/security-patch/phase-4.66.1-move-payload-secret.md) | Secret keluar dari file git, pindah ke `wrangler secret put` | ✅ code · ⏳ secret rotate menunggu deploy |
| S-05 | Payload admin cookie bisa dipakai cross-origin | High | [4.66.2](phases/phase-4-polish-launch/security-patch/phase-4.66.2-payload-csrf.md) | Tambah `csrf: [localhost, SITE_URL, SERVER_URL]` di payload config | ✅ |
| S-04 | Tidak ada security headers (CSP/XFO/HSTS/dll) | High | [4.66.3](phases/phase-4-polish-launch/security-patch/phase-4.66.3-security-headers.md) | `apps/web/public/_headers` baseline: CSP, X-Frame-Options SAMEORIGIN, HSTS 1yr preload, Referrer-Policy, Permissions-Policy, COOP, X-Robots-Tag noindex pada halaman checkout/confirmation | ✅ |
| S-03 + S-06 | Harga/currency/ferry id trusted dari hidden input | High + Medium | [4.66.4](phases/phase-4-polish-launch/security-patch/phase-4.66.4-server-price-recompute.md) | Server fetch Ferry Ticket by id → verifikasi + recompute unitPrice/childPrice/currency/snapshot. Attacker `unitPrice=1` tidak lagi berhasil. Blocker payment gateway: cleared. | ✅ |
| S-02 | IDOR: `bookingRef` 24-bit/day guessable | High | [4.66.5](phases/phase-4-polish-launch/security-patch/phase-4.66.5-booking-access-token.md) | Tambah `accessToken` 128-bit di Bookings (schema change + migration + backfill). URL confirmation gate `?t=<token>` dengan constant-time compare. Tanpa token valid → 404 (indistinguishable dari ref tidak eksis). | ✅ code · ⏳ `pnpm schema:migrate` menunggu deploy |
| S-08 | Confirmation page bisa cached CDN / indexed | Medium | [4.66.6](phases/phase-4-polish-launch/security-patch/phase-4.66.6-confirmation-noindex.md) | Triple-defense: `_headers`, `Astro.response.headers`, dan `<meta robots noindex>` via PageLayout prop | ✅ |
| S-09 | Passport update tidak dibatasi field-level | Medium | [4.66.7](phases/phase-4-polish-launch/security-patch/phase-4.66.7-passport-field-access.md) | `access.update = superAdminFieldAccess` di `passengers[].passportNumber`. Admin read (ticketing) tapi tidak boleh update. | ✅ |
| S-10 + S-11 | Env fallback silent di prod | Medium + Low | [4.66.8](phases/phase-4-polish-launch/security-patch/phase-4.66.8-fail-fast-env.md) | Helper `apps/web/src/lib/env.ts` → `requireEnv` throw di prod kalau `BOOKING_FORM_SECRET` / `PAYLOAD_API_KEY` kosong. Dev tetap boleh fallback. | ✅ |
| S-07 | Rate-limit in-memory per isolate, counter raw IP | Medium | [4.66.9](phases/phase-4-polish-launch/security-patch/phase-4.66.9-ratelimit-hardening.md) | Interim: RATE_MAX 5→3, key = hash(salt, IP), bounded LRU 10k. KV upgrade di-defer ke Phase 4.68. | ⚠️ interim |
| S-13 | WA message bawa email/notes/per-passenger di URL | Low | [4.66.10](phases/phase-4-polish-launch/security-patch/phase-4.66.10-wa-message-trim.md) | Trim body: ref + ferry + rute + tanggal + pax + kelas + nama + WA saja. Detail lain tetap ada di confirmation + CMS. | ✅ |
| F6 | Dependency vulnerabilities (73 vuln dari `pnpm audit`) | Mixed | [4.66.11](phases/phase-4-polish-launch/security-patch/phase-4.66.11-dep-audit.md) | Report-only. 3 Critical / 26 High / 33 Moderate / 11 Low. Upgrade di-plan sebagai Phase 4.67. | 📋 reported |
| — | Docs wrap-up PROGRESS/RBAC/SCHEMA | — | [4.66.12](phases/phase-4-polish-launch/security-patch/phase-4.66.12-docs-wrapup.md) | Dokumentasi utama disinkron dengan perubahan collection + rule. | ✅ |
| — | Debt checklist (pre-deploy + follow-up) | — | [4.66.13](phases/phase-4-polish-launch/security-patch/phase-4.66.13-pre-deploy-debt.md) | Konsolidasi: migration, secret rotation, env Cloudflare Pages, manual tests, 7 follow-up phase (4.67–5.0). | 📋 tracking |
| — | Security master log convention | — | [4.66.14](phases/phase-4-polish-launch/security-patch/phase-4.66.14-security-master-log.md) | Buat file ini + aturan di AGENTS.md §14 + CLAUDE.md pointer. Semua pekerjaan security berikutnya catat di sini. | ✅ |

**Findings yang tidak diubah / sudah OK dari sebelumnya (dari baseline audit):**
- A1 — WA URL carries plaintext (standar untuk click-to-chat, mitigasi via trim di 4.66.10).
- A5 / B1 / B2 — Bookings REST ditutup public (`access.read = isAdmin`), API-key only.
- C1 / C6 / C7 / C8 — Server-side validation + output escaping (Astro auto-escape, encodeURIComponent).
- D6 — Astro `/api/bookings/create` tidak pakai cookie → CSRF N/A.
- E1 — HTTPS forced di Cloudflare edge.

**Yang perlu follow-up (lihat 4.66.13 untuk detail):**
- Phase 4.67 — Dependency upgrade batch (73 vuln dari pnpm audit).
- Phase 4.68 — Cloudflare KV rate-limit (shared across isolates).
- Phase 4.69 — Turnstile di checkout form.
- Phase 4.70 — Booking retention job (PII lifecycle).
- Phase 4.71 — Admin UI regenerate `accessToken`.
- Phase 4.72 — CSP tightening (drop `unsafe-inline`, pakai nonce).
- Phase 5.0 — Payment gateway integration (Xendit/Midtrans).

---

## Template entry untuk series berikutnya

Saat ada perintah security baru (mis. "audit chat widget", "patch CVE X", "pengetatan RBAC"), tambahkan section baru di bawah dengan struktur:

```markdown
### Phase <N> — <Title> (<Tanggal mulai>)

**Context:** <2-3 kalimat kenapa task ini dijalankan>

**Baseline / scope:** [phase-<N>-*.md](phases/...) — N findings (X Critical, Y High, …)

**Status series:** <ringkas>

| # | Finding | Severity | Phase report | Ringkas | Status |
|---|---|---|---|---|---|
| ID | <judul> | <sev> | [link](phases/...) | <1-2 kalimat> | ✅/⏳/⚠️/📋 |

**Follow-up:**
- Phase <M> — <judul>
```

Legend status:
- ✅ Selesai + verified
- ⏳ Code selesai, menunggu action manual (secret rotation, migration run, dsb.)
- ⚠️ Interim fix, planned upgrade
- 📋 Tracking / reported only (belum di-fix)
- ❌ Rolled back / tidak jadi

---

## Catatan untuk Developer / AI Agent

- Jangan menambahkan **detail teknis panjang** ke file ini — biarkan phase report yang membawa itu. File ini index + severity + status.
- Satu finding = satu baris. Satu phase = satu row di tabel. Satu series (mis. Phase 4.66.*) = satu section.
- Kalau sebuah finding diselesaikan dalam banyak phase (mis. Phase 4.66.4 cover S-03 + S-06 sekaligus), tulis "S-03 + S-06" di kolom Finding.
- Status berubah → update baris. Jangan buat baris duplikat.
- Kalau phase di-rollback, tandai ❌ dan tulis alasan di kolom Ringkas, jangan hapus baris (preserve history).
