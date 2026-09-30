import type { GlobalConfig } from 'payload'
import { isSuperAdmin } from '../access/roles'
import { colorPickerField } from '../fields/colorPicker'

/**
 * Popup Settings — Phase 4.59.1.
 *
 * Default configuration for the reusable popup component
 * (`apps/web/src/components/common/Popup.astro`). This global defines the
 * frame (default title, button labels, colors, icon, radius) used by every
 * popup trigger on the frontend. Body messages are supplied per-call by the
 * trigger (e.g. ferry-ticket booking confirmation).
 *
 * Read: public. Update: super-admin only.
 *
 * A single `ui` field at the top mounts `DescriptionsToTooltips` (Phase
 * 4.61.6), which hides every `.field-description` and injects a "?" icon
 * next to each label — hover / click reveals the description as a tooltip.
 * Same pattern as the Ferry Tickets edit view.
 */
export const PopupSettings: GlobalConfig = {
  slug: 'popup-settings',
  label: 'Popup',
  admin: {
    group: 'Settings',
    description:
      'Default popup frame (title, icon, buttons, colors) used by every popup trigger on the frontend. Body copy is passed per-context by the trigger.',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  fields: [
    // Mounts the DOM helper that turns every description into a "?" tooltip
    // next to the field label. Renders no UI of its own.
    {
      name: 'descriptionsToTooltips',
      type: 'ui',
      label: false as unknown as string,
      admin: {
        components: {
          Field: '/admin/DescriptionsToTooltips#default',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        // ── Tab 1: Content ─────────────────────────────────────────
        {
          label: 'Content',
          description: 'Default copy. Body text is supplied per-context by each trigger.',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Master switch. When OFF, triggers fall back to the browser\'s native window.confirm().',
              },
            },
            {
              name: 'defaultTitle',
              type: 'text',
              defaultValue: 'Confirm',
              maxLength: 80,
              admin: { description: 'Default title used when a trigger does not send its own title.' },
            },
            {
              name: 'confirmLabel',
              type: 'text',
              defaultValue: 'Continue',
              maxLength: 40,
              admin: { description: 'Primary button label (positive action).' },
            },
            {
              name: 'cancelLabel',
              type: 'text',
              defaultValue: 'Cancel',
              maxLength: 40,
              admin: { description: 'Secondary button label (cancel action).' },
            },
            {
              name: 'showCloseButton',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Show the × close button in the top-right corner of the popup card.' },
            },
          ],
        },

        // ── Tab 2: Icon & Layout ───────────────────────────────────
        {
          label: 'Icon & Layout',
          description: 'Header icon plus card shape and backdrop.',
          fields: [
            {
              name: 'showIcon',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Show the header icon at the top of the popup card.' },
            },
            {
              name: 'iconName',
              type: 'select',
              defaultValue: 'help',
              options: [
                { label: '❓ Help / Confirm', value: 'help' },
                { label: 'ℹ️  Info', value: 'info' },
                { label: '⚠️  Warning', value: 'warning' },
                { label: '✅ Success / Check', value: 'check_circle' },
                { label: '🎟️  Ticket / Booking', value: 'confirmation_number' },
                { label: '🛒 Cart / Checkout', value: 'shopping_cart' },
                { label: '📅 Calendar', value: 'event' },
                { label: '👥 Passenger / Group', value: 'group' },
              ],
              admin: {
                condition: (_, siblingData) => siblingData?.showIcon !== false,
                description: 'Header icon. Matches the frontend icon system so it stays consistent with the rest of the site.',
              },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'md',
              options: [
                { label: 'Small (max-w 24rem)', value: 'sm' },
                { label: 'Medium (max-w 28rem) — default', value: 'md' },
                { label: 'Large (max-w 32rem)', value: 'lg' },
              ],
              admin: { description: 'Maximum width of the popup card.' },
            },
            {
              name: 'radius',
              type: 'select',
              defaultValue: '2xl',
              options: [
                { label: 'Rounded (rounded-lg)', value: 'lg' },
                { label: 'Rounded XL (rounded-xl)', value: 'xl' },
                { label: 'Rounded 2XL (rounded-2xl) — default', value: '2xl' },
                { label: 'Rounded 3XL (rounded-3xl)', value: '3xl' },
              ],
              admin: { description: 'Corner radius of the popup card.' },
            },
            {
              name: 'backdrop',
              type: 'select',
              defaultValue: 'blur',
              options: [
                { label: 'Solid (bg-black/50)', value: 'solid' },
                { label: 'Blur (backdrop-blur + bg-black/40) — default', value: 'blur' },
                { label: 'Transparent (bg-black/20)', value: 'transparent' },
              ],
              admin: { description: 'How the dimmed area behind the popup is rendered.' },
            },
          ],
        },

        // ── Tab 3: Colors ──────────────────────────────────────────
        {
          label: 'Colors',
          description:
            'Popup colors. Empty = brand defaults (ocean / coral / sand). 8-digit hex supported for alpha.',
          fields: [
            {
              type: 'row',
              fields: [
                colorPickerField('bgColor', 'Card Background', 'Popup card background color.', '#FFFFFF', { width: '50%' }),
                colorPickerField('titleColor', 'Title', 'Popup title color.', '#1B3A4B', { width: '50%' }),
              ],
            },
            {
              type: 'row',
              fields: [
                colorPickerField('textColor', 'Body Text', 'Body message color.', '#3D405B', { width: '50%' }),
                colorPickerField('iconColor', 'Icon', 'Header icon color (icon background auto-tints from this).', '#E07A5F', { width: '50%' }),
              ],
            },
            {
              type: 'row',
              fields: [
                colorPickerField('confirmBg', 'Confirm Button BG', 'Primary button background.', '#E07A5F', { width: '50%' }),
                colorPickerField('confirmText', 'Confirm Button Text', 'Primary button text color.', '#FFFFFF', { width: '50%' }),
              ],
            },
            {
              type: 'row',
              fields: [
                colorPickerField('cancelBg', 'Cancel Button BG', 'Cancel button background.', '#F5F0E8', { width: '50%' }),
                colorPickerField('cancelText', 'Cancel Button Text', 'Cancel button text color.', '#3D405B', { width: '50%' }),
              ],
            },
          ],
        },
      ],
    },
  ],
}
