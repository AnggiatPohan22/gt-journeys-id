/**
 * Service Tabs Config — SINGLE SOURCE OF TRUTH
 * =============================================
 * Controls tab labels, section labels, icon CSS classes, and color CSS
 * classes for all 8 service collection editors.
 *
 * To rename a tab, change an icon, or swap a color — edit ONLY this file.
 * Field structure (which fields go where) stays in each collection file.
 *
 * Icons are CSS class suffixes that map to `section--{icon}` rules in
 * `accordion-sections.css` (mask-image SVGs). Colors are CSS class
 * suffixes that map to `accordion-tab--{color}` rules.
 *
 * @see docs/guides/service-tabs-config-guide.md
 */

export type TabColor = 'overview' | 'media' | 'rooms' | 'amenities' | 'policies' | 'custom'

export interface SectionConfig {
  label: string
  icon: string
  initCollapsed: boolean
}

export interface TabConfig {
  label: string
  color: TabColor
  sections: Record<string, SectionConfig>
}

export interface ServiceTabsConfig {
  [tabKey: string]: TabConfig
}

export function sectionClass(color: TabColor, icon: string): string {
  return `accordion-section accordion-tab--${color} section--${icon}`
}

// ─── Accommodations ──────────────────────────────────────────────
export const accommodationsTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
      highlights:  { label: 'Highlight Tags',          icon: 'highlights',   initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
    },
  },
  tab3: {
    label: 'Rooms & Pricing', color: 'rooms',
    sections: {
      checkInOut: { label: 'Check-in & Check-out', icon: 'checkin',  initCollapsed: false },
      rooms:      { label: 'Room Types',           icon: 'rooms',    initCollapsed: true },
      booking:    { label: 'Booking (WhatsApp)',    icon: 'booking',  initCollapsed: true },
    },
  },
  tab4: {
    label: 'Amenities & Location', color: 'amenities',
    sections: {
      amenities:   { label: 'Amenities',            icon: 'amenities',   initCollapsed: false },
      facilities:  { label: 'Facilities',           icon: 'facilities',  initCollapsed: true },
      location:    { label: 'Location',             icon: 'location',    initCollapsed: true },
      experiences: { label: 'Nearby & Experiences', icon: 'experiences', initCollapsed: true },
    },
  },
  policies: {
    label: 'Policies', color: 'policies',
    sections: {
      booking: { label: 'Booking Policies', icon: 'policies', initCollapsed: false },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Tours ───────────────────────────────────────────────────────
export const toursTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
      highlights:  { label: 'Highlights',              icon: 'highlights',   initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
      video:    { label: 'Video',          icon: 'video',        initCollapsed: true },
    },
  },
  tab3: {
    label: 'Itinerary & Pricing', color: 'rooms',
    sections: {
      itinerary: { label: 'Itinerary',          icon: 'itinerary', initCollapsed: false },
      meeting:   { label: 'Meeting & Pickup',   icon: 'meeting',   initCollapsed: true },
      pricing:   { label: 'Pricing',            icon: 'pricing',   initCollapsed: true },
      booking:   { label: 'Booking (WhatsApp)', icon: 'booking',   initCollapsed: true },
    },
  },
  tab4: {
    label: 'Inclusions & Info', color: 'amenities',
    sections: {
      includes: { label: "What's Included",     icon: 'includes', initCollapsed: false },
      excludes: { label: "What's NOT Included", icon: 'includes', initCollapsed: true },
    },
  },
  policies: {
    label: 'Policies', color: 'policies',
    sections: {
      additional: { label: 'Policies & Additional Info', icon: 'policies', initCollapsed: false },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Water Activities ────────────────────────────────────────────
export const waterActivitiesTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
    },
  },
  tab3: {
    label: 'Activity & Pricing', color: 'rooms',
    sections: {
      whatToBring: { label: 'What to Bring',       icon: 'includes', initCollapsed: false },
      pricing:     { label: 'Pricing',             icon: 'pricing',  initCollapsed: true },
      booking:     { label: 'Booking (WhatsApp)',  icon: 'booking',  initCollapsed: true },
    },
  },
  tab4: {
    label: 'Safety & Requirements', color: 'policies',
    sections: {
      safety: { label: 'Safety & Requirements', icon: 'safety', initCollapsed: false },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Yachts ──────────────────────────────────────────────────────
export const yachtsTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
    },
  },
  tab3: {
    label: 'Charter & Pricing', color: 'rooms',
    sections: {
      specs:    { label: 'Specifications',       icon: 'specs',    initCollapsed: false },
      packages: { label: 'Cruise Packages',      icon: 'packages', initCollapsed: true },
      booking:  { label: 'Booking (WhatsApp)',   icon: 'booking',  initCollapsed: true },
    },
  },
  tab4: {
    label: 'Amenities', color: 'amenities',
    sections: {
      amenities: { label: 'Amenities', icon: 'amenities', initCollapsed: false },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Restaurants ─────────────────────────────────────────────────
export const restaurantsTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
    },
  },
  tab3: {
    label: 'Menu & Dining', color: 'rooms',
    sections: {
      menu:    { label: 'Menu Highlights',     icon: 'menu',    initCollapsed: false },
      booking: { label: 'Booking (WhatsApp)',  icon: 'booking', initCollapsed: true },
    },
  },
  tab4: {
    label: 'Features & Location', color: 'amenities',
    sections: {
      features: { label: 'Features',      icon: 'features', initCollapsed: false },
      location: { label: 'Location',      icon: 'location', initCollapsed: true },
      hours:    { label: 'Opening Hours', icon: 'hours',    initCollapsed: true },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Venues ──────────────────────────────────────────────────────
export const venuesTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
      capacity:    { label: 'Capacity',                icon: 'capacity',     initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
    },
  },
  tab3: {
    label: 'Packages & Pricing', color: 'rooms',
    sections: {
      packages: { label: 'Packages',           icon: 'packages', initCollapsed: false },
      booking:  { label: 'Booking (WhatsApp)', icon: 'booking',  initCollapsed: true },
    },
  },
  tab4: {
    label: 'Features & Location', color: 'amenities',
    sections: {
      features:     { label: 'Features',      icon: 'features',     initCollapsed: false },
      location:     { label: 'Location',      icon: 'location',     initCollapsed: true },
      testimonials: { label: 'Testimonials',  icon: 'testimonials', initCollapsed: true },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Rentals ─────────────────────────────────────────────────────
export const rentalsTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
    },
  },
  tab3: {
    label: 'Rental & Pricing', color: 'rooms',
    sections: {
      specs:    { label: 'Specifications',       icon: 'specs',    initCollapsed: false },
      features: { label: 'Features',             icon: 'features', initCollapsed: true },
      pricing:  { label: 'Pricing Tiers',        icon: 'pricing',  initCollapsed: true },
      booking:  { label: 'Booking (WhatsApp)',   icon: 'booking',  initCollapsed: true },
    },
  },
  tab4: {
    label: 'Includes & Requirements', color: 'amenities',
    sections: {
      includes:     { label: "What's Included", icon: 'includes', initCollapsed: false },
      requirements: { label: 'Requirements',    icon: 'safety',   initCollapsed: true },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Spa ─────────────────────────────────────────────────────────
export const spaTabs: ServiceTabsConfig = {
  overview: {
    label: 'Overview', color: 'overview',
    sections: {
      description: { label: 'Overview & Description', icon: 'overview-desc', initCollapsed: false },
      quickSpecs:  { label: 'Quick Specs',             icon: 'quick-specs',  initCollapsed: true },
    },
  },
  media: {
    label: 'Media', color: 'media',
    sections: {
      featured: { label: 'Featured Image', icon: 'featured-img', initCollapsed: false },
      gallery:  { label: 'Gallery',        icon: 'gallery',      initCollapsed: true },
    },
  },
  tab3: {
    label: 'Treatments & Pricing', color: 'rooms',
    sections: {
      specs:    { label: 'Specifications',       icon: 'specs',    initCollapsed: false },
      packages: { label: 'Treatment Packages',   icon: 'packages', initCollapsed: true },
      pricing:  { label: 'Pricing Tiers',        icon: 'pricing',  initCollapsed: true },
      booking:  { label: 'Booking (WhatsApp)',   icon: 'booking',  initCollapsed: true },
    },
  },
  tab4: {
    label: 'Includes & Requirements', color: 'amenities',
    sections: {
      includes:     { label: "What's Included", icon: 'includes', initCollapsed: false },
      requirements: { label: 'Requirements',    icon: 'safety',   initCollapsed: true },
    },
  },
  customSections: {
    label: '\u{1F512} Custom Sections', color: 'custom',
    sections: {
      related: { label: 'Related Services', icon: 'related', initCollapsed: false },
      blocks:  { label: 'Content Blocks',   icon: 'blocks',  initCollapsed: true },
    },
  },
}

// ─── Master index (for programmatic access) ──────────────────────
export const SERVICE_TABS: Record<string, ServiceTabsConfig> = {
  accommodations: accommodationsTabs,
  tours: toursTabs,
  'water-activities': waterActivitiesTabs,
  yachts: yachtsTabs,
  restaurants: restaurantsTabs,
  venues: venuesTabs,
  rentals: rentalsTabs,
  spa: spaTabs,
}
