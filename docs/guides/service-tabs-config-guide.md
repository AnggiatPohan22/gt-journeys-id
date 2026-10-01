# Service Tabs Configuration Guide

## What This Is

All 8 service collections (Accommodations, Tours, WaterActivities, Yachts,
Restaurants, Venues, Rentals, Spa) use a shared tab structure with collapsible
accordion sections, color-coded borders, and icon badges.

Tab **labels**, **icons**, and **colors** are centralized in ONE config file
so they can be customized per project without touching each collection's
field structure.

## Where to Edit

**File:** `apps/cms/src/config/serviceTabsConfig.ts`

To rename a tab, change its icon, or change its color — edit **ONLY** this file.
Do NOT edit individual collection files (`Tours.ts`, `Accommodations.ts`, etc.)
for label/icon/color changes.

## What You CAN Change Here

- **Tab labels** (e.g. `"Rooms & Pricing"` → `"Kamar & Harga"`)
- **Section labels** within each tab
- **Icons** — must be a valid CSS class suffix matching a `section--{icon}`
  rule in `accordion-sections.css`
- **Tab colors** — must be one of: `overview`, `media`, `rooms`, `amenities`,
  `policies`, `custom`
- **initCollapsed** — whether a section starts open (`false`) or closed (`true`)

## What You CANNOT Change Here

- Which **fields** belong to which tab (structural — edit the collection file)
- Adding/removing **tabs** (structural — edit both the collection file AND this config)
- Field **types**, **validation**, or **data structure**
- The actual CSS color hex values (edit `accordion-sections.css` CSS variables)

## When Reusing This Template for a New Project

1. Open `serviceTabsConfig.ts`
2. For each service collection, update labels/icons/colors to match the new
   project's terminology (e.g. different industry may call "Rooms" something else)
3. Save, restart dev server — changes apply immediately across CMS
4. No database migration needed — this is presentation-layer only

## Available Colors

| Color Key | CSS Variable | Light Hex | Dark Hex | Typical Use |
|-----------|-------------|-----------|----------|-------------|
| `overview` | `--acc-overview` | `#1b3a4b` | `#5ba3c9` | Core identity / overview |
| `media` | `--acc-media` | `#6b9080` | `#8bd6b6` | Visual content |
| `rooms` | `--acc-rooms` | `#e07a5f` | `#f0a08a` | Commercial / pricing |
| `amenities` | `--acc-amenities` | `#1a8a7a` | `#5cd6c6` | Features / amenities |
| `policies` | `--acc-policies` | `#585860` | `#9494a0` | Policies / formal |
| `custom` | `--acc-custom` | `#0d1b2a` | `#7a8fa8` | Custom / flexible content |

To change the actual hex values, edit the CSS variables in
`apps/cms/src/admin/accordion-sections.css` (`:root` for light, `html[data-theme='dark']` for dark).

## Available Icons

Icons are CSS mask-image SVGs defined in `apps/cms/src/admin/accordion-sections.css`.
Each icon is a CSS class suffix used as `section--{icon}`.

| Icon Key | Visual | Used For |
|----------|--------|----------|
| `overview-desc` | FileText | Overview description sections |
| `quick-specs` | BarChart3 | Quick specs / stat cards |
| `highlights` | Star | Highlight tags |
| `featured-img` | Image | Featured image |
| `gallery` | Copy | Photo gallery |
| `checkin` | Clock | Check-in/out times |
| `rooms` | Bed | Room types |
| `booking` | Phone | WhatsApp booking |
| `amenities` | Sparkles | Amenity lists |
| `facilities` | Building | Categorized facilities |
| `location` | MapPin | Location / map |
| `experiences` | Compass | Nearby / curated experiences |
| `policies` | Shield | Booking policies |
| `related` | Radio | Related services |
| `blocks` | LayoutGrid | Content blocks |
| `pricing` | DollarSign | Pricing fields |
| `packages` | Package | Packages |
| `specs` | Wrench | Specifications |
| `itinerary` | TrendingUp | Itinerary steps |
| `meeting` | Bell | Meeting point / pickup |
| `includes` | CheckCircle | What's included |
| `video` | Play | Video URL |
| `safety` | ShieldCheck | Safety / requirements |
| `menu` | Utensils | Menu highlights |
| `hours` | Calendar | Opening hours |
| `features` | CheckSquare | Feature lists |
| `testimonials` | MessageSquare | Testimonials |
| `capacity` | Users | Capacity |

To add a new icon, add a `.section--{name}` rule in `accordion-sections.css`
with a `--section-icon` CSS variable pointing to an inline SVG data URI.

## How It Works

The config exports per-service tab definitions and a `sectionClass()` helper:

```typescript
import { accommodationsTabs as cfg, sectionClass } from '../config/serviceTabsConfig'

// In the collection file:
{
  type: 'collapsible',
  label: cfg.overview.sections.description.label,  // ← from config
  admin: {
    initCollapsed: cfg.overview.sections.description.initCollapsed,
    className: sectionClass(cfg.overview.color, cfg.overview.sections.description.icon),
    // generates: 'accordion-section accordion-tab--overview section--overview-desc'
  },
}
```

The `sectionClass(color, icon)` function generates the CSS className string
that connects to the accordion behavior (MutationObserver in `AccordionSections.tsx`)
and visual styling (colors + icons in `accordion-sections.css`).

## Architecture Note

This is a **developer-editable config**, NOT a CMS-editable setting. Superadmin
cannot change tab labels from the admin UI — this was a deliberate decision:
tab structure is a template/structural concern (developer's responsibility),
while content within the tabs is the client's responsibility.

See `docs/phases/phase-4-polish-launch/blocks-and-content/service-grid-cards/phase-4.18-service-content-tabs-v2.md` for full reasoning.
