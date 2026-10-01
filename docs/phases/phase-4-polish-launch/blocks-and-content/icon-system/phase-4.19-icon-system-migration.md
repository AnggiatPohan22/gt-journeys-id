## Phase 4.19: Icon System — Iconify Migration
**Tanggal**: 2026-08-31
**Status**: Selesai
**Dikerjakan oleh**: Claude Code

### Ringkasan
Migrasi icon system dari hardcoded 32-option select enum (Material Symbols naming)
ke Iconify (200k+ icons dari MDI + Lucide sets) dengan backward compatibility penuh.
Custom searchable icon picker di admin, frontend Icon.astro rewritten untuk resolve
dari `@iconify-json/*` packages at build time.

### File yang Berubah
| File | Perubahan |
|------|-----------|
| `packages/shared/src/icon-map.ts` | **Baru** — mapping 32 legacy icon names → Iconify identifiers |
| `packages/shared/src/index.ts` | Export `icon-map` |
| `apps/web/src/components/common/Icon.astro` | Rewrite: SVG lookup table → Iconify `@iconify/utils` + `@iconify-json/*` |
| `apps/cms/src/fields/iconOptions.ts` | Tambah `iconField()` factory, `iconOptions` array deprecated |
| `apps/cms/src/components/IconPickerField.tsx` | **Baru** — custom React field: searchable grid picker |
| `apps/cms/src/app/(payload)/api/icons/route.ts` | **Baru** — API route untuk icon search (server-side) |
| `apps/cms/src/collections/Tours.ts` | `iconName` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/Accommodations.ts` | `iconName`/`icon` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/WaterActivities.ts` | `iconName`/`icon` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/Yachts.ts` | `iconName`/`icon` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/Restaurants.ts` | `iconName`/`icon` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/Venues.ts` | `iconName`/`icon` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/Rentals.ts` | `iconName`/`icon` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/Spa.ts` | `iconName`/`icon` select → `iconField()` text (2 fields) |
| `apps/cms/src/collections/ServiceTypes.ts` | `iconName` select → `iconField()` text (1 field) |
| `apps/cms/src/blocks/index.ts` | 3 block icon fields → `iconField()` + import |
| `apps/cms/src/globals/HomepageContent.ts` | 2 icon fields → `iconField()` + import |
| `packages/shared/src/types/payload-types.ts` | Regenerated (icon fields now `string` not union) |
| `apps/web/package.json` | +`@iconify/utils`, `@iconify-json/mdi`, `@iconify-json/lucide` |
| `apps/cms/package.json` | +`@iconify/utils`, `@iconify-json/mdi`, `@iconify-json/lucide` |

### Arsitektur

```
┌──────────────────────────────────────────────────────────┐
│  CMS Admin (Payload + Next.js)                           │
│                                                          │
│  IconPickerField.tsx ──fetch──▶ /api/icons?q=star        │
│  (searchable grid)             (server-side search dari  │
│  stores "mdi:star"              @iconify-json/mdi+lucide)│
└──────────────────────┬───────────────────────────────────┘
                       │ saves "mdi:star" or legacy "star"
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend (Astro SSG — build time)                       │
│                                                          │
│  Icon.astro:                                             │
│    1. name has ":"? → resolve via @iconify/utils         │
│    2. legacy name?  → map via LEGACY_ICON_MAP → resolve  │
│    3. unknown?      → empty SVG fallback                 │
│                                                          │
│  packages/shared/icon-map.ts = mapping table             │
│  @iconify-json/mdi + lucide = SVG data (build-time only) │
└──────────────────────────────────────────────────────────┘
```

### Impact
- **Database**: Schema change — 17 fields berubah dari `select` ke `text`. Existing values
  (e.g. `star`, `badge`) tetap valid di DB. Saat CMS restart, Payload akan prompt
  `+ alter column` untuk columns yang berubah type. Data tidak hilang karena SQLite
  menyimpan semua sebagai text.
- **CMS**: 22 icon fields sekarang pakai custom `IconPickerField` (searchable grid picker).
  Editor bisa browse 10k+ icons (MDI + Lucide) bukan cuma 32 pilihan.
- **Frontend**: `Icon.astro` sekarang resolve dari Iconify packages. Semua 32 legacy
  icon names tetap render via `LEGACY_ICON_MAP`. Icons baru dalam format `mdi:star`.
- **Routes**: Tambah `/api/icons` (GET) — internal CMS route untuk icon search.
- **RBAC**: none
- **Deploy needed**: CMS (schema change) + Web (Icon.astro rewrite)

### Testing
- [x] Astro build — 50 pages built successfully
- [x] TypeScript — no new errors (CMS + Web)
- [x] All 32 legacy icon names verified exist in `@iconify-json/mdi` + `@iconify-json/lucide`
- [x] Import map generated with IconPickerField registration
- [ ] CMS visual verify — restart CMS, accept schema change, test icon picker UI
- [ ] Frontend visual verify — check icons render on detail pages

### Rollback
1. Revert `iconField()` calls → restore `{ type: 'select', options: iconOptions }` in all collections/blocks/globals
2. Revert `Icon.astro` → restore inline SVG path lookup tables
3. Remove `icon-map.ts` from packages/shared
4. Remove `IconPickerField.tsx` and `/api/icons/route.ts`
5. Uninstall `@iconify/*` packages from both apps
6. Regenerate payload-types.ts
7. CMS restart — Payload re-creates select columns (existing text values still fit)

### Backward Compatibility
- **Existing DB data**: Legacy values (`star`, `badge`, `sell`, etc.) resolved via
  `LEGACY_ICON_MAP` → no data migration needed
- **New values**: Stored as `mdi:star`, `lucide:heart` — resolved directly by `@iconify/utils`
- **Fallback**: Unknown icon names render an empty invisible SVG (same as before)
- **modules.ts**: Lucide-style names (`compass`, `bed-double`, etc.) now also mapped

### Packages Added
| Package | App | Size | Purpose |
|---------|-----|------|---------|
| `@iconify/utils` | web + cms | ~50KB | Parse icon data from JSON packages |
| `@iconify-json/mdi` | web + cms | ~2MB | Material Design Icons (7k+ icons) |
| `@iconify-json/lucide` | web + cms | ~500KB | Lucide Icons (1.5k+ icons) |

### Next Steps
- CMS restart + schema push (accept `alter column` prompts)
- Visual verify icon picker in admin
- Visual verify icon rendering on frontend detail pages
- Consider adding more icon sets (`@iconify-json/heroicons`, `@iconify-json/phosphor`) if editors need them
- Consider adding "recently used" / "favorites" to picker
