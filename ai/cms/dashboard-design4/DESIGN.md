---
name: Cybernetic Void
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
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
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-margin: 2rem
  gutter: 1.5rem
  sidebar-width: 280px
  card-padding: 1.5rem
  stack-gap: 1rem
---

## Brand & Style

This design system is built for high-performance CMS environments where data density meets futuristic aesthetics. The visual narrative is rooted in a **Futuristic Glassmorphism** style, blending deep, immersive dark surfaces with hyper-functional translucent layers.

The target audience is tech-forward administrators and developers who value a sophisticated, high-contrast workspace. The interface should feel like a premium command center—precise, glowing, and deeply layered. We utilize "frosted" glass effects and vibrant color bleeds to guide the eye through complex data structures, ensuring the dashboard feels light and responsive despite its dark canvas.

## Colors

The palette is anchored by a deep charcoal canvas (#0B0E14) that allows accent colors to vibrate. 
- **Primary & Secondary:** A neon purple-to-blue spectrum is used for interactive elements, active states, and data visualizations.
- **Success:** An emerald green (#10B981) is reserved strictly for positive growth and success indicators.
- **Neutral/Surface:** We rely on varying levels of transparency rather than flat greys. Surfaces are created by layering white with extreme low-opacity (3-7%) over the charcoal background to create a "smoke-glass" effect.

## Typography

This design system utilizes **Geist** for its clinical precision and high readability in dark modes. For technical data and status labels, **JetBrains Mono** is introduced to provide a "developer-first" feel.

Typography should always maintain high contrast. Primary information uses pure white (#FFFFFF), while secondary metadata uses a 60% opacity white to maintain hierarchy without cluttering the dark canvas.

## Layout & Spacing

The layout follows a **Fixed Sidebar / Fluid Content** model. 
- **Sidebar:** A persistent glassmorphic vertical bar on the left with a backdrop-blur of 20px.
- **Grid:** A 12-column grid is used for the main content area, though components primarily live within "Floating Action Cards."
- **Rhythm:** We use an 8px base unit. Margins and gutters are generous (24px+) to prevent the high-density data from feeling claustrophobic.
- **Adaptive Rules:** On tablets, the sidebar collapses to icons. On mobile, the layout shifts to a single-column stack with bottom-sheet navigation.

## Elevation & Depth

Hierarchy is achieved through **Backdrop Blur** and **Glow Shadows** rather than traditional drop shadows.
- **Level 1 (Canvas):** Pure #0B0E14.
- **Level 2 (Cards):** 3% white fill, 1px border at 8% opacity, 12px backdrop blur.
- **Level 3 (Popovers/Modals):** 6% white fill, 1px border at 15% opacity, 24px backdrop blur.
- **Interactive States:** Elements in focus or active states emit a soft outer glow (shadow) using the primary purple/blue gradient at 20% opacity.

## Shapes

The shape language is defined by large, friendly radii that contrast with the "hard" futuristic color palette. All main containers and cards use a **24px (rounded-xl)** corner radius. 

Small interactive elements like buttons and input fields utilize a "Pill" shape (rounded-full) to provide a tactile, organic feel within the structured grid. Borders must be thin (1px) and semi-transparent to maintain the glass illusion.

## Components

### Buttons
Primary buttons use the neon purple-to-blue gradient with white text. Secondary buttons are "Ghost Glass"—transparent with a subtle border and a blur effect that intensifies on hover.

### Floating Action Cards
The core container for the dashboard. Each card has a subtle top-down 1px border highlight to simulate a light source from above. 

### Input Fields
Inputs are dark-filled (slightly darker than the background) with a 1px border that glows with the primary gradient when focused. Labels use JetBrains Mono for a technical feel.

### Sidebar Nav
Active items in the sidebar use a vertical gradient "pill" behind the icon and text, with a slight drop shadow to lift the item off the sidebar surface.

### Chips & Tags
Used for status. Success chips use a low-opacity emerald green background with a solid green border and text. All chips feature a 100px border-radius.