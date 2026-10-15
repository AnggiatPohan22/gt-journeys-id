/**
 * Checkout channel registry — Phase 4.62.
 *
 * Adding a gateway later = drop a `xendit.ts` / `midtrans.ts` in this folder
 * implementing `CheckoutChannel`, register it below, and set the env var.
 * No changes to the checkout form, booking schema, or confirmation page.
 */

import type { CheckoutChannel } from '../types'
import { ManualWhatsAppChannel } from './manualWhatsApp'
import { getSiteSettings } from '@lib/payload'
import { siteConfig } from '@config/site'
import { getServiceWhatsApp } from '@lib/serviceTypes'

export type ServiceKind = 'ferry-ticket'

/**
 * Read the channel slug for a service from env. Defaults to `manual_wa`.
 * Extensible per service (Tour/Hotel/Rental will get their own env keys
 * when they migrate to this checkout flow).
 */
function slugForService(service: ServiceKind): string {
  switch (service) {
    case 'ferry-ticket':
      return import.meta.env.PUBLIC_FERRY_CHECKOUT_CHANNEL || 'manual_wa'
    default:
      return 'manual_wa'
  }
}

async function resolveWaNumber(service: ServiceKind): Promise<string> {
  let waNumber = siteConfig.contact.whatsapp
  try {
    const settings = await getSiteSettings()
    waNumber = settings?.contact?.whatsapp ?? waNumber
  } catch {
    /* fall back to siteConfig */
  }
  const svc = await getServiceWhatsApp(
    service === 'ferry-ticket' ? 'ferry-tickets' : service,
    waNumber,
  ).catch(() => ({ number: waNumber, template: undefined }))
  return svc.number
}

/**
 * Manual-WA handoff regardless of active channel — used by the confirmation
 * page to keep a manual WhatsApp button visible even when a payment gateway
 * is active. When the active channel already IS manual_wa the caller
 * collapses this to avoid duplicate buttons.
 */
export async function getManualWaHandoff(
  booking: import('@shared/types/payload-types').Booking,
) {
  const wa = new ManualWhatsAppChannel(await resolveWaNumber('ferry-ticket'))
  return wa.handle(booking)
}

export async function resolveChannel(service: ServiceKind): Promise<CheckoutChannel> {
  const slug = slugForService(service)
  switch (slug) {
    case 'manual_wa':
      return new ManualWhatsAppChannel(await resolveWaNumber(service))
    // case 'xendit':   return new XenditChannel(...)   // Phase 4.63+
    // case 'midtrans': return new MidtransChannel(...) // Phase 4.63+
    default:
      // Unknown channel → safe fallback to manual WA so the customer is
      // never stuck without a way to reach the admin.
      return new ManualWhatsAppChannel(await resolveWaNumber(service))
  }
}
