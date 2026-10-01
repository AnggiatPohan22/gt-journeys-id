export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

/**
 * Render WA template dari ServiceType (CMS) — ganti placeholder {{var}}.
 * Didukung: {{serviceName}}, {{userName}}, {{date}}, {{destination}}, {{price}}.
 * Variabel yang tidak ada / kosong → jadi placeholder bracket "[var]" supaya
 * visitor mengisinya sendiri di chat (mis. "[date]" → "[date]").
 */
export function renderWhatsAppTemplate(
  template: string,
  vars: Record<string, string | undefined | null>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key]
    return v && String(v).trim() ? String(v) : `[${key}]`
  })
}

export function tourBookingMessage(title: string, destination: string, price?: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya tertarik dengan tour:\n🏷️ *${title}*\n📍 ${destination}${price ? `\n💰 ${price}` : ''}\n\nBisa info lebih lanjut?`
}

export function accommodationMessage(name: string, destination: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya ingin booking:\n🏨 *${name}*\n📍 ${destination}\n\nTanggal check-in: [isi tanggal]\nJumlah tamu: [isi jumlah]\n\nMohon info ketersediaan dan harga.`
}

export function generalMessage(serviceName: string, serviceType: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya tertarik dengan ${serviceType}:\n🏷️ *${serviceName}*\n\nBisa info lebih lanjut?`
}

export function waterActivityMessage(title: string, destination: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya tertarik ikut water activity:\n🌊 *${title}*\n📍 ${destination}\n\nTanggal: [isi tanggal]\nJumlah peserta: [isi jumlah]\n\nBisa info harga & ketersediaan?`
}

export function yachtMessage(name: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya tertarik charter yacht:\n⛵ *${name}*\n\nTanggal: [isi tanggal]\nJumlah tamu: [isi jumlah]\nRute yang diinginkan: [opsional]\n\nBisa info paket & harga?`
}

export function restaurantMessage(name: string, destination: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya ingin reservasi meja di:\n🍽️ *${name}*\n📍 ${destination}\n\nTanggal: [isi tanggal]\nJam: [isi jam]\nJumlah tamu: [isi jumlah]\n\nMohon konfirmasi ketersediaan.`
}

export function venueMessage(name: string, eventType?: string): string {
  const evt = eventType ? `\nJenis acara: ${eventType}` : ''
  return `Halo GtJourneysID! 👋\n\nSaya tertarik menggunakan venue:\n💐 *${name}*${evt}\n\nTanggal acara: [isi tanggal]\nJumlah tamu: [isi jumlah]\n\nBisa info paket & ketersediaan?`
}

export function rentalMessage(title: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya ingin sewa:\n🛵 *${title}*\n\nTanggal mulai: [isi tanggal]\nDurasi: [harian/mingguan/dst]\nLokasi antar: [isi lokasi]\n\nBisa info harga & ketersediaan?`
}

export function spaMessage(title: string): string {
  return `Halo GtJourneysID! 👋\n\nSaya ingin booking treatment:\n💆 *${title}*\n\nTanggal: [isi tanggal]\nJam: [isi jam]\nJumlah orang: [isi jumlah]\n\nBisa info harga & ketersediaan?`
}

export function ferryTicketMessage(title: string, route?: string): string {
  const r = route ? `\nRute: ${route}` : ''
  return `Halo GtJourneysID! 👋\n\nSaya ingin booking tiket ferry:\n⛴️ *${title}*${r}\n\nTanggal keberangkatan: [isi tanggal]\nJumlah penumpang: [dewasa / anak]\n\nBisa info jadwal & ketersediaan?`
}