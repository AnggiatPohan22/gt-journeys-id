/**
 * Phase 3.24 — set template default pada global Header/Footer existing.
 *
 * Field lama = slot template-1 (Classic / Multi-column). Record global yang sudah
 * ada belum punya nilai `template` (defaultValue hanya berlaku saat create), jadi
 * script ini mengisi 'header-1' / 'footer-1' supaya picker admin & renderer konsisten.
 *
 * Idempotent. Jalankan SETELAH schema push (kolom `template` sudah ada).
 * Matikan `pnpm dev` CMS dulu (lock SQLite).
 *
 * Jalankan:  pnpm tsx src/scripts/seed-header-footer-templates.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { defaultTemplateId } from '../../../../packages/shared/src/template-registry'

const log = (m: string) => process.stdout.write(m + '\n')

const run = async () => {
  const payload = await getPayload({ config })

  const header = (await payload.findGlobal({ slug: 'header-settings', depth: 0 })) as any
  if (!header?.template) {
    await payload.updateGlobal({ slug: 'header-settings', data: { template: defaultTemplateId('header') } as any })
    log(`✓ header-settings.template → ${defaultTemplateId('header')}`)
  } else log(`· header-settings.template sudah "${header.template}" — skip`)

  const footer = (await payload.findGlobal({ slug: 'footer-settings', depth: 0 })) as any
  if (!footer?.template) {
    await payload.updateGlobal({ slug: 'footer-settings', data: { template: defaultTemplateId('footer') } as any })
    log(`✓ footer-settings.template → ${defaultTemplateId('footer')}`)
  } else log(`· footer-settings.template sudah "${footer.template}" — skip`)

  log('Selesai.')
  process.exit(0)
}

run().catch((e) => { process.stderr.write(`${e?.stack || e}\n`); process.exit(1) })
