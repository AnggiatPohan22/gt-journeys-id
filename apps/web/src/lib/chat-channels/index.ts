import type { ResolveContext, ResolvedChannel } from './types'
import { resolveWhatsappChannel } from './whatsapp'
import { resolveAiChatbotChannel } from './ai_chatbot'
import { resolveLiveChatChannel } from './live_chat'
import { resolveEmailChannel } from './email'

/**
 * Dispatch resolver — memilih adapter per blockType. Tambah channel baru
 * = tambah 1 branch + 1 adapter file (types.ts.ChannelBlockType juga di-update).
 */
export function resolveChannel(
  block: any,
  ctx: ResolveContext,
  index: number,
): ResolvedChannel | null {
  const type = block?.blockType
  switch (type) {
    case 'whatsappChannel':  return resolveWhatsappChannel(block, ctx, index)
    case 'aiChatbotChannel': return resolveAiChatbotChannel(block, index, ctx)
    case 'liveChatChannel':  return resolveLiveChatChannel(block, index, ctx)
    case 'emailChannel':     return resolveEmailChannel(block, index, ctx)
    default:                 return null
  }
}

export function resolveChannels(blocks: any[], ctx: ResolveContext): ResolvedChannel[] {
  if (!Array.isArray(blocks)) return []
  return blocks
    .map((b, i) => resolveChannel(b, ctx, i))
    .filter((c): c is ResolvedChannel => c !== null)
}

export type { ResolvedChannel, ResolveContext } from './types'
