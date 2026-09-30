## Phase: 4.66 — Checkout Security Audit v0.1

**Tanggal**: 2026-09-30
**Status**: Dalam Pengerjaan — Phase 1–3 selesai (Discovery + Audit + Plan). Menunggu approval user sebelum Phase 4 (Implementation).
**Dikerjakan oleh**: Claude Code (read-only pass, tidak ada file yang diubah)

### Ringkasan
Audit read-only terhadap checkout flow Ferry Ticket (Select Trip → Passenger Info → Confirmation → WhatsApp handoff). Tidak ada payment gateway aktif — semua penanganan uang masih manual via WA. Ditemukan **1 Critical, 4 High, 5 Medium, 3 Low** temuan; sebagian besar berkaitan dengan (a) confirmation-page IDOR karena `bookingRef` mudah ditebak, (b) harga & currency dipercaya penuh dari client, (c) missing security headers, dan (d) placeholder secret di `wrangler.toml` yang di-commit ke git.

---

## Phase 1 — Discovery (read-only)

### 1. Stack & versi (verified from `package.json`)

| Area | Value |
|---|---|
| Frontend | Astro `^5.10.0` + `@astrojs/cloudflare ^12.4.0` (`output: 'static'` + on-demand routes) |
| Styling | Tailwind `^3.4`, GSAP `^3.12`, Alpine `^3.14` |
| CMS | Payload `^3.33.0` di Next.js `^15.3.0`, React `^19.1` |
| DB adapter | `@payloadcms/db-sqlite ^3.33` (`push: false`, migrations only) |
| Storage | `@payloadcms/storage-r2 ^3.33` |
| Cloudflare | `@opennextjs/cloudflare ^1.5`, `wrangler ^4.22`, `compatibility_date = 2025-09-30` |
| Hosting | Web → Cloudflare Pages (`astro build && wrangler pages deploy dist/`); CMS → Cloudflare Workers (D1 + R2) |

### 2. Frontend files pada checkout flow

| Peran | File |
|---|---|
| Trip select / detail (entry) | [apps/web/src/pages/ferry-tickets/[slug].astro](apps/web/src/pages/ferry-tickets/%5Bslug%5D.astro) — form `method="GET"` ke `/checkout/ferry-tickets/{slug}` membawa `date`, `adults`, `children`, `class` |
| Ticket search widget | [apps/web/src/components/blocks/ServiceListingTicketSearch.astro](apps/web/src/components/blocks/ServiceListingTicketSearch.astro) (dan V2 / Legacy) |
| Passenger form | [apps/web/src/pages/checkout/ferry-tickets/[slug].astro](apps/web/src/pages/checkout/ferry-tickets/%5Bslug%5D.astro) — form `method="POST"` ke `/api/bookings/create` |
| API endpoint | [apps/web/src/pages/api/bookings/create.ts](apps/web/src/pages/api/bookings/create.ts) — validasi + rate-limit + HMAC stamp + persist via CMS API key |
| Booking store | [apps/web/src/lib/checkout/store.ts](apps/web/src/lib/checkout/store.ts) — `createBooking`, `getBookingByRef`, `generateBookingRef` |
| HMAC stamp | [apps/web/src/lib/checkout/signedToken.ts](apps/web/src/lib/checkout/signedToken.ts) |
| Rate limit | [apps/web/src/lib/checkout/rateLimit.ts](apps/web/src/lib/checkout/rateLimit.ts) |
| Channel resolver | [apps/web/src/lib/checkout/channels/index.ts](apps/web/src/lib/checkout/channels/index.ts) |
| Manual WA channel | [apps/web/src/lib/checkout/channels/manualWhatsApp.ts](apps/web/src/lib/checkout/channels/manualWhatsApp.ts) |
| Passport masking | [apps/web/src/lib/checkout/mask.ts](apps/web/src/lib/checkout/mask.ts) |
| WA link builder | [apps/web/src/lib/whatsapp.ts](apps/web/src/lib/whatsapp.ts) |
| Confirmation page | [apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro](apps/web/src/pages/checkout/ferry-tickets/confirmation/%5Bref%5D.astro) |
| No client state store | (no localStorage/sessionStorage/cookie yang menyimpan PII pada checkout — verified via grep) |

### 3. Backend / CMS

| Area | Lokasi | Catatan |
|---|---|---|
| Bookings collection | [apps/cms/src/collections/Bookings.ts](apps/cms/src/collections/Bookings.ts) | Access: `create=isAdmin, read=isAdmin, update=isAdmin, delete=isSuperAdmin` — public REST **tidak** bisa create/read/update. |
| Access helpers | [apps/cms/src/access/roles.ts](apps/cms/src/access/roles.ts), [apps/cms/src/access/moduleAccess.ts](apps/cms/src/access/moduleAccess.ts) | |
| Users auth | [apps/cms/src/collections/Users.ts](apps/cms/src/collections/Users.ts) | `auth: { useAPIKey: true }` — API key user meng-impersonate role user tsb. |
| REST catch-all | [apps/cms/src/app/(payload)/api/[...slug]/route.ts](apps/cms/src/app/%28payload%29/api/%5B...slug%5D/route.ts) | Standard `REST_GET/POST/…` from `@payloadcms/next`. |
| Custom cron endpoint | [apps/cms/src/app/(payload)/api/chat-retention/route.ts](apps/cms/src/app/%28payload%29/api/chat-retention/route.ts) | Header `x-cron-key`, min length 16 — pattern bagus (bisa dipakai ulang). |
| CORS config | [apps/cms/src/payload.config.ts:126–130](apps/cms/src/payload.config.ts) | Whitelist: `localhost:4321`, `localhost:3030`, `SITE_URL || 'https://dnjourneysbali.com'`. |
| CSRF config | (tidak diset) | Payload default CSRF-off tanpa `csrf: [...]`. |
| Auth secret | [apps/cms/src/payload.config.ts:244](apps/cms/src/payload.config.ts) | `process.env.PAYLOAD_SECRET \|\| 'CHANGE-THIS-SECRET-IN-PRODUCTION'` — fallback lemah. |
| Wrangler config | [apps/cms/wrangler.toml:9](apps/cms/wrangler.toml) | `[vars] PAYLOAD_SECRET = "CHANGE-THIS-TO-A-RANDOM-32-CHAR-STRING"` — **placeholder di-commit ke git** (file `git ls-files` = tracked). |

### 4. Data-flow map (per field yang diisi customer)

```
Browser (Passenger form) ──POST FormData──▶ Astro /api/bookings/create (Cloudflare Pages Function)
  ├─ validasi + honeypot + HMAC stamp + IP rate-limit
  ├─ compose customerWhatsapp = normalize(region + phone)
  ├─ generate bookingRef = FT-YYYYMMDD-<6 hex>
  └─ fetch(CMS_URL + /api/bookings, Authorization: users API-Key <PAYLOAD_API_KEY>)
                                                             │
                                              Payload REST (Workers) → D1
                                              (schema: apps/cms/src/collections/Bookings.ts)
                                                             │
                                    302 redirect ──▶ /checkout/ferry-tickets/confirmation/<bookingRef>
                                                             │
                                    SSR fetch(CMS /api/bookings?where[bookingRef][equals]=<ref>&depth=2)
                                                             │
                                    render page: nama, WA, email, country, notes, penumpang (passport MASKED)
                                                             │
                                    user tap "Kirim ke WhatsApp" → wa.me/<admin>?text=<summary>
                                                             │
                                    (message body: ref, nama, WA, email, negara, notes, per-penumpang name+DOB+nationality + passport MASKED)
                                                             │
                                    Admin balas manual via WA. Full passport hanya dilihat admin di CMS.
```

Field-per-field:

| Field | Browser | Wire | DB | Konfirmasi (public) | WA message |
|---|---|---|---|---|---|
| customerName | form input | POST body | full | full | full |
| customerEmail | form input | POST body | full | full | full |
| contactPhoneRegion / contactPhone | form input | POST body | full | via `customerWhatsapp` | full |
| customerCountry | form input | POST body | full | full | full |
| customerNotes | form input | POST body | full | full | full |
| passengers[].firstName / lastName / title / gender / nationality / dateOfBirth | form input | POST body | full | full | full |
| passengers[].passportNumber | form input | POST body | **full** | **masked** `••••1234` | **masked** |
| passengers[].passportIssue/Expiry | form input | POST body | full | full | not sent |
| unitPrice / currency / ferryTicketId / origin/destinationLocation / ferryClassName / scheduleTimeLabel | **hidden input** (dari server pertama render) | POST body | as-received | full | full |
| bookingRef | server generated | server generated | full | shown in URL path | full |

Logs:
- Astro endpoint: hanya `console.error('[bookings] create failed:', result)` di path error — `result.detail` bisa berisi 200 char body dari CMS (tidak berisi PII input, hanya error string). Tidak ada log PII di happy path.
- Payload/Next runtime menulis access log standard di stdout Workers — request path & status, tidak isi body.

### 5. Client-side storage / URL exposure

| Vector | Berisi PII? |
|---|---|
| `localStorage` | **Tidak** — dipakai hanya oleh AnnouncementBar / PromoBannerModal / ChatWidget (dismiss flags saja). |
| `sessionStorage` | **Tidak** — hanya ChatWidget auto-open. |
| Cookies | **Tidak** dipakai frontend (SSR). Payload admin punya cookie sesi sendiri di `/admin`. |
| URL params (Select Trip → Checkout) | `?date=…&adults=…&children=…&class=…` — **tidak ada PII**. |
| URL path (confirmation) | `/checkout/ferry-tickets/confirmation/<bookingRef>` — ref bocor ke history/referrer, dan booking body ikut bocor kalau ref tertebak (lihat Finding S-02). |
| `wa.me/…?text=…` | Message body berisi nama, email, WA, negara, notes, penumpang — masuk history browser + kemungkinan referrer ke wa.me. Passport-nya sudah masked. |

---

## Phase 2 — Security audit

Legend: ✅ PASS · ❌ FAIL · ⚠️ PARTIAL · ➖ N/A

### A. Data leakage

| # | Cek | Verdict | Bukti |
|---|---|---|---|
| A1 | PII di dalam wa.me `?text=` | ⚠️ PARTIAL | `manualWhatsApp.ts:31–79` — nama, WA, email, negara, notes, per-penumpang name/DOB/nationality masuk ke URL query. Passport sudah masked (`mask.ts`). Ini adalah karakter click-to-chat standar tapi tetap masuk ke history + kemungkinan referrer. |
| A2 | PII di localStorage / sessionStorage / cookies | ✅ PASS | Grep confirms no checkout code writes PII. |
| A3 | PII di URL param `?…` sebelum WA | ✅ PASS | Hanya `date/adults/children/class` — non-PII. |
| A4 | PII di console.log / server log | ✅ PASS | `bookings/create.ts:201` hanya log `result` (error object, no input PII). |
| A5 | Booking record public-readable via REST | ✅ PASS | `Bookings.access.read = isAdmin` (`Bookings.ts:32-36`) — anonymous REST GET/PATCH/DELETE diblok. |
| A6 | Booking record dapat diakses via confirmation URL | ❌ FAIL | `[ref].astro:31` server-side fetch dengan **API-key admin** — ref itu satu-satunya secret, dan `bookingRef` = `FT-YYYYMMDD-<6 hex uppercase>` (`store.ts:66-74`) → hanya 24-bit entropy per hari (~16.7M possible values). Attacker bisa enumerate. Ini IDOR: dengan tebakan yang valid, halaman menampilkan **nama, email, WA, negara, notes, semua nama penumpang, DOB, nasionalitas, tanggal issue/expiry passport, ref+harga**. Passport-number saja yang di-mask. |
| A7 | Referrer bocor ke wa.me | ⚠️ PARTIAL | Link punya `rel="noopener noreferrer"` (`[ref].astro:381,395`) — referrer stripped. Namun query param `text=` tetap terlihat oleh WhatsApp (by design). |

### B. Access control (CMS)

| # | Cek | Verdict | Bukti |
|---|---|---|---|
| B1 | Bookings public tidak boleh create/read/update/delete | ✅ PASS | `Bookings.ts:31-36`. Public create ditutup — frontend pakai API-key (server-only). |
| B2 | API-key auth di endpoint booking | ✅ PASS | `store.ts:33` `Authorization: users API-Key <key>`. Key hanya di server-side (Cloudflare Worker) env, tidak di bundle client. |
| B3 | `bookingRef` guessable (IDOR risk) | ❌ FAIL | 24-bit hex per hari. Rekomendasi: minimal 96–128 bit random (crypto.randomUUID basenya 122-bit) atau tokened access. |
| B4 | Endpoint `/api/bookings/create` unauthenticated | ✅ PASS by design | Public endpoint, gated by honeypot + HMAC stamp + rate-limit. |
| B5 | Endpoint `/api/chat-retention` unauthorized bypass | ✅ PASS | Cron key length ≥16 dienforce (`chat-retention/route.ts:28-33`). Pola bagus untuk future admin endpoints. |
| B6 | Payload admin dashboard `/admin/*` gate | ✅ PASS | Payload default auth session; role-based `hidden` untuk Bookings collection (`Bookings.ts:29`). |

### C. Input validation & integrity

| # | Cek | Verdict | Bukti |
|---|---|---|---|
| C1 | Server-side validasi tiap field | ✅ PASS | `bookings/create.ts:36-94, 116-159` — email regex, name minlength, phone normalize, string cap, adults 1–10, children 0–6, past date reject, round-trip return date, passenger count = adults+children, passport expiry ≥ 6 bulan post-departure. |
| C2 | Server recompute price (bukan trust client) | ❌ FAIL | `bookings/create.ts:161-165` — `unitPrice = Number(form.get('unitPrice') ?? 0)` diambil dari **hidden input** yang dikirim client. Attacker bisa kirim `unitPrice=1` → totalEstimate=1. Belum kritikal karena belum ada payment; tapi **BLOCKER** sebelum gateway aktif. |
| C3 | Currency trusted | ❌ FAIL | Line 162 — currency dari client, dipakai untuk formatPrice di WA message dan admin CMS. Attacker bisa spoof `currency=EUR`. |
| C4 | `ferryTicketId` verified vs server truth | ❌ FAIL | Line 168 — id dari client hidden. Attacker bisa post booking untuk ferry lain (mengarahkan admin ke ticket yang tidak dipesan customer). |
| C5 | Snapshot fields (origin/destination/scheduleTime/ferryClassName) verified | ⚠️ PARTIAL | Lines 185-189 — dari client, tidak diverifikasi dengan CMS. Impact terbatas (snapshot only), tapi bisa dipakai untuk phishing (customer klaim booking ke rute lain). |
| C6 | Output escaping di admin view | ✅ PASS | Payload admin renders textarea/text safely; rich-text lexical bukan payload user di sini. |
| C7 | Output escaping di WA message | ✅ PASS | Plaintext body, `encodeURIComponent` di `whatsapp.ts:3`. |
| C8 | Output escaping di confirmation page | ✅ PASS | Astro `{value}` auto-escapes. |
| C9 | Batas passenger array (DoS) | ⚠️ PARTIAL | `adults ≤ 10, children ≤ 6` diclamp dari input, dan check `passengers.length === adults+children` → maks 16. Tapi kalau user kirim `passengers[9999][firstName]=x` server iterate seluruh key form → **potential DoS** kalau body sangat besar. Astro default body-limit lebih dulu, jadi risiko rendah. |

### D. Abuse protection

| # | Cek | Verdict | Bukti |
|---|---|---|---|
| D1 | Rate limit endpoint booking | ⚠️ PARTIAL | `rateLimit.ts` — 5 attempts / 15 min / IP, **in-memory per Worker isolate**. Di Cloudflare Workers isolate bisa banyak dan restart cepat → mudah di-bypass. |
| D2 | Rate limit confirmation page (enumeration) | ❌ FAIL | Tidak ada. Kombinasi dengan A6/B3 = brute-force IDOR bebas. |
| D3 | Bot protection (Turnstile / captcha) | ❌ FAIL | Hanya honeypot + HMAC time-trap (3s min, 30m max). Tidak ada Turnstile. |
| D4 | CORS restriksi di CMS | ⚠️ PARTIAL | `payload.config.ts:126-130` — whitelist. Yang perlu diverifikasi: production env benar-benar set `SITE_URL`. Default fallback ke `https://dnjourneysbali.com` OK. |
| D5 | CSRF protection Payload admin | ❌ FAIL | Tidak ada `csrf: [...]` array di `buildConfig`. Payload default off; harusnya di-set ke `[SITE_URL, ADMIN_URL]`. |
| D6 | CSRF di `/api/bookings/create` | ➖ N/A | Endpoint anonim, tidak ada cookie-session yang dieksploitasi. HMAC stamp memblok mass-submit dari script tanpa render page. |

### E. Transport & headers

| # | Cek | Verdict | Bukti |
|---|---|---|---|
| E1 | HTTPS enforced | ✅ PASS | Cloudflare Pages/Workers otomatis HTTPS. |
| E2 | HSTS | ❓ UNKNOWN | Bergantung Cloudflare zone settings. Aplikasi sendiri tidak set. |
| E3 | Content-Security-Policy | ❌ FAIL | Tidak ada `_headers` di `apps/web/public/`, tidak ada middleware Astro. |
| E4 | X-Frame-Options / frame-ancestors | ❌ FAIL | Sama. Admin UI diserahkan ke Next default (biasanya `same-origin` untuk `/admin`), tapi frontend tidak diset — clickjacking risk untuk halaman checkout. |
| E5 | X-Content-Type-Options: nosniff | ❌ FAIL | Sama. |
| E6 | Referrer-Policy | ❌ FAIL | Sama. wa.me link sudah `noopener noreferrer` — tapi header global belum di-set. |
| E7 | Permissions-Policy | ❌ FAIL | Sama. |
| E8 | Cookie flags (kalau ada) | ➖ N/A frontend | Payload admin cookie di sisi CMS diatur Payload sendiri (HttpOnly + Secure default). |

### F. Secrets & configuration

| # | Cek | Verdict | Bukti |
|---|---|---|---|
| F1 | `.env` gitignored | ✅ PASS | `.gitignore:12-15`. |
| F2 | No secret hard-coded di source | ⚠️ PARTIAL | Fallback strings di sumber: `payload.config.ts:244 "CHANGE-THIS-SECRET-IN-PRODUCTION"`, `signedToken.ts:15 "dnj-dev-booking-secret-change-in-prod"`. **Jangan** jadi fallback hidup di prod — harus error out kalau env kosong. |
| F3 | Wrangler `[vars] PAYLOAD_SECRET` di-commit ke git | ❌ **CRITICAL** | `wrangler.toml:8-10` di-track git (`git ls-files` positive). Nilai sekarang placeholder, tapi struktur ini mengundang commit nilai sebenarnya di masa depan. Harus dipindah ke `wrangler secret put PAYLOAD_SECRET` + hapus dari `[vars]`. |
| F4 | Client bundle bocorkan secret | ✅ PASS | `PAYLOAD_API_KEY`, `BOOKING_FORM_SECRET` diakses via `import.meta.env` di file `.ts` yang hanya jalan di server (`export const prerender = false`). `PUBLIC_` prefix hanya untuk `PUBLIC_FERRY_CHECKOUT_CHANNEL` yang memang non-sensitif (slug channel). |
| F5 | Debug mode di prod | ✅ PASS | Tidak ada `debug: true` di Payload/Next config. |
| F6 | Dependency vulnerabilities | ⏸ TO RUN | `npm audit --audit-level=high` belum dijalankan (read-only pass) — akan dijalankan di Phase 4 sebagai laporan, tanpa auto-fix. |

### G. Payment-gateway readiness

| # | Cek | Verdict | Bukti |
|---|---|---|---|
| G1 | `status` field server-only | ✅ PASS | Enum `pending/awaiting_payment/confirmed/cancelled/expired` (`Bookings.ts:227-240`); `access.update = isAdmin` — client tidak bisa mutate. |
| G2 | Trust boundary harga saat gateway ditambah | ❌ FAIL | Berulang dari C2/C3/C4 — sebelum gateway aktif, harga & currency **harus** direcompute server-side dari CMS FerryTicket. |
| G3 | Webhook signature verification | ➖ N/A yet | Belum ada endpoint. Rekomendasi tempat: `apps/cms/src/app/(payload)/api/webhooks/<provider>/route.ts` mengikuti pola `chat-retention/route.ts` (header signature + timing-safe compare). |
| G4 | Idempotency utk callback | ➖ N/A yet | Perlu unique index pada gateway invoice id di `channelData` (via hook) — di-plan sekarang. |

---

## Phase 3 — Findings, plan & questions

### Findings table

| ID | Severity | Location | Risk | Proposed fix |
|---|---|---|---|---|
| S-01 | **Critical** | [apps/cms/wrangler.toml:8-10](apps/cms/wrangler.toml) | Placeholder `PAYLOAD_SECRET` di `[vars]` di-commit; jika seseorang mengganti nilai riil di file yang sama, secret bocor ke git. | Pindah ke Worker secret (`wrangler secret put PAYLOAD_SECRET`) dan hapus block `[vars] PAYLOAD_SECRET`. Idem untuk future secrets (BOOKING_FORM_SECRET, PAYLOAD_API_KEY di Workers dan Pages). |
| S-02 | **High** | [apps/web/src/lib/checkout/store.ts:66-74](apps/web/src/lib/checkout/store.ts) + [confirmation/[ref].astro](apps/web/src/pages/checkout/ferry-tickets/confirmation/%5Bref%5D.astro) | `bookingRef` hanya 24-bit hex → brute-forceable, dan confirmation page publik menampilkan PII booking. IDOR pada booking milik orang lain. | Tambah token akses random 128-bit disimpan di kolom baru `accessToken` (index unique). Confirmation URL jadi `/confirmation/<ref>?t=<token>`. `getBookingByRef` tolak jika token tidak match. `bookingRef` yang short tetap dipakai untuk manusia (di WA / admin), tapi tidak cukup untuk buka halaman. Alternatif ringan: naikkan bagian random `bookingRef` jadi 22 char base32 (~110 bit). |
| S-03 | **High** | [apps/web/src/pages/api/bookings/create.ts:161-165](apps/web/src/pages/api/bookings/create.ts) | Harga & currency di-trust dari hidden input; total dihitung dari nilai client. Meski belum ada gateway, ini blocker sebelum payment aktif. | Server ambil `ferryTicket` by id dari CMS (server-side fetch), cari class yang cocok dengan `ferryClassType`, ambil `adultPrice`/`childPrice`/`currency` dari record itu — abaikan hidden input. |
| S-04 | **High** | (semua respon HTML dari `apps/web`) | Missing security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS). Clickjacking + MIME sniff. | Tambah `apps/web/public/_headers` (Cloudflare Pages) dengan header baseline. CSP mulai dengan `default-src 'self'` + whitelist wa.me + R2 media + fonts. |
| S-05 | **High** | [apps/cms/src/payload.config.ts:244](apps/cms/src/payload.config.ts), [apps/cms/src/payload.config.ts:122-131](apps/cms/src/payload.config.ts) | Tidak ada `csrf: [...]` di Payload config → admin dashboard rentan CSRF (state-changing request dari origin lain kalau admin login). | Tambah `csrf: [process.env.SITE_URL, process.env.SERVER_URL]` (dedupe, filter falsy). |
| S-06 | Medium | [apps/web/src/pages/api/bookings/create.ts:168-173](apps/web/src/pages/api/bookings/create.ts) | `ferryTicketId` dari client, tidak diverifikasi valid + module ferry-tickets enabled. | Bagian dari S-03: fetch ticket by id, tolak kalau tidak ada / module off. |
| S-07 | Medium | [apps/web/src/lib/checkout/rateLimit.ts](apps/web/src/lib/checkout/rateLimit.ts) | In-memory rate limit di-share per Worker isolate saja → efektifitas rendah di Cloudflare. | Ganti ke Cloudflare KV/D1 counter atau Durable Object. Sementara: turunkan RATE_MAX ke 3 + tambahkan hash IP di kunci (sudah ada `hashIp` helper, belum dipakai). |
| S-08 | Medium | [confirmation/[ref].astro](apps/web/src/pages/checkout/ferry-tickets/confirmation/%5Bref%5D.astro) | Confirmation page tidak punya `Cache-Control: private, no-store` + `noindex` — bisa terindeks / dicache CDN. | Set response header `Cache-Control: no-store, private` + meta `<meta name="robots" content="noindex,nofollow">`. |
| S-09 | Medium | [apps/cms/src/collections/Bookings.ts](apps/cms/src/collections/Bookings.ts) | Admin field-access untuk data sensitif (passport, DOB) sama dengan admin+ umum, tidak ada gating field-level. Editor role kalau di-enable read → lihat semua. | Sesuai — `access.read=isAdmin` sudah blok editor. Tambahan: `access.update.passportNumber = superAdminFieldAccess` untuk defense-in-depth. |
| S-10 | Medium | [apps/web/src/lib/checkout/store.ts:26](apps/web/src/lib/checkout/store.ts) | `if (!CMS_URL \|\| !API_KEY) return misconfigured` — hanya di-log, tidak fail-fast saat boot. | Tambahkan startup check: kalau `import.meta.env.PROD && !API_KEY` → throw. Sama untuk `BOOKING_FORM_SECRET`. |
| S-11 | Low | [apps/web/src/lib/checkout/signedToken.ts:15](apps/web/src/lib/checkout/signedToken.ts) | Fallback secret literal `dnj-dev-booking-secret-change-in-prod`. | Fail-fast di prod (env `PROD`) — dev keep fallback. |
| S-12 | Low | [apps/web/src/pages/api/bookings/create.ts:207-213](apps/web/src/pages/api/bookings/create.ts) | Redirect error dengan `err=<code>` di query — kode error masuk history, mostly OK, tapi bisa dipakai untuk enumerate reason. | Batasi jumlah kode error yang dipetakan pada UI ke set whitelist (sudah dilakukan di `[slug].astro:74-89`) — sudah cukup, dokumentasikan. |
| S-13 | Low | [manualWhatsApp.ts:56-77](apps/web/src/lib/checkout/channels/manualWhatsApp.ts) | WA message masukkan email + notes lengkap ke query URL. Kalau customer forward screenshot / share screen, ada risiko shoulder-surf email + notes. | Rampingkan default WA message: ref + nama + trip + tanggal + jumlah pax saja. Detail lengkap ditinggal di halaman konfirmasi (yang akses-token'ed di S-02). |

### Ordered fix plan (small steps)

Semua step berjalan di branch baru `fix/checkout-security` (satu concern per commit). Tidak butuh migration DB kecuali dinyatakan.

| # | Step | Files utama | Schema? | Package baru? | Rollback |
|---|---|---|---|---|---|
| 1 | **S-01** — pindah `PAYLOAD_SECRET` ke Worker secret. Hapus `[vars] PAYLOAD_SECRET` dari `wrangler.toml`. Tambah bagian di `docs/05-INFRA.md` cara set secret. | `apps/cms/wrangler.toml`, `docs/05-INFRA.md` | ❌ | ❌ | `git revert` (dan set kembali env di wrangler CI). |
| 2 | **S-05** — tambah `csrf: [...]` di Payload config. | `apps/cms/src/payload.config.ts` | ❌ | ❌ | Revert single-file. |
| 3 | **S-04** — tambah `apps/web/public/_headers` dengan CSP baseline + X-Frame-Options + nosniff + referrer + permissions. Test builder + `curl -I` output. | `apps/web/public/_headers` (baru) | ❌ | ❌ | Hapus file. |
| 4 | **S-03 + S-06** — di `/api/bookings/create`, fetch `ferry-tickets/<id>` via API-key server-side, verifikasi module + class, recompute `unitPrice`/`childPrice`/`currency`/`totalEstimate` dari CMS. Snapshot origin/destination/scheduleTimeLabel/ferryClassName juga diambil dari CMS. | `apps/web/src/pages/api/bookings/create.ts`, `apps/web/src/lib/checkout/store.ts` (tambah `getFerryForCheckout`) | ❌ (field sudah ada) | ❌ | Revert commit. |
| 5 | **S-02** — schema change: tambah `bookingAccessToken` (text, unique, index, hidden dari admin list) di Bookings. Generate 128-bit di endpoint. Redirect ke `.../confirmation/<ref>?t=<token>`. `getBookingByRef` jadi `getBookingByRefWithToken(ref, token)` — tolak kalau tidak match (constant-time compare). WA link di admin CMS tetap pakai ref pendek untuk manusia. | `apps/cms/src/collections/Bookings.ts`, migration baru, `apps/web/src/lib/checkout/store.ts`, `apps/web/src/pages/api/bookings/create.ts`, `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | ✅ 1 kolom baru (nullable) via `pnpm --filter cms schema:new -- --name booking-access-token` | ❌ | Revert commit + `pnpm schema:down` migration. |
| 6 | **S-08** — `Cache-Control: private, no-store` + noindex meta pada confirmation page. | `apps/web/src/pages/checkout/ferry-tickets/confirmation/[ref].astro` | ❌ | ❌ | Revert. |
| 7 | **S-09** — tambah `access.update = superAdminFieldAccess` pada field `passportNumber`. Optional: mask di admin list-view cell (readOnly + regex mask di UI). | `apps/cms/src/collections/Bookings.ts` | ❌ | ❌ | Revert. |
| 8 | **S-10 + S-11** — fail-fast di server bootstrap kalau `PROD` dan `PAYLOAD_API_KEY` / `BOOKING_FORM_SECRET` kosong (buat helper `assertEnv`). | `apps/web/src/lib/checkout/store.ts`, `apps/web/src/lib/checkout/signedToken.ts`, `apps/web/src/lib/env.ts` (baru) | ❌ | ❌ | Revert. |
| 9 | **S-07** — refactor rate-limit ke Cloudflare KV (butuh KV binding baru di `apps/web/wrangler` — kalau frontend belum punya wrangler, gunakan Pages Functions KV binding). Kalau blocker infra, sementara turunkan RATE_MAX ke 3 dan salted-hash IP di key. | `apps/web/src/lib/checkout/rateLimit.ts`, docs infra | ❌ | ❌ (Cloudflare native binding) | Revert. |
| 10 | **S-13** — WA message diringkas: ref/nama/trip/tanggal/pax saja. Detail lengkap tetap di confirmation page. | `apps/web/src/lib/checkout/channels/manualWhatsApp.ts` | ❌ | ❌ | Revert. |
| 11 | **F6** — jalan `pnpm audit --audit-level=high` di `apps/web` + `apps/cms`, laporkan (read-only, no auto-fix). | (report only) | ❌ | ❌ | — |
| 12 | Test steps + report — dokumentasi manual test + tests skrip. | `docs/phases/phase-4.66-security-patch-v0.1.md` (update Impact/Testing/Rollback bagian) | ❌ | ❌ | — |

Testing untuk Phase 4 (per step):
- **Unauthorized read of bookings** — `curl -i https://cms/…/api/bookings` → expect 401/403.
- **Confirmation IDOR** — enum `curl` beberapa `bookingRef` random tanpa token → expect 404 (setelah S-02).
- **Tampered price** — POST `/api/bookings/create` dengan `unitPrice=1` → verify DB record punya `unitPrice` dari CMS, bukan 1.
- **Oversized input** — kirim `firstName` = 5 KB → truncate ke 80 chars, no crash.
- **Rate limit** — 6× POST cepat dari IP yang sama → 6th redirect `?err=rate_limited`.
- **Missing form stamp** — POST tanpa `formStamp` → `?err=stamp_malformed`.
- **Expired form stamp** — issue stamp, tunggu 31 menit → `?err=stamp_expired`.
- **Security headers** — `curl -I https://site/` menampilkan CSP + X-Frame-Options + Referrer-Policy + X-Content-Type-Options.
- **CSRF Payload** — cross-origin POST ke `/admin/api/users/login` dari origin lain → block.

### Questions untuk user sebelum Phase 4

1. **Access token vs longer ref (S-02).** Preferensi: (a) token terpisah (URL jadi `/confirmation/<ref>?t=<128-bit>`) atau (b) perpanjang `bookingRef` jadi ~110-bit (ref lebih panjang, dipakai juga di WA)? Rekomendasi saya: (a) — WA + admin tetap lihat ref pendek, halaman butuh token.
2. **Rate-limit storage (S-07).** Tambah Cloudflare KV binding sekarang, atau tunggu (patch sementara: turunkan RATE_MAX + hash IP)? Butuh info: apa binding KV/DO frontend sudah ada di Pages project?
3. **CSP allowlist (S-04).** Apakah frontend meload script/style dari domain eksternal selain `self`? Yang saya lihat: fonts self-hosted, GSAP+Alpine dari npm bundle, image dari R2 (`dn-journeys-media.r2.cloudflarestorage.com`), embed YouTube/Vimeo (belum ketemu tapi disebut di AGENTS.md). Konfirmasi: aman kalau saya baseline `default-src 'self'; img-src 'self' https://*.r2.cloudflarestorage.com data:; frame-src https://www.youtube.com https://player.vimeo.com; connect-src 'self' <CMS_URL>; script-src 'self' 'unsafe-inline'`? `unsafe-inline` diperlukan sementara karena inline `<script>` di beberapa Astro page — bisa dinaikkan ke nonce/hash setelah audit.
4. **Passenger fields — required apa saja?** Sekarang wajib: `firstName + lastName + passengerType`. Nasionality, DOB, passport (number/issue/expiry) opsional; hanya diwajibkan `passport expiry ≥ 6 bulan` **jika passport diisi**. Konfirmasi apakah untuk ferry Ekonomi (domestic) passport tetap opsional? Untuk Emerald (international) apakah harus mandatory? Kalau harus, di mana logic bisa berbeda per class?
5. **Retention / anonymization.** Setelah booking selesai (status=confirmed atau expired), berapa lama data penumpang disimpan? Ada regulasi GDPR/PDP yang berlaku? Mau saya siapkan job retention seperti `runChatRetention` (drop passport + notes setelah N hari), atau di luar scope Phase 4.66?
6. **Wrangler frontend.** Frontend deploy pakai `wrangler pages deploy` — apakah project Pages sudah eksis? Kalau iya, saya butuh nama project untuk update env & binding via `wrangler pages secret put`. Kalau belum, langkah 9 (S-07 KV) di-defer.
7. **Turnstile.** Mau saya tambahkan Cloudflare Turnstile ke checkout form di step tambahan (paket npm gratis, key gratis)? Ini di luar 12-step di atas tapi cukup ringan untuk ditambah.
8. **Priority mismatch?** Kalau ada 1–2 langkah yang mau di-skip (mis. S-13 wa message trimming — ada risiko bikin admin harus buka halaman lebih sering), sebut sekarang supaya saya tidak menghabiskan waktu.

---

### File yang Berubah (Phase 3)
| File | Perubahan |
|------|-----------|
| `docs/phases/phase-4.66-security-patch-v0.1.md` | **New** — laporan audit Phase 1–3. Belum ada perubahan code. |

### Impact (Phase 3)
- **Database**: none
- **CMS**: none
- **Frontend**: none
- **Routes**: none
- **RBAC**: none

### Testing (Phase 3)
- Baca-saja. Semua verdict di atas didukung pointer `file:line`.

### Rollback (Phase 3)
- `git rm docs/phases/phase-4.66-security-patch-v0.1.md`.

### Dokumentasi yang Diupdate
- [x] `docs/phases/phase-4.66-security-patch-v0.1.md` (this file)
- [ ] `docs/05-INFRA.md` (menunggu Phase 4 step 1 untuk section wrangler secrets)
- [ ] `docs/04-RBAC.md` (menunggu Phase 4 step 7)
- [ ] `docs/02-DATABASE-SCHEMA.md` (menunggu Phase 4 step 5 — kolom `bookingAccessToken`)
- [ ] `docs/PROGRESS.md` (setelah Phase 4 selesai)

### Next Steps
1. **STOP — menunggu approval user.** Balas jawaban pertanyaan 1–8 di atas atau ketik "approve all defaults" untuk melanjutkan.
2. Setelah approve, saya kerjakan Step 1 → 12 di branch `fix/checkout-security`, satu commit per concern, dan update section Testing/Rollback dokumen ini setelah tiap step.
