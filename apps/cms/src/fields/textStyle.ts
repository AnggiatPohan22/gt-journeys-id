/**
 * Text element type — dipakai di `advancedStyleFields`/`advancedStyleFieldsNoButton`
 * (fields/advancedStyle.ts) untuk generate per-element color + animation controls
 * di collapsible Text Styles.
 *
 * Phase 4.55 — `buildTextStyleField(...)` helper LAMA dihapus (Text Styles
 * sekarang di-inline di advancedStyleFields dgn compact color picker). Konsumen
 * lama sudah di-migrate ke `advancedStyleFields[NoButton]({ textElements: [...] })`.
 */

export type TextElement =
  | 'heading' | 'subheading' | 'paragraph' | 'description'
  | 'caption' | 'eyebrow' | 'quote' | 'label'
