import type { ResolvedChannel } from './types'

/**
 * AI Chatbot channel adapter — Phase 4.50.6.
 *
 * Sudah unlocked di phase ini. Widget akan handle click → buka panel mode
 * dan fetch ke POST /api/chat/send dengan channelIndex.
 *
 * Fallback bila `provider` belum di-set di CMS → tetap render (endpoint
 * akan reject dengan `misconfigured` — visitor lihat error message).
 */
export function resolveAiChatbotChannel(
  block: any,
  index: number,
): ResolvedChannel | null {
  if (block?.enabled === false) return null

  const avatar = typeof block?.agentAvatar === 'object' ? block.agentAvatar?.url ?? null : null
  const iconName =
    block?.iconOverride && block.iconOverride !== 'default'
      ? (block.iconOverride === 'sparkle' ? 'sparkles' : block.iconOverride)
      : 'sparkles'
  const brandColor =
    (block?.brandColorOverride?.trim?.() as string) || '#7C3AED'

  return {
    key: `ai-${index}`,
    channelIndex: index,
    blockType: 'aiChatbotChannel',
    label: block?.label ?? 'Ask AI',
    subtitle: block?.subtitle ?? 'Instant answer, 24/7',
    agentName: block?.agentName ?? undefined,
    agentAvatarUrl: avatar,
    iconName,
    brandColor,
    mode: 'panel',
    welcomeMessage: block?.welcomeMessage ?? undefined,
  }
}
