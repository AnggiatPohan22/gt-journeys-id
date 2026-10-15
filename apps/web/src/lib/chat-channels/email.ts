import type { ResolvedChannel, ResolveContext } from './types'

/**
 * Email channel adapter — Phase 4.50.3.
 *
 * Field yang dibaca dari block emailChannel:
 *   toAddress (required), defaultSubject, defaultBody
 *   + common fields
 *
 * Note: browser mailto: launcher tidak melewati backend, jadi security
 * layer (rate limit, verification, dedup) TIDAK diterapkan di sini. Kalau
 * nanti user pindah ke form-based email (POST /api/chat/email), adapter
 * ini akan berganti mode dari 'link' → 'panel'.
 */
export function resolveEmailChannel(
  block: any,
  index: number,
  ctx?: ResolveContext,
): ResolvedChannel | null {
  if (block?.enabled === false) return null
  const to = (block?.toAddress?.trim?.() as string) || ''
  if (!to) return null

  const params = new URLSearchParams()
  if (block?.defaultSubject) params.set('subject', block.defaultSubject)
  if (block?.defaultBody)    params.set('body',    block.defaultBody)
  const query = params.toString()
  const href = `mailto:${to}${query ? `?${query}` : ''}`

  const avatar = typeof block?.agentAvatar === 'object' ? block.agentAvatar?.url ?? null : null
  const iconName =
    block?.iconOverride && block.iconOverride !== 'default' ? block.iconOverride : 'mail'
  const brandColor =
    (block?.brandColorOverride?.trim?.() as string) ||
    ctx?.channelDefaultColors?.emailChannel ||
    '#0F766E'

  return {
    key: `email-${index}`,
    channelIndex: index,
    blockType: 'emailChannel',
    label: block?.label ?? 'Email',
    subtitle: block?.subtitle ?? 'Drop us a message',
    agentName: block?.agentName ?? undefined,
    agentAvatarUrl: avatar,
    iconName,
    brandColor,
    mode: 'link',
    href,
  }
}
