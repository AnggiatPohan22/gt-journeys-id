import { generateWhatsAppLink } from '@lib/whatsapp'
import type { ResolveContext, ResolvedChannel } from './types'

/**
 * WhatsApp channel adapter — Phase 4.50.3.
 *
 * Field yang dibaca dari block whatsappChannel:
 *   whatsappNumber, prefilledMessage, appendUtm,
 *   + common: label, subtitle, agentName, agentAvatar, iconOverride, brandColorOverride
 *
 * Fallback: bila whatsappNumber kosong → context.fallbackWhatsappNumber
 * (dari SiteSettings.contact.whatsapp). Ini kompatibel dengan 18 konsumen
 * existing yang membaca contact.whatsapp langsung.
 */
export function resolveWhatsappChannel(
  block: any,
  ctx: ResolveContext,
  index: number,
): ResolvedChannel | null {
  if (block?.enabled === false) return null

  const number = (block?.whatsappNumber?.trim?.() as string) || ctx.fallbackWhatsappNumber || ''
  if (!number.replace(/\D/g, '')) return null

  const message =
    (block?.prefilledMessage?.trim?.() as string) ||
    ctx.fallbackWhatsappMessage ||
    'Halo! 👋 Saya mau tanya-tanya tentang layanan yang tersedia.'

  let href = generateWhatsAppLink(number, message)
  if (block?.appendUtm && ctx.utm) {
    const url = new URL(href)
    if (ctx.utm.source)   url.searchParams.set('utm_source',   ctx.utm.source)
    if (ctx.utm.medium)   url.searchParams.set('utm_medium',   ctx.utm.medium)
    if (ctx.utm.campaign) url.searchParams.set('utm_campaign', ctx.utm.campaign)
    href = url.toString()
  }

  const avatar = typeof block?.agentAvatar === 'object' ? block.agentAvatar?.url ?? null : null
  const iconName =
    block?.iconOverride && block.iconOverride !== 'default' ? block.iconOverride : 'whatsapp'
  const brandColor =
    (block?.brandColorOverride?.trim?.() as string) ||
    ctx.channelDefaultColors?.whatsappChannel ||
    '#25D366'

  return {
    key: `wa-${index}`,
    channelIndex: index,
    blockType: 'whatsappChannel',
    label: block?.label ?? 'WhatsApp',
    subtitle: block?.subtitle ?? 'Have a question? Chat with us',
    agentName: block?.agentName ?? undefined,
    agentAvatarUrl: avatar,
    iconName,
    brandColor,
    mode: 'link',
    href,
  }
}
