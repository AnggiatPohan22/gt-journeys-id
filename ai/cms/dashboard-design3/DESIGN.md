---
name: Core Admin
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414754'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc0'
  primary: '#0059bb'
  on-primary: '#ffffff'
  primary-container: '#0070ea'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc7ff'
  secondary: '#575f67'
  on-secondary: '#ffffff'
  secondary-container: '#d8e1ea'
  on-secondary-container: '#5b646b'
  tertiary: '#006b24'
  on-tertiary: '#ffffff'
  tertiary-container: '#008730'
  on-tertiary-container: '#f7fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#dbe4ed'
  secondary-fixed-dim: '#bfc8d0'
  on-secondary-fixed: '#141d23'
  on-secondary-fixed-variant: '#3f484f'
  tertiary-fixed: '#83fc8e'
  tertiary-fixed-dim: '#66df75'
  on-tertiary-fixed: '#002106'
  on-tertiary-fixed-variant: '#00531a'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  settings-panel-width: 320px
  gutter: 24px
  container-padding: 32px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

This design system is built for high-performance SaaS environments, prioritizing clarity, data density, and professional reliability. The aesthetic is **Corporate / Modern**, blending the structured information architecture of a CMS with the vibrant, approachable feel of modern product design.

The personality is efficient and transparent. It uses high-contrast typography against clean white surfaces to minimize cognitive load, while employing a "vibrant functionalism" where color is used strictly to indicate action, status, or primary branding. The goal is to evoke a sense of control and precision for power users managing complex data sets.

## Colors

The palette is anchored by a pure white (`#FFFFFF`) surface to maximize the "breathability" of the interface. 

- **Primary Blue:** Used for call-to-actions, active navigation states, and progress indicators. It is the singular high-vibrancy accent.
- **Neutrals:** A multi-step scale of grays is used to create visual hierarchy. Subtle grays (`#F8F9FA`) define background containers, while slightly darker shades (`#E9ECEF`) are reserved for thin, 1px borders that separate layout blocks.
- **Semantic Colors:** Standardized success (green), warning (amber), and error (red) tones should be used with low-saturation backgrounds and high-saturation text to ensure legibility.

## Typography

The system utilizes **Inter** for its exceptional legibility in data-heavy environments. The hierarchy is strictly enforced:

- **Headlines:** Use tighter letter spacing and heavier weights to anchor page sections.
- **Labels:** Small caps or medium weights are used for form labels and table headers to distinguish them from user-generated content.
- **Numerical Data:** For dashboards, ensure `tabular-nums` (font-feature-settings) is enabled to allow vertical alignment of figures in lists and tables.

## Layout & Spacing

The layout follows a **tri-pane fixed-fluid structure** inspired by complex editors:

1.  **Primary Navigation (Left):** A fixed 260px sidebar for top-level application routing.
2.  **Main Content (Center):** A fluid area that expands to fill the remaining space. Content is organized into cards or "blocks" with 24px gutters.
3.  **Contextual Panel (Right):** A fixed 320px panel for secondary settings, meta-data, or inspector tools.

On tablet devices, the right panel collapses into a drawer. On mobile, both the sidebar and right panel are hidden behind a burger menu and info-toggle respectively, leaving the main content area to take 100% width.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows.

- **Level 0 (Background):** The base application background uses a very light gray (`#F4F6F8`) to provide contrast for the white cards.
- **Level 1 (Cards/Panels):** Pure white surfaces with a 1px border (`#E9ECEF`).
- **Level 2 (Dropdowns/Modals):** These elements use soft, ambient shadows (0px 10px 15px -3px rgba(0, 0, 0, 0.05)) to suggest they are floating above the interface.

Avoid stacking more than three layers of depth to maintain the clean, "flat" SaaS aesthetic.

## Shapes

The shape language is consistently **Rounded**. 

- **Standard Elements:** Buttons, input fields, and small chips use an 8px (0.5rem) radius.
- **Layout Containers:** Large content cards and main panels use a 16px (1rem) radius to create a softer, modern look.
- **Interactive States:** Hover states on list items should use a 6px radius to fit comfortably within parent containers.

## Components

### Buttons
Primary buttons use the primary blue with white text. Secondary buttons are ghost-style with a subtle border. High-action buttons (like "Save" or "Publish") may use a subtle gradient or increased weight.

### Input Fields
Inputs are white with a 1px light gray border. On focus, the border transitions to primary blue with a 2px soft glow (ring).

### Chips & Tags
Used for status (e.g., "Published", "Draft"). These should have a low-opacity background of the status color (e.g., 10% green for "Success") with high-opacity text.

### Content Blocks
Following the CMS style, content blocks are draggable units with a handle icon on the left, a title, and a collapse/expand toggle on the right.

### Data Tables
Tables should have no outer border, only internal horizontal dividers. Row hover states use the neutral light gray background to provide clear visual feedback without clutter.