import type { ResolvedChannel } from './types'

/**
 * Live Chat channel adapter — STUB (Phase 4.50.3).
 *
 * Field yang akan dibaca (Phase 4.50.5+): provider (crisp/tawk/intercom),
 * siteId. Provider script akan di-inject via <script> di BaseLayout,
 * lalu klik kartu invoke `window.$crisp.push(['do', 'chat:open'])` dsb.
 *
 * Sekarang: kartu tampil tapi disabled dengan reason.
 */
export function resolveLiveChatChannel(
  block: any,
  index: number,
): ResolvedChannel | null {
  if (block?.enabled === false) return null

  const avatar = typeof block?.agentAvatar === 'object' ? block.agentAvatar?.url ?? null : null
  const iconName =
    block?.iconOverride && block.iconOverride !== 'default' ? block.iconOverride : 'chat'
  const brandColor =
    (block?.brandColorOverride?.trim?.() as string) || '#2563EB'

  return {
    key: `lc-${index}`,
    channelIndex: index,
    blockType: 'liveChatChannel',
    label: block?.label ?? 'Live Chat',
    subtitle: block?.subtitle ?? 'Talk to our team',
    agentName: block?.agentName ?? undefined,
    agentAvatarUrl: avatar,
    iconName,
    brandColor,
    mode: 'script',
    disabled: true,
    disabledReason: 'Live chat provider belum di-wire (Phase 4.50.5+).',
  }
}
