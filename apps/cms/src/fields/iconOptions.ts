/**
 * Icon field factory — creates a Payload text field with the custom
 * IconPickerField admin component (searchable Iconify grid picker).
 *
 * Stores Iconify identifiers like 'mdi:star', 'lucide:heart'.
 * Legacy values ('star', 'badge') are still valid — the frontend
 * Icon.astro resolves them via LEGACY_ICON_MAP.
 *
 * Usage:
 *   import { iconField } from '../fields/iconOptions'
 *   fields: [ iconField({ name: 'iconName', required: true }) ]
 */
import type { Field } from 'payload'

interface IconFieldOptions {
  name?: string
  required?: boolean
  admin?: Record<string, any>
}

export function iconField(opts: IconFieldOptions = {}): Field {
  const { name = 'iconName', required = false, admin = {} } = opts
  return {
    name,
    type: 'text',
    required,
    admin: {
      ...admin,
      components: {
        Field: '/components/IconPickerField#default',
      },
    },
  }
}

/**
 * @deprecated — kept for reference during migration. Use iconField() instead.
 * Legacy 32-option select list. Values map to Icon.astro via LEGACY_ICON_MAP.
 */
export const iconOptions = [
  { label: '⭐ star',                value: 'star' },
  { label: '🏠 villa',               value: 'villa' },
  { label: '🏊 pool',                value: 'pool' },
  { label: '🍽️ restaurant',         value: 'restaurant' },
  { label: '🎧 support_agent',       value: 'support_agent' },
  { label: '✅ verified_user',       value: 'verified_user' },
  { label: '🎫 badge',               value: 'badge' },
  { label: '📍 location_on',         value: 'location_on' },
  { label: '📅 calendar_today',      value: 'calendar_today' },
  { label: '👥 group',               value: 'group' },
  { label: '⛵ sailing',             value: 'sailing' },
  { label: '🚤 directions_boat',     value: 'directions_boat' },
  { label: '🤿 scuba_diving',        value: 'scuba_diving' },
  { label: '🎉 celebration',         value: 'celebration' },
  { label: '🛕 temple_buddhist',     value: 'temple_buddhist' },
  { label: '💬 chat',                value: 'chat' },
  { label: '📞 phone',               value: 'phone' },
  { label: '✉️ mail',                value: 'mail' },
  { label: '🎧 headset_mic',         value: 'headset_mic' },
  { label: '⏰ schedule',            value: 'schedule' },
  { label: '😊 sentiment_satisfied', value: 'sentiment_satisfied' },
  { label: '💰 sell',                value: 'sell' },
  { label: '🏘️ real_estate_agent',  value: 'real_estate_agent' },
  { label: '📷 camera',              value: 'camera' },
  { label: '❤️ favorite',            value: 'favorite' },
  { label: '🔍 search',              value: 'search' },
  { label: '📤 send',                value: 'send' },
  { label: '🔗 share',               value: 'share' },
  { label: '▶️ play_arrow',          value: 'play_arrow' },
  { label: '🔽 filter_list',         value: 'filter_list' },
  { label: '↕ sort',                value: 'sort' },
  { label: '💚 whatsapp',            value: 'whatsapp' },
]
