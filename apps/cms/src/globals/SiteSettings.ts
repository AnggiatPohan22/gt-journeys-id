import type { GlobalConfig, Condition, GroupField } from 'payload'
import { isAdmin, superAdminFieldAccess } from '../access/roles'
import { relatedServicesGlobalFields } from '../fields/relatedServices'

/** Client-side condition: only render for super-admin (UI hiding only — server-side enforcement is via field-level `access`). */
const superAdminOnly: Condition = (_data, _siblingData, { user }) => user?.role === 'super-admin'

/** Field-level access: read stays public (frontend needs it); update restricted to super-admin. */
const superAdminUpdateOnly = {
  update: superAdminFieldAccess,
}

/**
 * Site Settings — global configuration for the whole site.
 *
 * UI is organised into tabs (Payload `type: 'tabs'` is presentation-only —
 * every field still stores at the root of the `site-settings` global, so
 * payload-types and the DB shape are IDENTICAL to the pre-tabs version).
 * Do not add a `name` to any tab; unnamed tabs pass through to root.
 *
 * Inside each tab, sub-sections are wrapped in `type: 'collapsible'`
 * accordions. Collapsibles are also presentation-only — the underlying
 * groups keep their `name`, so every data path (e.g. `contact.whatsapp`,
 * `footer.copyrightText`) is unchanged.
 *
 * Default state per tab: the first sub-section renders expanded,
 * every following sub-section renders collapsed. Exception: the
 * "Tracking Scripts" sub-section under Advanced is always collapsed
 * by default (danger zone — raw HTML injection).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    hidden: ({ user }) => user?.role === 'editor',
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─────────────────────────────────────────────────────────────
        // 1. BRAND — identity, logos, favicon
        // ─────────────────────────────────────────────────────────────
        {
          label: 'Brand',
          description: 'Site name, tagline, and brand assets shown across the header, footer, and browser tab.',
          fields: [
            {
              type: 'collapsible',
              label: 'Names & Tagline',
              admin: { initCollapsed: false, description: 'Text identity used in the browser tab, headers, and SEO fallbacks.' },
              fields: [
                {
                  name: 'siteName',
                  type: 'text',
                  required: true,
                  defaultValue: 'DnJourneysBali',
                  admin: {
                    description: 'Appears in the browser tab, default SEO titles, and as the fallback for footer copyright.',
                  },
                },
                {
                  name: 'tagline',
                  type: 'text',
                  admin: {
                    description: 'Short brand line shown under the logo (where enabled) and used as a default SEO description fallback.',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Brand Assets',
              admin: { initCollapsed: true, description: 'Logo variants and favicon. SVG preferred for crisp rendering at any size.' },
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo (Light Background)',
                  admin: {
                    description: 'Primary logo used on light navbars/sections. SVG preferred; PNG accepted at 2× (e.g. 400×120).',
                  },
                },
                {
                  name: 'logoDark',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo (Dark Background)',
                  admin: {
                    description: 'Optional. Used on dark navbar/footer variants. Falls back to the main Logo if empty.',
                  },
                },
                {
                  name: 'favicon',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Small icon shown in the browser tab. Square image, recommended 64×64 (PNG or SVG).',
                  },
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────
        // 2. CONTACT & SOCIALS — reachable channels + social links
        // ─────────────────────────────────────────────────────────────
        {
          label: 'Contact & Socials',
          description: 'How guests reach you: WhatsApp, email, phone, address, and social profiles.',
          fields: [
            {
              type: 'collapsible',
              label: 'Contact Details',
              admin: {
                initCollapsed: false,
                description: 'Primary contact channels. Used by the header, footer, floating WhatsApp button, and every service detail page.',
              },
              fields: [
                {
                  name: 'contact',
                  type: 'group',
                  label: 'Contact Details',
                  admin: { hideGutter: true },
                  fields: [
                    {
                      name: 'email',
                      type: 'email',
                      admin: { description: 'Public contact email address.' },
                    },
                    {
                      name: 'phone',
                      type: 'text',
                      admin: { description: 'Display phone number for the footer. Include country code, e.g. +62 812 3456 7890.' },
                    },
                    {
                      name: 'whatsapp',
                      type: 'text',
                      label: 'WhatsApp Number (Primary)',
                      admin: {
                        description: 'Primary WhatsApp number used across the whole site (header button, floating button, service enquiries). Digits only with country code, no + or spaces, e.g. 6281234567890.',
                      },
                    },
                    {
                      name: 'address',
                      type: 'textarea',
                      admin: { description: 'Physical or mailing address shown in the footer and on the contact page.' },
                    },
                    {
                      name: 'mapEmbed',
                      type: 'text',
                      label: 'Google Maps Embed URL',
                      admin: {
                        description: 'Paste ONLY the `src` URL from a Google Maps "Embed a map" iframe (starts with https://www.google.com/maps/embed?…). Do not paste the full <iframe> tag.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'WhatsApp — Floating Button Defaults',
              admin: {
                initCollapsed: true,
                description: 'Extra settings for the floating WhatsApp button only. The primary number above is always used first.',
              },
              fields: [
                {
                  name: 'whatsappDefaults',
                  type: 'group',
                  label: 'WhatsApp — Floating Button Defaults',
                  admin: { hideGutter: true },
                  fields: [
                    {
                      name: 'defaultNumber',
                      type: 'text',
                      label: 'Fallback WhatsApp Number',
                      admin: {
                        description: 'Optional. Used only by the floating WhatsApp button if the primary WhatsApp Number above is empty. Same format: 6281234567890.',
                      },
                    },
                    {
                      name: 'greetingMessage',
                      type: 'textarea',
                      label: 'Default Greeting Message',
                      admin: {
                        description: 'Pre-filled message opened when a guest taps the floating WhatsApp button on a page that does not define its own template.',
                      },
                    },
                    {
                      name: 'businessHours',
                      type: 'textarea',
                      label: 'Business Hours (Footer)',
                      admin: {
                        description: 'Shown in the footer under WhatsApp. Free text, one line per day, e.g. "Mon–Fri 09:00–18:00 (WITA)".',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Social Profiles',
              admin: {
                initCollapsed: true,
                description: 'Full profile URLs (not just handles). Leave blank to hide the icon in the footer.',
              },
              fields: [
                {
                  name: 'socialMedia',
                  type: 'group',
                  label: 'Social Profiles',
                  admin: { hideGutter: true },
                  fields: [
                    { name: 'instagram',   type: 'text', admin: { description: 'Full URL, e.g. https://instagram.com/dnjourneysbali' } },
                    { name: 'facebook',    type: 'text', admin: { description: 'Full URL, e.g. https://facebook.com/dnjourneysbali' } },
                    { name: 'tiktok',      type: 'text', admin: { description: 'Full URL, e.g. https://tiktok.com/@dnjourneysbali' } },
                    { name: 'youtube',     type: 'text', admin: { description: 'Full URL, e.g. https://youtube.com/@dnjourneysbali' } },
                    { name: 'tripadvisor', type: 'text', admin: { description: 'Full URL to the TripAdvisor listing.' } },
                  ],
                },
              ],
            },

            // ── Payment Methods (Phase 4.48) ─────────────────────────────
            // Source of truth global untuk badge payment (Visa, GoPay,
            // BCA, dll). Konsumen: kolom Footer type `contact` (dgn
            // showPaymentMethods) atau kolom `paymentMethods` dedicated.
            {
              type: 'collapsible',
              label: 'Payment Methods',
              admin: {
                initCollapsed: true,
                description: 'Badge/logo payment yang di-support. Ditampilkan di footer atau checkout page. Upload logo transparent (PNG/SVG), tinggi ~24-32px.',
              },
              fields: [
                {
                  name: 'paymentMethods',
                  type: 'array',
                  label: 'Payment Methods',
                  labels: { singular: 'Payment Method', plural: 'Payment Methods' },
                  admin: { description: 'Kosongkan kalau tidak mau tampil.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true, admin: { width: '40%', description: 'Nama payment (mis. "Visa", "GoPay").' } },
                        { name: 'logo',  type: 'upload', relationTo: 'media', required: true, admin: { width: '35%', description: 'Transparent PNG/SVG.' } },
                        { name: 'url',   type: 'text', admin: { width: '25%', description: 'Optional. URL provider (opsional).' } },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────
        // 3. SEO & ANALYTICS — defaults + tracking IDs
        //    (defaultSeo group already contains 2 inner collapsibles —
        //     "SEO Metadata (Fallback)" open, "Analytics" collapsed.)
        // ─────────────────────────────────────────────────────────────
        {
          label: 'SEO & Analytics',
          description: 'Site-wide SEO fallbacks and analytics tracking IDs. Individual pages can override the SEO fields.',
          fields: [
            {
              name: 'defaultSeo',
              type: 'group',
              label: 'Default SEO & Analytics',
              admin: {
                description: 'These values are used when a page or service does not define its own SEO. Analytics IDs are optional.',
              },
              fields: [
                {
                  type: 'collapsible',
                  label: 'SEO Metadata (Fallback)',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      name: 'metaTitle',
                      type: 'text',
                      admin: { description: 'Default browser-tab / search-result title. Aim for 50–60 characters.' },
                    },
                    {
                      name: 'metaDescription',
                      type: 'textarea',
                      maxLength: 160,
                      admin: { description: 'Default snippet shown in search results. Max 160 characters.' },
                    },
                    {
                      name: 'ogImage',
                      type: 'upload',
                      relationTo: 'media',
                      admin: { description: 'Default image used when the site is shared on social media. Recommended 1200×630.' },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Analytics (Optional)',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      name: 'googleAnalyticsId',
                      type: 'text',
                      label: 'Google Analytics ID',
                      admin: { description: 'GA4 Measurement ID, e.g. G-XXXXXXXXXX. Leave empty to disable GA.' },
                    },
                    {
                      name: 'cloudflareWebAnalyticsToken',
                      type: 'text',
                      label: 'Cloudflare Web Analytics Token',
                      admin: {
                        description: 'Site token from Cloudflare Web Analytics (privacy-first, cookieless). Can be used alongside Google Analytics.',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────
        // 4. LAYOUT — global spacing between and inside blocks
        // ─────────────────────────────────────────────────────────────
        {
          label: 'Layout',
          description: 'Global spacing defaults. Every page block can override these via its own Advanced tab.',
          fields: [
            {
              name: 'layout',
              type: 'group',
              label: 'Global Block Spacing',
              admin: {
                description: 'Vertical rhythm between blocks and internal padding defaults used across all pages.',
                hideGutter: true,
              },
              fields: [
                {
                  type: 'collapsible',
                  label: 'Vertical Gaps',
                  admin: { initCollapsed: false, description: 'Space between blocks on a page, and the space before the footer.' },
                  fields: [
                    {
                      name: 'blockGap',
                      type: 'select',
                      defaultValue: 'normal',
                      label: 'Gap Between Blocks',
                      admin: { description: 'Vertical space between page blocks. Compact = tight, Normal = standard, Spacious = airy.' },
                      options: [
                        { label: 'Compact', value: 'compact' },
                        { label: 'Normal (default)', value: 'normal' },
                        { label: 'Spacious', value: 'spacious' },
                      ],
                    },
                    {
                      name: 'beforeFooter',
                      type: 'select',
                      label: 'Gap Before Footer',
                      admin: { description: 'Space between the last block on a page and the footer. If left empty, follows the Gap Between Blocks setting.' },
                      options: [
                        { label: 'Compact', value: 'compact' },
                        { label: 'Normal', value: 'normal' },
                        { label: 'Spacious', value: 'spacious' },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Block Padding (Internal)',
                  admin: {
                    initCollapsed: true,
                    description: 'Internal top/bottom padding applied inside every block. Individual blocks can override via their Advanced tab.',
                  },
                  fields: [
                    {
                      name: 'blockPadding',
                      type: 'group',
                      label: 'Block Padding (Internal)',
                      admin: { hideGutter: true },
                      fields: [
                        {
                          name: 'top',
                          type: 'group',
                          label: 'Top Padding',
                          fields: [
                            { name: 'mobile',  type: 'number', defaultValue: 48, min: 0, max: 200, admin: { description: 'Pixels, screens under 768px.' } },
                            { name: 'desktop', type: 'number', defaultValue: 64, min: 0, max: 200, admin: { description: 'Pixels, screens 768px and up.' } },
                          ],
                        },
                        {
                          name: 'bottom',
                          type: 'group',
                          label: 'Bottom Padding',
                          fields: [
                            { name: 'mobile',  type: 'number', defaultValue: 48, min: 0, max: 200, admin: { description: 'Pixels, screens under 768px.' } },
                            { name: 'desktop', type: 'number', defaultValue: 64, min: 0, max: 200, admin: { description: 'Pixels, screens 768px and up.' } },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────
        // 5. CONTENT DEFAULTS — listing headlines, related-services cascade, placeholder pages
        // ─────────────────────────────────────────────────────────────
        {
          label: 'Content Defaults',
          description: 'Reusable copy and block defaults shared across many pages.',
          fields: [
            {
              type: 'collapsible',
              label: 'Listing Page Headline',
              admin: {
                initCollapsed: false,
                description: 'Headline copy for service listing pages (villa, tour, etc.) using the immersive hero layout.',
                condition: superAdminOnly,
              },
              fields: [
                {
                  name: 'sectionPages',
                  type: 'group',
                  label: 'Listing Page Headline',
                  access: superAdminUpdateOnly,
                  admin: { hideGutter: true, condition: superAdminOnly },
                  fields: [
                    {
                      name: 'listingTitle',
                      type: 'text',
                      label: 'Listing Title',
                      defaultValue: 'Luxury Collections',
                      admin: { description: 'Main heading shown on the listing hero.' },
                    },
                    {
                      name: 'listingSubtitle',
                      type: 'text',
                      label: 'Listing Subtitle',
                      defaultValue: 'properties available in Bali & surrounding islands',
                      admin: {
                        description: 'Shown after the live result count. Example output: "12 properties available in Bali & surrounding islands".',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Related Services (Global Default)',
              admin: {
                initCollapsed: true,
                description:
                  'Default block config for the "Related Services" section on every service detail page. Overridable per Service Type and per individual service (Phase 4.17 cascade).',
                condition: superAdminOnly,
              },
              fields: [
                // Augment the shared factory's returned group with super-admin-only
                // access.update + admin.condition. Shape/name unchanged; the factory
                // stays reusable elsewhere without the restriction.
                (() => {
                  const f = relatedServicesGlobalFields() as GroupField
                  return {
                    ...f,
                    access: { ...(f.access ?? {}), ...superAdminUpdateOnly },
                    admin: { ...(f.admin ?? {}), condition: superAdminOnly },
                  } as GroupField
                })(),
              ],
            },
            {
              type: 'collapsible',
              label: 'Error & Placeholder Pages',
              admin: {
                initCollapsed: true,
                description: 'Copy for the 404 page and any temporary "coming soon" placeholder pages.',
                condition: superAdminOnly,
              },
              fields: [
                {
                  name: 'errorPages',
                  type: 'group',
                  label: 'Error & Placeholder Pages',
                  access: superAdminUpdateOnly,
                  admin: { hideGutter: true, condition: superAdminOnly },
                  fields: [
                    {
                      type: 'collapsible',
                      label: '404 — Page Not Found',
                      admin: { initCollapsed: true },
                      fields: [
                        {
                          name: 'notFound',
                          type: 'group',
                          label: '404 Copy',
                          admin: { hideGutter: true },
                          fields: [
                            { name: 'title',      type: 'text',     defaultValue: 'Halaman Tidak Ditemukan', admin: { description: 'Main heading on the 404 page.' } },
                            { name: 'message',    type: 'textarea', defaultValue: 'Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau modul-nya sedang dinonaktifkan.', admin: { description: 'Body text explaining what happened.' } },
                            { name: 'buttonText', type: 'text',     defaultValue: 'Kembali ke Beranda', admin: { description: 'Label for the button that returns to the homepage.' } },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'collapsible',
                      label: '/property — Coming Soon',
                      admin: { initCollapsed: true, description: 'Temporary placeholder shown at /property until the Property module ships.' },
                      fields: [
                        {
                          name: 'propertyComingSoon',
                          type: 'group',
                          label: 'Property Coming Soon Copy',
                          admin: { hideGutter: true },
                          fields: [
                            { name: 'eyebrow',             type: 'text',     defaultValue: 'Coming Soon',                                                                                                                                                                                                          admin: { description: 'Small label above the main title.' } },
                            { name: 'title',               type: 'text',     defaultValue: 'Property & Land for Sale',                                                                                                                                                                                             admin: { description: 'Main heading of the placeholder page.' } },
                            { name: 'description',         type: 'textarea', defaultValue: 'Layanan property & land for sale di Bali sedang kami siapkan. Sementara ini, kalau kamu tertarik cari villa, tanah, atau rumah investasi di Bali, hubungi kami langsung — tim lokal kami siap bantu dengan listing eksklusif yang belum masuk website.', admin: { description: 'Explanatory paragraph shown to visitors.' } },
                            { name: 'whatsappMessage',     type: 'textarea', defaultValue: 'Halo DnJourneysBali! 👋\n\nSaya tertarik dengan Property & Land for Sale di Bali. Boleh info listing yang tersedia?',                                                                                                    admin: { description: 'Pre-filled WhatsApp message when the primary button is tapped.' } },
                            { name: 'primaryButtonText',   type: 'text',     defaultValue: 'Enquire via WhatsApp',                                                                                                                                                                                                  admin: { description: 'Label for the WhatsApp CTA button.' } },
                            { name: 'secondaryButtonText', type: 'text',     defaultValue: 'Back to Home',                                                                                                                                                                                                          admin: { description: 'Label for the secondary "back to home" button.' } },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ─────────────────────────────────────────────────────────────
        // 6. ADVANCED — footer copy + raw tracking scripts (danger zone)
        // ─────────────────────────────────────────────────────────────
        {
          label: 'Advanced',
          description: 'Footer copy and raw tracking scripts. Only edit the tracking scripts field if you understand what you are pasting.',
          fields: [
            {
              name: 'footer',
              type: 'group',
              label: 'Footer & Tracking',
              access: superAdminUpdateOnly,
              admin: {
                description: 'Footer copyright line and any additional HTML/JS injected before </body>.',
                hideGutter: true,
                condition: superAdminOnly,
              },
              fields: [
                {
                  type: 'collapsible',
                  label: 'Footer Copyright',
                  admin: { initCollapsed: false, description: 'Copy shown at the bottom of every page footer.', condition: superAdminOnly },
                  fields: [
                    {
                      name: 'copyrightText',
                      type: 'text',
                      label: 'Footer Copyright Text',
                      admin: { description: 'Free text shown at the bottom of the footer. Example: "© 2026 DnJourneysBali. All rights reserved."' },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: '⚠️ Tracking Scripts (Advanced)',
                  admin: {
                    initCollapsed: true,
                    description: '⚠️ DANGER ZONE — HTML/JS injected verbatim before </body>. Only paste code from trusted providers.',
                    condition: superAdminOnly,
                  },
                  fields: [
                    {
                      name: 'additionalScripts',
                      type: 'code',
                      label: 'Tracking Scripts (Advanced)',
                      admin: {
                        language: 'html',
                        description:
                          '⚠️ DANGER ZONE. Pasted HTML/JS is injected verbatim before </body> on every page. Only paste code from trusted providers (Meta Pixel, Hotjar, etc.). Hostile code here can steal visitor data. Leave empty if unsure.',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
