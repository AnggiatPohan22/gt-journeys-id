/**
 * Legacy icon name → Iconify identifier mapping.
 *
 * The CMS historically stored icon names like 'star', 'badge', 'sell' (Material
 * Symbols naming). This map resolves those legacy values to their Iconify
 * equivalents so existing data keeps rendering after the migration to Iconify.
 *
 * New content stores Iconify identifiers directly (e.g. 'mdi:star').
 */

export const LEGACY_ICON_MAP: Record<string, string> = {
  // ── Stroke-style icons ──
  chat: 'lucide:message-circle',
  expand_more: 'lucide:chevron-down',
  menu: 'lucide:menu',
  close: 'lucide:x',
  arrow_forward: 'lucide:arrow-right',
  swap_horiz: 'lucide:arrow-left-right',
  flight_land: 'lucide:plane-landing',
  access_time: 'lucide:clock',
  map: 'lucide:map',
  search: 'lucide:search',
  location_on: 'mdi:map-marker',
  calendar_today: 'lucide:calendar',
  group: 'lucide:users',
  filter_list: 'lucide:filter',
  sort: 'lucide:arrow-up-down',
  swap_vert: 'lucide:arrow-up-down',
  check: 'lucide:check',
  bolt: 'lucide:zap',
  nightlight: 'lucide:moon',
  favorite: 'lucide:heart',
  chevron_right: 'lucide:chevron-right',
  chevron_left: 'lucide:chevron-left',

  // ── Fill-style icons ──
  star: 'mdi:star',
  chat_fill: 'mdi:chat',
  phone: 'mdi:phone',
  mail: 'mdi:email',
  schedule: 'mdi:clock-outline',
  badge: 'mdi:badge-account',
  sell: 'mdi:tag',
  support_agent: 'mdi:face-agent',
  verified_user: 'mdi:shield-check',
  sailing: 'mdi:sail-boat',
  temple_buddhist: 'mdi:temple-buddhist',
  villa: 'mdi:home-city',
  scuba_diving: 'mdi:diving',
  directions_boat: 'mdi:ferry',
  restaurant: 'mdi:silverware-fork-knife',
  celebration: 'mdi:party-popper',
  real_estate_agent: 'mdi:home-account',
  sentiment_satisfied: 'mdi:emoticon-happy-outline',
  headset_mic: 'mdi:headset',
  play_arrow: 'mdi:play',
  camera: 'mdi:camera',
  share: 'mdi:share-variant',
  pool: 'mdi:pool',
  send: 'mdi:send',
  whatsapp: 'mdi:whatsapp',

  // ── modules.ts Lucide-style names (fallback, not currently rendered) ──
  compass: 'lucide:compass',
  'bed-double': 'lucide:bed-double',
  waves: 'lucide:waves',
  ship: 'lucide:ship',
  utensils: 'lucide:utensils',
  heart: 'lucide:heart',
  car: 'lucide:car',
  sparkles: 'lucide:sparkles',
}

/**
 * Resolve an icon identifier to Iconify format.
 * - Already in `prefix:name` format → returned as-is
 * - Legacy name (e.g. 'star') → mapped via LEGACY_ICON_MAP
 * - Unknown → returns null
 */
export function resolveIconId(name: string | null | undefined): string | null {
  if (!name) return null
  if (name.includes(':')) return name
  return LEGACY_ICON_MAP[name] ?? null
}
