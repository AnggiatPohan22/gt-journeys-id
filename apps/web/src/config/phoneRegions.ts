/**
 * Phone region codes — Phase 4.63.
 *
 * Hardcoded shortlist for the checkout form region dropdown. Ordered:
 * SE Asia + APAC (paling relevan buat travel-BI) di atas → sisanya alfabetis.
 * Kalau nanti perlu jauh lebih banyak negara, migrate ke CMS global.
 */

export interface PhoneRegion {
  code: string  // e.g. "+62"
  iso: string   // ISO-3166 alpha-2, e.g. "ID"
  name: string
  flag: string  // emoji flag
}

export const PHONE_REGIONS: PhoneRegion[] = [
  // Primary markets
  { code: '+62',  iso: 'ID', name: 'Indonesia',      flag: '🇮🇩' },
  { code: '+65',  iso: 'SG', name: 'Singapore',      flag: '🇸🇬' },
  { code: '+60',  iso: 'MY', name: 'Malaysia',       flag: '🇲🇾' },
  { code: '+66',  iso: 'TH', name: 'Thailand',       flag: '🇹🇭' },
  { code: '+84',  iso: 'VN', name: 'Vietnam',        flag: '🇻🇳' },
  { code: '+63',  iso: 'PH', name: 'Philippines',    flag: '🇵🇭' },
  { code: '+855', iso: 'KH', name: 'Cambodia',       flag: '🇰🇭' },
  { code: '+673', iso: 'BN', name: 'Brunei',         flag: '🇧🇳' },
  // APAC
  { code: '+61',  iso: 'AU', name: 'Australia',      flag: '🇦🇺' },
  { code: '+64',  iso: 'NZ', name: 'New Zealand',    flag: '🇳🇿' },
  { code: '+81',  iso: 'JP', name: 'Japan',          flag: '🇯🇵' },
  { code: '+82',  iso: 'KR', name: 'South Korea',    flag: '🇰🇷' },
  { code: '+852', iso: 'HK', name: 'Hong Kong',      flag: '🇭🇰' },
  { code: '+853', iso: 'MO', name: 'Macau',          flag: '🇲🇴' },
  { code: '+886', iso: 'TW', name: 'Taiwan',         flag: '🇹🇼' },
  { code: '+86',  iso: 'CN', name: 'China',          flag: '🇨🇳' },
  { code: '+91',  iso: 'IN', name: 'India',          flag: '🇮🇳' },
  // Middle East
  { code: '+971', iso: 'AE', name: 'UAE',            flag: '🇦🇪' },
  { code: '+966', iso: 'SA', name: 'Saudi Arabia',   flag: '🇸🇦' },
  { code: '+974', iso: 'QA', name: 'Qatar',          flag: '🇶🇦' },
  { code: '+973', iso: 'BH', name: 'Bahrain',        flag: '🇧🇭' },
  { code: '+965', iso: 'KW', name: 'Kuwait',         flag: '🇰🇼' },
  { code: '+968', iso: 'OM', name: 'Oman',           flag: '🇴🇲' },
  { code: '+972', iso: 'IL', name: 'Israel',         flag: '🇮🇱' },
  // Europe
  { code: '+44',  iso: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+33',  iso: 'FR', name: 'France',         flag: '🇫🇷' },
  { code: '+49',  iso: 'DE', name: 'Germany',        flag: '🇩🇪' },
  { code: '+39',  iso: 'IT', name: 'Italy',          flag: '🇮🇹' },
  { code: '+34',  iso: 'ES', name: 'Spain',          flag: '🇪🇸' },
  { code: '+31',  iso: 'NL', name: 'Netherlands',    flag: '🇳🇱' },
  { code: '+32',  iso: 'BE', name: 'Belgium',        flag: '🇧🇪' },
  { code: '+41',  iso: 'CH', name: 'Switzerland',    flag: '🇨🇭' },
  { code: '+43',  iso: 'AT', name: 'Austria',        flag: '🇦🇹' },
  { code: '+45',  iso: 'DK', name: 'Denmark',        flag: '🇩🇰' },
  { code: '+46',  iso: 'SE', name: 'Sweden',         flag: '🇸🇪' },
  { code: '+47',  iso: 'NO', name: 'Norway',         flag: '🇳🇴' },
  { code: '+358', iso: 'FI', name: 'Finland',        flag: '🇫🇮' },
  { code: '+353', iso: 'IE', name: 'Ireland',        flag: '🇮🇪' },
  { code: '+351', iso: 'PT', name: 'Portugal',       flag: '🇵🇹' },
  { code: '+30',  iso: 'GR', name: 'Greece',         flag: '🇬🇷' },
  { code: '+48',  iso: 'PL', name: 'Poland',         flag: '🇵🇱' },
  { code: '+420', iso: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+7',   iso: 'RU', name: 'Russia',         flag: '🇷🇺' },
  // Americas
  { code: '+1',   iso: 'US', name: 'United States',  flag: '🇺🇸' },
  { code: '+1',   iso: 'CA', name: 'Canada',         flag: '🇨🇦' },
  { code: '+52',  iso: 'MX', name: 'Mexico',         flag: '🇲🇽' },
  { code: '+55',  iso: 'BR', name: 'Brazil',         flag: '🇧🇷' },
  { code: '+54',  iso: 'AR', name: 'Argentina',      flag: '🇦🇷' },
  // Africa
  { code: '+27',  iso: 'ZA', name: 'South Africa',   flag: '🇿🇦' },
  { code: '+20',  iso: 'EG', name: 'Egypt',          flag: '🇪🇬' },
]

export const DEFAULT_PHONE_REGION = '+62' // Indonesia
