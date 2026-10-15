---
name: Emerald Voyage
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bec9c2'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#89938d'
  outline-variant: '#3f4944'
  surface-tint: '#8bd6b6'
  primary: '#8bd6b6'
  on-primary: '#003828'
  primary-container: '#065f46'
  on-primary-container: '#8bd6b7'
  inverse-primary: '#1b6b51'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#97d3b9'
  on-tertiary: '#003828'
  tertiary-container: '#225d48'
  on-tertiary-container: '#98d4ba'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a6f2d1'
  primary-fixed-dim: '#8bd6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#b3efd4'
  tertiary-fixed-dim: '#97d3b9'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#12503c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  mint-glow: '#8bd6b7'
  glass-stroke: rgba(255, 255, 255, 0.15)
  glass-fill: rgba(15, 23, 42, 0.6)
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
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
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
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 32px
  gutter: 24px
  card-padding: 40px
  section-gap: 48px
  floating-offset: 16px
  mobile-margin: 16px
---

## Brand & Style

This design system is engineered for a high-end, cinematic user experience that merges the precision of modern SaaS with the evocative atmosphere of luxury travel. The brand personality is **Sophisticated, Immersive, and Visionary**, designed to make the act of "logging in" feel like the beginning of an exclusive journey.

The aesthetic follows an **Organic Glassmorphism** style. It leverages high-translucency layers, heavy backdrop blurs, and luminous emerald accents to create a sense of depth and prestige. The interface should never feel "flat"; it should feel like a series of physical glass panes floating over a dynamic, living environment. Whitespace is used not just for clarity, but to frame the cinematic background, ensuring the UI feels light and unburdened despite its technical capabilities.

## Colors

The palette is anchored by a rich **Emerald Green** (#065f46), used strategically for primary actions and brand identifiers. To achieve the cinematic effect, the system defaults to a **Dark Mode** orientation, utilizing a deep Navy/Charcoal (#0F172A) for base neutral tones.

- **Primary Emerald:** Used for buttons, active states, and focus rings.
- **Glass Surfaces:** Containers use a semi-transparent neutral fill with a high blur factor to maintain legibility over dynamic video backgrounds.
- **Luminous Accents:** Secondary mint tones are used for success states and "live" indicators, often paired with subtle outer glows to simulate light emission.
- **Gradients:** Actionable elements may use a linear gradient (135deg) from Primary (#065F46) to Secondary (#10B981) to add dimension.

## Typography

This design system utilizes **Geist** exclusively to project a technical, modern, and premium image. 

The typographic hierarchy is designed for high-impact readability against complex backgrounds. Large display and headline sizes use tight tracking to feel "editorial" and authoritative. Utility text and labels (label-sm) feature increased letter spacing (tracking) to ensure clarity when rendered over semi-transparent glass surfaces. All text should maintain high contrast—typically pure white or a very light mint-grey—to ensure accessibility standards are met in glassmorphic layouts.

## Layout & Spacing

The layout employs a **Floating Box** model. Elements do not touch the edges of the viewport; instead, the UI is treated as a series of floating islands within a safe margin.

- **Grid:** A 12-column fluid grid is utilized for content alignment, though core modules like the login card are centered with substantial surrounding "air."
- **Rhythm:** Spacing follows a 4px/8px baseline, but utilizes larger `card-padding` (40px) to enhance the feeling of luxury and openness.
- **Responsiveness:** On mobile devices, margins collapse to 16px. The login card should stretch to fill the width (minus margins) but maintain its floating vertical position. Sidebars and navigation should transition into floating bottom sheets or full-screen overlays with high-blur backdrops.

## Elevation & Depth

Hierarchy is established through **Refractive Layering** and **Tonal Depth** rather than traditional black shadows.

1.  **Level 0 (Background):** A high-definition dynamic video background with a dark overlay to ensure text contrast.
2.  **Level 1 (Main Card):** A high-translucency glass layer. Requirements include a 1px solid border (15% white) and a `backdrop-filter: blur(24px)`.
3.  **Level 2 (Active Elements):** Focused inputs and hovered buttons utilize a `0 20px 40px rgba(16, 185, 129, 0.15)` emerald glow.
4.  **Level 3 (Modals/Popovers):** Deeper blurs (40px+) and slightly higher opacity backgrounds to completely isolate the user's focus.

## Shapes

The shape language is **Fluid and Geometric**. The design system favors "Extra-Rounded" corners to soften the technical nature of the Geist typeface and the glass aesthetic.

- **Containers/Cards:** Use `rounded-xl` (1.5rem / 24px) to create a soft, inviting frame for content.
- **Buttons & Inputs:** Use a fully **Pill-shaped** (rounded-full) geometry. This reinforces the organic, luxury travel theme.
- **Media:** Photography and video within the UI should use `rounded-lg` (1rem / 16px) to maintain consistency with the container language.

## Components

### Buttons
Primary buttons feature a linear gradient from Emerald (#065F46) to Mint (#10B981). They are pill-shaped, use `label-md` for text, and exhibit a subtle outer glow on hover. Secondary buttons are "ghost" style with a 1px emerald border and a 5% translucent emerald fill.

### Input Fields
Inputs are semi-transparent with a 1px `glass-stroke`. The background blur within the field increases on focus, and the border transitions to the primary emerald color with a soft glow effect. Text should be pure white for maximum legibility.

### Login Card
The center-piece component. It must feature high-translucency (60-70% opacity) to allow the movement of the background video to be perceived, while the 24px backdrop-blur ensures that the text remains perfectly sharp.

### Chips & Tags
Pill-shaped with a glass-fill and emerald text. Used for status indicators or travel categories. They should feel like small gemstones floating on the interface.

### Feedback & Alerts
Use the Secondary Mint color for success and a muted brand-red for errors. Alerts should be floating glass banners at the top of the container, maintaining the `rounded-xl` corner radius.