import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Phase 4.71 — Checkout → CMS data sync fixes.
 *
 * TWO changes:
 *
 * (1) BACKFILL `scheduleTimeLabel` + `returnScheduleTimeLabel` di Bookings
 *     untuk row legacy yang pre-fix (SELALU null karena create.ts baca field
 *     ferry.scheduleTimeLabel yang tidak ada di FerryTickets). Compose dari
 *     ferry_tickets.departure_time + arrival_time pakai correlated subquery.
 *     ONLY update rows yang current value NULL + punya FK ferry.
 *
 * (2) WORDING MIGRATION `{{departureDate}}` → `{{departureDisplay}}` di
 *     booking_templates text/html fields. Pola conditional UPDATE Phase
 *     4.70.3.1: ONLY replace rows yang masih di old default (admin yang
 *     sudah customize = tidak kena). `{{departureDate}}` tetap valid (dan
 *     masih bisa dipakai admin yang mau raw ISO) — ini cuma swap default.
 *
 * Reversible — down() restore scheduleTimeLabel ke NULL untuk row yang
 * nilainya cocok dengan hasil compose (deterministic), dan revert wording.
 */

// ─── Payment Email Body (text) ──────────────────────────────────────
const OLD_PAYMENT_EMAIL_BODY =
  'Hi {{customerName}},\n\nTerima kasih sudah booking dengan GtJourneysID.\n\n*Booking Reference:* {{bookingRef}}\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDate}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n*Total:* {{currency}} {{totalEstimate}}\n\nSilakan transfer ke salah satu rekening berikut:\n{{bankAccountsBlock}}\n\nSetelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}.\n\nBatas waktu pembayaran: {{paymentDeadline}}.\n\nTerima kasih,\nGtJourneysID'
const NEW_PAYMENT_EMAIL_BODY =
  'Hi {{customerName}},\n\nTerima kasih sudah booking dengan GtJourneysID.\n\n*Booking Reference:* {{bookingRef}}\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDisplay}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n*Total:* {{currency}} {{totalEstimate}}\n\nSilakan transfer ke salah satu rekening berikut:\n{{bankAccountsBlock}}\n\nSetelah transfer, kirim bukti pembayaran ke {{adminWhatsapp}}.\n\nBatas waktu pembayaran: {{paymentDeadline}}.\n\nTerima kasih,\nGtJourneysID'

// ─── Payment WhatsApp Body ──────────────────────────────────────────
const OLD_PAYMENT_WA_BODY =
  'Halo {{customerName}}! 👋\n\nBooking kamu di GtJourneysID sudah kami review ✅\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDate}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n💰 Total: {{currency}} {{totalEstimate}}\n\nSilakan transfer ke:\n{{bankAccountsBlock}}\n\nKirim bukti transfer balas pesan ini ya. Batas waktu: {{paymentDeadline}}.'
const NEW_PAYMENT_WA_BODY =
  'Halo {{customerName}}! 👋\n\nBooking kamu di GtJourneysID sudah kami review ✅\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDisplay}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n💰 Total: {{currency}} {{totalEstimate}}\n\nSilakan transfer ke:\n{{bankAccountsBlock}}\n\nKirim bukti transfer balas pesan ini ya. Batas waktu: {{paymentDeadline}}.'

// ─── Ticket Email Body (text) — post Phase 4.70.3.1 wording ────────
const OLD_TICKET_EMAIL_BODY =
  'Hi {{customerName}},\n\nPembayaran kamu sudah kami terima — booking {{bookingRef}} CONFIRMED.\n\n{{receiptAttachedNote}}\n\n*Detail Perjalanan:*\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDate}}\n*Class:* {{ferryClassName}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n\n{{passengerList}}\n\nTiket resmi diterbitkan oleh operator ferry saat check-in di terminal. Mohon tiba 60 menit sebelum keberangkatan dengan passport fisik.\n\nTerima kasih,\nGtJourneysID'
const NEW_TICKET_EMAIL_BODY =
  'Hi {{customerName}},\n\nPembayaran kamu sudah kami terima — booking {{bookingRef}} CONFIRMED.\n\n{{receiptAttachedNote}}\n\n*Detail Perjalanan:*\n*Route:* {{originLocation}} → {{destinationLocation}}\n*Date:* {{departureDisplay}}\n*Class:* {{ferryClassName}}\n*Passengers:* {{adults}} adult(s) + {{children}} child(ren)\n\n{{passengerList}}\n\nTiket resmi diterbitkan oleh operator ferry saat check-in di terminal. Mohon tiba 60 menit sebelum keberangkatan dengan passport fisik.\n\nTerima kasih,\nGtJourneysID'

// ─── Ticket WhatsApp Body — post Phase 4.70.3.1 wording ────────────
const OLD_TICKET_WA_BODY =
  '✅ *Booking Confirmed!*\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDate}}\n🎫 Kelas: {{ferryClassName}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n\n{{receiptAttachedNote}}\n\nTiket resmi diterbitkan oleh operator saat check-in. Tiba di terminal 60 menit sebelum berangkat ya!'
const NEW_TICKET_WA_BODY =
  '✅ *Booking Confirmed!*\n\n🔖 Ref: {{bookingRef}}\n📍 Rute: {{originLocation}} → {{destinationLocation}}\n📅 Tanggal: {{departureDisplay}}\n🎫 Kelas: {{ferryClassName}}\n👥 Pax: {{adults}} dewasa + {{children}} anak\n\n{{receiptAttachedNote}}\n\nTiket resmi diterbitkan oleh operator saat check-in. Tiba di terminal 60 menit sebelum berangkat ya!'

// ─── HTML substring swap untuk Payment HTML dan Ticket HTML ─────────
// Default HTML di-compose dynamic (brand colors subst), tapi substring
// {{departureDate}} inside HTML selalu persis string tsb. Replace semua
// occurrence `>{{departureDate}}<` → `>{{departureDisplay}}<` di
// payment_email_body_html + ticket_email_body_html. Boundary pakai `>`
// dan `<` supaya tidak accidentally match string lain yang kebetulan punya
// substring itu (defense-in-depth).
const HTML_OLD = '>{{departureDate}}<'
const HTML_NEW = '>{{departureDisplay}}<'

// Label text "Departure Date" di ticket default juga diganti "Departure"
// supaya konsisten (payment default sudah "Departure"). Tidak critical;
// skip supaya migration tetap minimal — admin bisa manual edit kalau mau.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ─── (1) Backfill scheduleTimeLabel outbound ────────────────────
  await db.run(sql`
    UPDATE \`bookings\`
    SET \`schedule_time_label\` = (
      SELECT CASE
        WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
          AND ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
          THEN substr(trim(ft.departure_time) || ' → ' || trim(ft.arrival_time), 1, 100)
        WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
          THEN substr(trim(ft.departure_time), 1, 100)
        WHEN ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
          THEN substr(trim(ft.arrival_time), 1, 100)
        ELSE NULL
      END
      FROM \`ferry_tickets\` ft
      WHERE ft.id = \`bookings\`.\`ferry_ticket_id\`
    )
    WHERE (\`schedule_time_label\` IS NULL OR trim(\`schedule_time_label\`) = '')
      AND \`ferry_ticket_id\` IS NOT NULL;
  `)

  // ─── (2) Backfill returnScheduleTimeLabel ──────────────────────
  await db.run(sql`
    UPDATE \`bookings\`
    SET \`return_schedule_time_label\` = (
      SELECT CASE
        WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
          AND ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
          THEN substr(trim(ft.departure_time) || ' → ' || trim(ft.arrival_time), 1, 100)
        WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
          THEN substr(trim(ft.departure_time), 1, 100)
        WHEN ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
          THEN substr(trim(ft.arrival_time), 1, 100)
        ELSE NULL
      END
      FROM \`ferry_tickets\` ft
      WHERE ft.id = \`bookings\`.\`return_ferry_ticket_id\`
    )
    WHERE (\`return_schedule_time_label\` IS NULL OR trim(\`return_schedule_time_label\`) = '')
      AND \`return_ferry_ticket_id\` IS NOT NULL;
  `)

  // ─── (3) Wording migration — text/wa templates ─────────────────
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_email_body\` = ${NEW_PAYMENT_EMAIL_BODY}
    WHERE \`payment_email_body\` = ${OLD_PAYMENT_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_whatsapp_body\` = ${NEW_PAYMENT_WA_BODY}
    WHERE \`payment_whatsapp_body\` = ${OLD_PAYMENT_WA_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_email_body\` = ${NEW_TICKET_EMAIL_BODY}
    WHERE \`ticket_email_body\` = ${OLD_TICKET_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_whatsapp_body\` = ${NEW_TICKET_WA_BODY}
    WHERE \`ticket_whatsapp_body\` = ${OLD_TICKET_WA_BODY};
  `)

  // ─── (4) HTML substring swap untuk payment & ticket HTML ──────
  // Pakai REPLACE() — safe karena boundary `>{{...}}<` sangat spesifik.
  // Apply ke SEMUA row (bukan "only if default") karena HTML dynamic +
  // substring match itu sendiri sudah strong-enough guard.
  await db.run(sql`
    UPDATE \`booking_templates\`
    SET \`payment_email_body_html\` = REPLACE(\`payment_email_body_html\`, ${HTML_OLD}, ${HTML_NEW})
    WHERE \`payment_email_body_html\` LIKE '%' || ${HTML_OLD} || '%';
  `)
  await db.run(sql`
    UPDATE \`booking_templates\`
    SET \`ticket_email_body_html\` = REPLACE(\`ticket_email_body_html\`, ${HTML_OLD}, ${HTML_NEW})
    WHERE \`ticket_email_body_html\` LIKE '%' || ${HTML_OLD} || '%';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert wording migrations (template-text).
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_email_body\` = ${OLD_PAYMENT_EMAIL_BODY}
    WHERE \`payment_email_body\` = ${NEW_PAYMENT_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`payment_whatsapp_body\` = ${OLD_PAYMENT_WA_BODY}
    WHERE \`payment_whatsapp_body\` = ${NEW_PAYMENT_WA_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_email_body\` = ${OLD_TICKET_EMAIL_BODY}
    WHERE \`ticket_email_body\` = ${NEW_TICKET_EMAIL_BODY};
  `)
  await db.run(sql`
    UPDATE \`booking_templates\` SET \`ticket_whatsapp_body\` = ${OLD_TICKET_WA_BODY}
    WHERE \`ticket_whatsapp_body\` = ${NEW_TICKET_WA_BODY};
  `)

  // Revert HTML substring swap.
  await db.run(sql`
    UPDATE \`booking_templates\`
    SET \`payment_email_body_html\` = REPLACE(\`payment_email_body_html\`, ${HTML_NEW}, ${HTML_OLD})
    WHERE \`payment_email_body_html\` LIKE '%' || ${HTML_NEW} || '%';
  `)
  await db.run(sql`
    UPDATE \`booking_templates\`
    SET \`ticket_email_body_html\` = REPLACE(\`ticket_email_body_html\`, ${HTML_NEW}, ${HTML_OLD})
    WHERE \`ticket_email_body_html\` LIKE '%' || ${HTML_NEW} || '%';
  `)

  // Revert scheduleTimeLabel backfill: NULL kembali untuk row yang nilainya
  // = hasil compose. Deterministic — kalau admin manually edit setelah
  // migrate, nilainya tidak lagi match → tidak di-touch.
  await db.run(sql`
    UPDATE \`bookings\`
    SET \`schedule_time_label\` = NULL
    WHERE \`ferry_ticket_id\` IS NOT NULL
      AND \`schedule_time_label\` = (
        SELECT CASE
          WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
            AND ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
            THEN substr(trim(ft.departure_time) || ' → ' || trim(ft.arrival_time), 1, 100)
          WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
            THEN substr(trim(ft.departure_time), 1, 100)
          WHEN ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
            THEN substr(trim(ft.arrival_time), 1, 100)
          ELSE NULL
        END
        FROM \`ferry_tickets\` ft
        WHERE ft.id = \`bookings\`.\`ferry_ticket_id\`
      );
  `)
  await db.run(sql`
    UPDATE \`bookings\`
    SET \`return_schedule_time_label\` = NULL
    WHERE \`return_ferry_ticket_id\` IS NOT NULL
      AND \`return_schedule_time_label\` = (
        SELECT CASE
          WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
            AND ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
            THEN substr(trim(ft.departure_time) || ' → ' || trim(ft.arrival_time), 1, 100)
          WHEN ft.departure_time IS NOT NULL AND trim(ft.departure_time) <> ''
            THEN substr(trim(ft.departure_time), 1, 100)
          WHEN ft.arrival_time IS NOT NULL AND trim(ft.arrival_time) <> ''
            THEN substr(trim(ft.arrival_time), 1, 100)
          ELSE NULL
        END
        FROM \`ferry_tickets\` ft
        WHERE ft.id = \`bookings\`.\`return_ferry_ticket_id\`
      );
  `)
}
