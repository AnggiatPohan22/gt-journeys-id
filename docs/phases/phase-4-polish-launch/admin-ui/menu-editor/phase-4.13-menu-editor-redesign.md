# Phase 4.13 — Menu Editor Visual Overhaul (Menus trial)

> **Status:** ✅ Done — Menus > items array only; other array fields
> untouched. tsc clean. Awaiting login visual verify.
> **Scope:** Visual hierarchy for nested arrays (main item vs child) via
> classed RowLabels + scoped CSS. No schema changes.
> **Date:** 2026-08-28 · **Payload:** 3.33.0

---

## 0. TL;DR

- **Main items** now render as cards with a 3px ocean-accent left
  border, subtle shadow on hover, and per-type colored badges
  (Page/Service/URL/Anchor/Group).
- **Sub-menu items** are indented behind a dashed left rule, use a
  smaller & muted variant of the same badge scheme, and sit on a
  tinted elevation-50 background so the hierarchy reads instantly.
- **RowLabel components** were rewritten to emit classed markup
  (`.dnj-menu-row__*`) — no inline styles — so CSS controls everything.
- **Scoped via a `dnj-menu-editor` marker** on `admin.className` of the
  `items` array → no other Payload array field is touched.
- **Drag-and-drop, add/delete row, expand-to-edit** — all Payload
  native flows preserved.

---

## 1. Audit findings

- **Menu structure:** Payload `array` field `items` (top-level) with
  nested `array` field `children` (sub-menu). Two levels of nesting.
- **Fields per item:** `label` (text), `type` (select — page /
  service_index / custom_url / anchor / none), `page` (relationship,
  conditional on `type=page`), `url` (text, conditional), `target`
  (select — self/blank), `children` (array).
- **Fields per child:** `label`, `type` (page/custom_url/anchor/none),
  `page`, `url`, `target`. No further nesting.
- **RowLabel components already existed** — `MenuItemRowLabel` and
  `MenuChildRowLabel` — but used inline styles (opacity, fontSize) and
  emitted plain text with an emoji icon. No CSS hooks for restyling.
- **Verified Payload DOM classes:** `.array-field` +
  `.array-field__draggable-rows > .collapsible` per row +
  `.collapsible__content > .array-field` for the nested array.

---

## 2. Approach

**Chosen: RowLabel refactor to classed markup + scoped CSS.**

- **Zero structural change** to the data model or field config (just
  added `admin.className: 'dnj-menu-editor'` to the top-level array).
- **RowLabels rewritten** with named class hooks
  (`.dnj-menu-row`, `.dnj-menu-row__badge`, `.dnj-menu-row__label`,
  `.dnj-menu-row__url`, `.dnj-menu-row__count`, plus `--child`, `--empty`
  variants). Data-type attribute (`data-type="page|url|anchor|…"`) on
  the badge drives per-type color via CSS `[data-type]` selectors.
- **CSS scoped** under `.dnj-menu-editor` so no other array field in
  the admin (Tours itinerary, Accommodations rooms, gallery, testimonial
  items, etc.) is accidentally restyled.

**Why not a custom Field component?** Payload's native drag/drop, add
row, delete, and collapsible-with-form-editing already work perfectly.
Wrapping the whole array in a custom component would re-implement all
that from scratch and break on `@payloadcms/*` upgrades.

---

## 3. Files added / changed

| File | Action |
|------|--------|
| `apps/cms/src/components/MenuItemRowLabel.tsx` | **Rewritten** — classed markup, data-type on badge |
| `apps/cms/src/components/MenuChildRowLabel.tsx` | **Rewritten** — same pattern + `.dnj-menu-row--child` modifier |
| `apps/cms/src/admin/menu-editor.css` | **Added** — scoped card styles, per-type badge colors, sub-menu indent, add-row polish |
| `apps/cms/src/admin/AdminStyles.tsx` | **Modified** — imports `menu-editor.css` |
| `apps/cms/src/collections/Menus.ts` | **Modified** — added `admin.className: 'dnj-menu-editor'` on the `items` array |
| `apps/cms/src/app/(payload)/admin/importMap.js` | Payload auto-regenerates (no path changes — same RowLabel exports) |

---

## 4. Visual changes

### Row label output
```
[🔗 URL]  Home        /home            3 sub-items
[📄 PAGE] About       /about           —
[🧭 SERVICE] Tours    /tour            8 sub-items
[⚓ ANCHOR] FAQ       #faq             —
[🏷️ GROUP] More       (dropdown only)  —
```

Per-type badge color: `page` → leaf green, `service_index` → ocean,
`custom_url` → stone, `anchor` → coral, `none` → neutral gray. Empty
rows render a hollow "NEW" chip so blank inputs stay visible during
initial entry.

### Row card
- 1px hairline border with a 3px ocean left rule → reads as a discrete
  card, not a stacked list
- Hover: subtle lift shadow (light) / deeper glow (dark), border tint
- Drag handle: opacity 0.45 → 1 on row hover, accent color

### Sub-menu (children)
- 20px indent + dashed left rule
- Smaller card with a 2px muted-accent left border and elevation-50
  background — feels *inside* the parent
- Badge shrinks (10.5px → 9.5px), label weight drops (600 → 500)

### Add-row buttons
- Dashed border, accent-tinted background on hover — invites click

---

## 5. Replication guide

To apply the same visual pattern to another nested array:

**Prereq:** the array should render one-line-per-row (via a RowLabel
component). Custom RowLabels are recommended so the label content
carries the classed markup CSS keys on.

**Steps:**
1. **Tag the array with a marker className:**
   ```ts
   {
     name: 'itinerary', type: 'array',
     admin: {
       className: 'dnj-itinerary-editor',   // new marker
       initCollapsed: true,
       components: { RowLabel: '…' },
     },
     fields: [ … ],
   }
   ```

2. **Duplicate the CSS block from `menu-editor.css`** (§2 & §3
   sections — "TOP-LEVEL ITEMS" and "NESTED CHILD ARRAY"), swap
   `.dnj-menu-editor` for the new marker. All other selectors stay.

3. **Write a RowLabel** (or reuse `MenuItemRowLabel`'s shape) that
   emits `<span class="dnj-menu-row">` markup — the badge/label/URL/count
   CSS classes are collection-agnostic. Rename to your domain if you
   want (e.g. `dnj-itinerary-row` + CSS mirror) or reuse as-is.

**Candidates:**
- **Tours > itinerary** — perfect fit: array of steps with time/title/
  icon; add a marker + reuse. **Ready.**
- **Accommodations > rooms** (`Rooms & Pricing` tab) — similar
  card-list feel. **Ready.**
- **Any block with `admin: { components: { RowLabel } }`** already
  benefits from the same DOM shape.

---

## 6. Known limitations

- CSS targets Payload internal classes (`.array-field`,
  `.array-field__draggable-rows`, `.collapsible`, `.collapsible__drag`,
  `.collapsible__content`). Verified on Payload 3.33; re-verify after
  any `@payloadcms/*` upgrade.
- Deeper nesting (3+ levels) isn't handled — the child rules assume
  exactly one level of nesting. Menus has that structure by design.
- Sub-menu "Sub-menu" heading uses `.array-field__title` styling — the
  same class also appears on the outer `Menu Items` heading; we scope
  only the nested one via `.collapsible__content .array-field__header`.
- Sub-menu badges lose the emoji-icon on very narrow admin sidebars
  (below ~380px) due to the truncation on `.dnj-menu-row__label`. Rare.

---

## 7. Rollback

- Revert `admin/menu-editor.css` (delete file) + `AdminStyles.tsx`
  import + `Menus.ts` marker className.
- RowLabel components: `git revert` on this phase's commit restores the
  inline-style versions.
- No migration / data change to reverse.
