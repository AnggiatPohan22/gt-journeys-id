---
name: Emerald Voyage CMS
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3f4944'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6f7973'
  outline-variant: '#bec9c2'
  surface-tint: '#1b6b51'
  primary: '#004532'
  on-primary: '#ffffff'
  primary-container: '#065f46'
  on-primary-container: '#8bd6b7'
  inverse-primary: '#8bd6b6'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#00462f'
  on-tertiary: '#ffffff'
  tertiary-container: '#006042'
  on-tertiary-container: '#47e0a5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f2d1'
  primary-fixed-dim: '#8bd6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-margin: 32px
  gutter: 24px
  card-padding: 24px
  section-gap: 48px
  floating-offset: 16px
---

## Brand & Style

This design system is built for a futuristic, high-end Tour & Travel CMS. It targets travel agencies and property managers who value a premium, fluid experience over rigid corporate structures. 

The aesthetic is **Organic Glassmorphism**—a blend of futuristic tech and natural fluidity. It utilizes "floating box" containers that feel untethered from the page edges, emphasizing a sense of exploration and freedom. The emotional goal is to evoke a feeling of "sophisticated adventure," where complex data management feels like navigating a high-end travel lounge.

Key principles:
- **Luminosity:** Use of glowing accents and translucent layers to simulate depth.
- **Fluidity:** Extra-rounded corners and soft transitions that mimic organic shapes.
- **Clarity:** High-contrast typography to ensure that data-heavy screens remain legible amidst vibrant visual effects.

## Colors

The palette is anchored by **Deep Emerald Green**, transitioning into vibrant mint and seafoam gradients to reflect exotic travel destinations. 

- **Primary:** Deep Emerald (#065F46) for key actions and branding.
- **Gradients:** Use linear gradients from Primary to Tertiary for "hero" cards and active states (e.g., `linear-gradient(135deg, #065F46 0%, #10B981 100%)`).
- **Dark Mode:** Surface backgrounds shift to a deep Charcoal/Navy (#0F172A). Translucency is increased to 15% opacity for cards, allowing the "glowing" accents behind the containers to create a sense of depth.
- **Accents:** Use vibrant mint for success states and "live" indicators.

## Typography

We use **Geist** for its technical precision and clean, high-contrast legibility. 

- **Hierarchy:** Display and Headline levels use tighter letter spacing and heavier weights to create a "bold" editorial look.
- **Utility:** Labels and Metadata (label-sm) should be slightly tracked out for better readability when used in dense CMS tables.
- **Emphasis:** In the Media or Page Editor, use `display-lg` sparingly to highlight total revenue or active traveler counts.

## Layout & Spacing

The layout utilizes a **Floating Box** model. Instead of elements touching the edge of the viewport, the main content area sits within a parent container with a consistent `container-margin`.

- **Grid:** A 12-column fluid grid is used for the dashboard, but components "float" with subtle drop shadows to create a non-rigid appearance.
- **Sidebars:** The navigation sidebar should be detached from the top and bottom of the screen, appearing as a vertical floating island.
- **Safe Areas:** On mobile, margins reduce to 16px, and the 12-column grid collapses to a single column with cards maintaining an 8px "floating" gap from the screen edges.

## Elevation & Depth

Depth is achieved through **Glassmorphism and Tonal Layering** rather than traditional heavy shadows.

1.  **Level 0 (Base):** Subtle neutral background (#F8FAFC) or deep navy for dark mode.
2.  **Level 1 (Main Containers):** White or dark charcoal at 80% opacity with a `20px` backdrop-blur.
3.  **Level 2 (Active Cards):** Full opacity surfaces with a vibrant, colored glow shadow (`box-shadow: 0 20px 40px rgba(16, 185, 129, 0.1)`).
4.  **Overlays:** High-blur glass effects (40px blur) for modals and dropdown menus to isolate them from the complex background data.

## Shapes

The design system embraces **Extra-Rounded (Pill-style)** geometry to counteract the "cold" feeling of CMS data.

- **Primary Cards:** Use `rounded-xl` (1.5rem / 24px) to create a friendly, modern look.
- **Buttons/Inputs:** Use fully pill-shaped (rounded-full) corners.
- **Media Thumbnails:** Should use a slightly softer `rounded-lg` (1rem / 16px) to maximize the visible area of the travel photography while remaining consistent with the overall system.

## Components

### Buttons
- **Primary:** Gradient background (Emerald to Mint), white text, pill-shaped, with a subtle glow on hover.
- **Secondary:** Ghost style with a thin emerald border and a 5% translucent emerald fill.

### Cards
- **Stat Cards:** Feature a "glow accent" in the top-right corner. Use glassmorphism background blurs.
- **Floating Box:** Main dashboard sections should have a white/dark-navy border (1px, 10% opacity) to define the edge against the blurred background.

### Input Fields
- Semi-transparent background with a 1px border. On focus, the border glows with the primary emerald color, and the background blur increases.

### Navigation Sidebar
- Icons only or Icon+Label. The "Active" state is a floating pill that slides behind the icon, utilizing a primary gradient.

### Page Editor Blocks
- Drag-and-drop components should appear as distinct floating modules with large handle areas and `rounded-lg` corners.