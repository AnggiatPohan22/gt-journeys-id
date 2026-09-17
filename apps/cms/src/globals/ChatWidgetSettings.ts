import type { GlobalConfig, Field } from 'payload'
import { isSuperAdmin } from '../access/roles'

/**
 * ChatWidgetSettings — Phase 4.50.1
 *
 * Channel-agnostic floating chat widget. Menggantikan WhatsApp-only
 * `whatsappDefaults` di SiteSettings. Struktur channel pakai Payload
 * `blocks` field supaya menambah channel baru (AI chatbot, live chat,
 * email, telegram, dst.) = tambah block schema baru — tanpa menyentuh
 * channel yang sudah eksis.
 *
 * Master toggle tetap di SiteFeatures.whatsappFloat (di-rename ke
 * `chatWidget` di phase terpisah). Widget hanya render bila
 * SiteFeatures.chatWidget && ChatWidgetSettings.enabled.
 *
 * Fallback: bila channel WA `whatsappNumber` kosong, komponen jatuh
 * kembali ke SiteSettings.contact.whatsapp.
 */

const commonChannelFields: Field[] = [
  {
    name: 'enabled',
    type: 'checkbox',
    defaultValue: true,
    admin: { description: 'Uncheck untuk sembunyikan channel ini tanpa hapus data.' },
  },
  {
    name: 'label',
    type: 'text',
    required: true,
    admin: { description: 'Judul kartu di popup (mis. "Sales", "Support", "Ask AI").' },
  },
  {
    name: 'subtitle',
    type: 'text',
    admin: { description: 'Baris kecil di bawah label (mis. "Reply in ~5 min").' },
  },
  {
    name: 'agentName',
    type: 'text',
    admin: { description: 'Opsional. Nama agent/tim yang ditampilkan di kartu channel.' },
  },
  {
    name: 'agentAvatar',
    type: 'upload',
    relationTo: 'media',
    admin: { description: 'Opsional. Avatar agent/tim. Kotak/lingkaran, min 96×96.' },
  },
  {
    name: 'iconOverride',
    type: 'select',
    defaultValue: 'default',
    options: [
      { label: 'Channel default', value: 'default' },
      { label: 'WhatsApp', value: 'whatsapp' },
      { label: 'Chat bubble', value: 'chat' },
      { label: 'Sparkle (AI)', value: 'sparkle' },
      { label: 'Envelope', value: 'mail' },
    ],
    admin: { description: 'Override ikon kartu (default = mengikuti tipe channel).' },
  },
  {
    name: 'brandColorOverride',
    type: 'text',
    admin: {
      description: 'HEX opsional (mis. #25D366). Kosong = pakai brandColor global widget.',
    },
  },
]

export const ChatWidgetSettings: GlobalConfig = {
  slug: 'chat-widget',
  label: 'Chat Widget',
  admin: {
    group: 'Settings',
    description:
      'Floating chat widget kanan-bawah. Channel-agnostic: bisa berisi WhatsApp, AI chatbot, live chat, email. Master toggle di Pengaturan Fitur → WhatsApp Floating Button.',
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ══ Tab 1: General ═══════════════════════════════════════════
        {
          label: 'General',
          description: 'Master enable, halaman mana yang menampilkan widget.',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Master toggle untuk chat widget. Selain ini, feature flag global (Pengaturan Fitur → WhatsApp Floating Button) tetap dihormati.',
              },
            },
            {
              name: 'displayScope',
              type: 'select',
              defaultValue: 'all',
              options: [
                { label: 'Semua halaman', value: 'all' },
                { label: 'Home saja', value: 'home' },
                { label: 'Custom (pilih halaman)', value: 'custom' },
              ],
              admin: { description: 'Tentukan di halaman mana widget tampil.' },
            },
            {
              name: 'includePages',
              type: 'relationship',
              relationTo: 'pages',
              hasMany: true,
              admin: {
                description: 'Halaman spesifik yang menampilkan widget.',
                condition: (_, s) => s?.displayScope === 'custom',
              },
            },
            {
              name: 'excludePages',
              type: 'relationship',
              relationTo: 'pages',
              hasMany: true,
              admin: {
                description:
                  'Halaman yang di-blacklist. Berlaku juga saat displayScope = "Semua halaman".',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hideOnMobile',
                  type: 'checkbox',
                  admin: { width: '50%', description: 'Sembunyikan di viewport < 768px.' },
                },
                {
                  name: 'hideOnDesktop',
                  type: 'checkbox',
                  admin: { width: '50%', description: 'Sembunyikan di viewport ≥ 768px.' },
                },
              ],
            },
          ],
        },

        // ══ Tab 2: Appearance ════════════════════════════════════════
        {
          label: 'Appearance',
          description: 'Posisi, warna, ukuran, animasi tombol floating.',
          fields: [
            {
              name: 'position',
              type: 'select',
              defaultValue: 'bottomRight',
              options: [
                { label: 'Bottom right', value: 'bottomRight' },
                { label: 'Bottom left', value: 'bottomLeft' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'offsetX',
                  type: 'number',
                  defaultValue: 24,
                  admin: { width: '50%', description: 'px dari edge horizontal.' },
                },
                {
                  name: 'offsetY',
                  type: 'number',
                  defaultValue: 24,
                  admin: { width: '50%', description: 'px dari edge vertikal.' },
                },
              ],
            },
            {
              name: 'buttonStyle',
              type: 'select',
              defaultValue: 'iconOnly',
              options: [
                { label: 'Icon only (round)', value: 'iconOnly' },
                { label: 'Icon + label (pill)', value: 'pill' },
              ],
            },
            {
              name: 'buttonLabel',
              type: 'text',
              defaultValue: 'Chat',
              admin: {
                description: 'Teks di sebelah ikon (untuk style pill).',
                condition: (_, d) => d?.buttonStyle === 'pill',
              },
            },
            {
              name: 'brandColor',
              type: 'text',
              defaultValue: '#25D366',
              admin: {
                description:
                  'HEX. Default WA green. Warna per-channel bisa override lewat brandColorOverride.',
              },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'md',
              options: [
                { label: 'SM (48px)', value: 'sm' },
                { label: 'MD (56px)', value: 'md' },
                { label: 'LG (64px)', value: 'lg' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'pulseAnimation',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { width: '50%', description: 'Efek denyut halus untuk narik perhatian.' },
                },
                {
                  name: 'entranceAnimation',
                  type: 'select',
                  defaultValue: 'fadeUp',
                  admin: { width: '50%' },
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'Fade up', value: 'fadeUp' },
                    { label: 'Pop in', value: 'pop' },
                  ],
                },
              ],
            },
          ],
        },

        // ══ Tab 3: Popup Panel ═══════════════════════════════════════
        {
          label: 'Popup',
          description: 'Header, judul, avatar tim di panel yang muncul saat button diklik.',
          fields: [
            {
              name: 'popupTitle',
              type: 'text',
              defaultValue: 'Start a Conversation',
            },
            {
              name: 'popupSubtitle',
              type: 'textarea',
              defaultValue: 'The team typically replies in a few minutes.',
            },
            {
              name: 'brandName',
              type: 'text',
              admin: { description: 'Nama tim (opsional). Ditampilkan di header popup.' },
            },
            {
              name: 'headerAvatar',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Logo/avatar di header popup (opsional).' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showOnlineBadge',
                  type: 'checkbox',
                  admin: {
                    width: '50%',
                    description:
                      'Tampilkan indikator dot hijau "Online now" (berdasarkan business hours).',
                  },
                },
                {
                  name: 'showTypingIndicator',
                  type: 'checkbox',
                  admin: {
                    width: '50%',
                    description: 'Animasi titik-titik "sedang mengetik" di header popup.',
                  },
                },
              ],
            },
          ],
        },

        // ══ Tab 4: Channels (blocks-based) ═══════════════════════════
        {
          label: 'Channels',
          description:
            'Setiap channel = satu kartu di popup. Drag untuk atur urutan. Tambah "AI Chatbot" atau "Live Chat" untuk multi-channel.',
          fields: [
            {
              name: 'channels',
              type: 'blocks',
              minRows: 1,
              labels: { singular: 'Channel', plural: 'Channels' },
              admin: {
                description: 'Minimal 1 channel. WhatsApp adalah default untuk site ini.',
              },
              blocks: [
                {
                  slug: 'whatsappChannel',
                  labels: { singular: 'WhatsApp', plural: 'WhatsApp' },
                  fields: [
                    ...commonChannelFields,
                    {
                      name: 'whatsappNumber',
                      type: 'text',
                      admin: {
                        description:
                          'Digits + country code, tanpa "+" (mis. 6281234567890). Kosong = fallback ke SiteSettings.contact.whatsapp.',
                      },
                    },
                    {
                      name: 'prefilledMessage',
                      type: 'textarea',
                      admin: {
                        rows: 4,
                        description:
                          'Pesan pre-fill saat visitor klik. Kosong = fallback ke SiteSettings.whatsappDefaults.greetingMessage (legacy).',
                      },
                    },
                    {
                      name: 'appendUtm',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description:
                          'Append UTM params ke wa.me link untuk tracking di analytics.',
                      },
                    },
                  ],
                },
                {
                  slug: 'aiChatbotChannel',
                  labels: { singular: 'AI Chatbot', plural: 'AI Chatbots' },
                  fields: [
                    ...commonChannelFields,
                    {
                      name: 'provider',
                      type: 'select',
                      defaultValue: 'anthropic',
                      options: [
                        { label: 'Anthropic (Claude)', value: 'anthropic' },
                        { label: 'OpenAI', value: 'openai' },
                        { label: 'Cloudflare Workers AI', value: 'workers-ai' },
                        { label: 'Custom endpoint', value: 'custom' },
                      ],
                    },
                    {
                      name: 'model',
                      type: 'text',
                      admin: {
                        description:
                          'Model ID. mis. claude-haiku-4-5, gpt-4o-mini, @cf/meta/llama-3.1-8b.',
                      },
                    },
                    {
                      name: 'endpointUrl',
                      type: 'text',
                      admin: {
                        description: 'HTTPS endpoint untuk provider custom.',
                        condition: (_, s) => s?.provider === 'custom',
                      },
                    },
                    {
                      name: 'systemPrompt',
                      type: 'textarea',
                      admin: {
                        rows: 8,
                        description:
                          'System prompt untuk chatbot. Jelaskan brand, tone, batasan, dan escalation ke WA.',
                      },
                    },
                    {
                      name: 'welcomeMessage',
                      type: 'text',
                      admin: { description: 'Balasan pertama chatbot saat panel dibuka.' },
                    },
                    {
                      name: 'streaming',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { description: 'Streaming token-by-token (SSE).' },
                    },
                    {
                      name: 'apiKeyRef',
                      type: 'text',
                      admin: {
                        description:
                          'NAMA env variable (mis. ANTHROPIC_API_KEY). JANGAN paste raw API key di sini.',
                      },
                    },
                  ],
                },
                {
                  slug: 'liveChatChannel',
                  labels: { singular: 'Live Chat', plural: 'Live Chats' },
                  fields: [
                    ...commonChannelFields,
                    {
                      name: 'provider',
                      type: 'select',
                      defaultValue: 'crisp',
                      options: [
                        { label: 'Crisp', value: 'crisp' },
                        { label: 'Tawk.to', value: 'tawk' },
                        { label: 'Intercom', value: 'intercom' },
                      ],
                    },
                    {
                      name: 'siteId',
                      type: 'text',
                      admin: { description: 'Site/widget ID dari dashboard provider.' },
                    },
                  ],
                },
                {
                  slug: 'emailChannel',
                  labels: { singular: 'Email', plural: 'Emails' },
                  fields: [
                    ...commonChannelFields,
                    {
                      name: 'toAddress',
                      type: 'text',
                      required: true,
                      admin: { description: 'Alamat email tujuan.' },
                    },
                    {
                      name: 'defaultSubject',
                      type: 'text',
                    },
                    {
                      name: 'defaultBody',
                      type: 'textarea',
                      admin: { rows: 4 },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ══ Tab 5: Availability / Business Hours ═════════════════════
        {
          label: 'Availability',
          description:
            'Jam operasional. Menentukan indikator "Online now" dan behavior saat off-hours.',
          fields: [
            {
              name: 'enableBusinessHours',
              type: 'checkbox',
              admin: { description: 'Aktifkan business hours untuk logic online/offline.' },
            },
            {
              name: 'timezone',
              type: 'text',
              defaultValue: 'Asia/Makassar',
              admin: {
                description: 'IANA timezone (mis. Asia/Makassar, Asia/Jakarta, Asia/Denpasar).',
                condition: (_, d) => !!d?.enableBusinessHours,
              },
            },
            {
              name: 'hours',
              type: 'array',
              labels: { singular: 'Day', plural: 'Days' },
              admin: {
                description: 'Satu row per hari. Format 24-jam (HH:mm).',
                condition: (_, d) => !!d?.enableBusinessHours,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'day',
                      type: 'select',
                      required: true,
                      admin: { width: '30%' },
                      options: [
                        { label: 'Mon', value: 'mon' },
                        { label: 'Tue', value: 'tue' },
                        { label: 'Wed', value: 'wed' },
                        { label: 'Thu', value: 'thu' },
                        { label: 'Fri', value: 'fri' },
                        { label: 'Sat', value: 'sat' },
                        { label: 'Sun', value: 'sun' },
                      ],
                    },
                    {
                      name: 'closed',
                      type: 'checkbox',
                      admin: { width: '15%' },
                    },
                    {
                      name: 'open',
                      type: 'text',
                      admin: {
                        width: '27%',
                        description: 'HH:mm',
                        condition: (_, s) => !s?.closed,
                      },
                    },
                    {
                      name: 'close',
                      type: 'text',
                      admin: {
                        width: '28%',
                        description: 'HH:mm',
                        condition: (_, s) => !s?.closed,
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'offlineBehavior',
              type: 'select',
              defaultValue: 'showAnyway',
              options: [
                { label: 'Tetap tampilkan button', value: 'showAnyway' },
                { label: 'Tampilkan dengan notice offline', value: 'showOfflineNotice' },
                { label: 'Sembunyikan button saat off-hours', value: 'hideButton' },
              ],
              admin: { condition: (_, d) => !!d?.enableBusinessHours },
            },
            {
              name: 'offlineMessage',
              type: 'textarea',
              admin: {
                description:
                  'Pesan yang ditampilkan di popup saat di luar jam operasional.',
                condition: (_, d) =>
                  !!d?.enableBusinessHours && d?.offlineBehavior === 'showOfflineNotice',
              },
            },
          ],
        },

        // ══ Tab 6: Behavior ══════════════════════════════════════════
        {
          label: 'Behavior',
          description: 'Delay, scroll trigger, exit-intent, dismissible.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'showDelaySeconds',
                  type: 'number',
                  defaultValue: 0,
                  admin: { width: '50%', description: 'Detik sebelum tombol tampil (0 = segera).' },
                },
                {
                  name: 'showAfterScrollPct',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    width: '50%',
                    description: '0-100. 0 = tampil segera. 30 = setelah scroll 30% page.',
                  },
                },
              ],
            },
            {
              name: 'autoOpenOnceAfter',
              type: 'number',
              admin: {
                description:
                  'Detik sebelum panel auto-open (sekali per session). Kosong = disabled.',
              },
            },
            {
              name: 'exitIntentDesktop',
              type: 'checkbox',
              admin: {
                description:
                  'Auto-open panel saat mouse keluar viewport (desktop only, sekali per session).',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'dismissible',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    width: '50%',
                    description: 'Beri visitor tombol close permanen.',
                  },
                },
                {
                  name: 'dismissMemoryHours',
                  type: 'number',
                  defaultValue: 24,
                  admin: {
                    width: '50%',
                    description: 'Jam sebelum widget muncul lagi setelah dismiss.',
                    condition: (_, d) => !!d?.dismissible,
                  },
                },
              ],
            },
            {
              name: 'mobileFullscreenSheet',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Di mobile, popup jadi bottom-sheet fullscreen (bukan floating card).',
              },
            },
          ],
        },

        // ══ Tab 7: Tracking & Compliance ═════════════════════════════
        {
          label: 'Tracking',
          description: 'Analytics event, UTM tagging, cookie consent gate.',
          fields: [
            {
              name: 'gaEventName',
              type: 'text',
              defaultValue: 'chat_widget_click',
              admin: { description: 'GA4 event name saat channel diklik.' },
            },
            {
              name: 'cloudflareTracking',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Kirim event ke Cloudflare Web Analytics bila tersedia.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'utmSource',
                  type: 'text',
                  defaultValue: 'chat_widget',
                  admin: { width: '33%' },
                },
                {
                  name: 'utmMedium',
                  type: 'text',
                  defaultValue: 'floating',
                  admin: { width: '33%' },
                },
                {
                  name: 'utmCampaign',
                  type: 'text',
                  admin: { width: '34%' },
                },
              ],
            },
            {
              name: 'requireConsent',
              type: 'checkbox',
              admin: {
                description:
                  'Render widget hanya setelah cookie consent diterima (kalau ada consent gate).',
              },
            },
          ],
        },

        // ══ Tab 8: Security & Anti-Spam (multi-layer) ═════════════════
        // Design notes:
        // - `enabledLayers` = multi-select → tambah layer baru zero-migration.
        // - Rate-limit rules = array of {limit, window, keyBy} → multi-window
        //   (5/min AND 100/hour) tanpa kolom baru.
        // - Provider verifikasi = select → tambah provider tinggal 1 option
        //   (never remove old options, cukup deprecate).
        // - `securityVersion` = int → hook di backend bisa branch by version
        //   saat naik minor upgrade tanpa migrate data.
        {
          label: 'Security',
          description:
            'Anti-spam multi-layer. Rate-limit, human-verification (Turnstile/reCAPTCHA), backend validation, bot signals, IP controls. Relevan terutama untuk channel AI chatbot & Email (backend-hit); channel WhatsApp/LiveChat client-side redirect jadi hanya sebagian layer applicable.',
          fields: [
            {
              name: 'securityVersion',
              type: 'number',
              defaultValue: 1,
              admin: {
                readOnly: true,
                description:
                  'Version tag untuk config security. Naik saat schema/logic security di-upgrade — backend branch logic berdasarkan version, TIDAK butuh migrasi data.',
              },
            },
            {
              name: 'enabledLayers',
              type: 'select',
              hasMany: true,
              defaultValue: ['rateLimit', 'backendValidation'],
              options: [
                { label: 'Layer 1 — Rate limit (IP/visitor)', value: 'rateLimit' },
                { label: 'Layer 2 — Human verification (Turnstile/reCAPTCHA)', value: 'humanVerification' },
                { label: 'Layer 3 — Backend validation (length/duplicate/cooldown)', value: 'backendValidation' },
                { label: 'Layer 4 — Bot signals (honeypot/timing/UA)', value: 'botSignals' },
                { label: 'Layer 5 — IP / country controls', value: 'ipControls' },
              ],
              admin: {
                description:
                  'Aktifkan layer secara independen. Layer baru di rilis mendatang cukup ditambah sebagai option — config lama tetap valid.',
              },
            },

            // ── Layer 1: Rate Limit ─────────────────────────────────
            {
              type: 'collapsible',
              label: 'Layer 1 — Rate Limit',
              admin: {
                initCollapsed: false,
                description:
                  'Sliding-window per IP dan/atau per visitor cookie. Multi-window supported (mis. 5/min AND 100/hour). Store: KV/DO (abstracted via RateLimitStore interface, bukan tabel Payload) → swappable ke Redis/D1 tanpa ganti schema.',
              },
              fields: [
                {
                  name: 'rateLimitRules',
                  type: 'array',
                  labels: { singular: 'Rate Limit Rule', plural: 'Rate Limit Rules' },
                  admin: { description: 'Kombinasi rule di-AND (semua harus lolos).' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'limitCount',
                          type: 'number',
                          required: true,
                          defaultValue: 5,
                          admin: { width: '30%', description: 'Jumlah request maks.' },
                        },
                        {
                          name: 'windowSeconds',
                          type: 'number',
                          required: true,
                          defaultValue: 60,
                          admin: { width: '30%', description: 'Window dalam detik.' },
                        },
                        {
                          name: 'keyBy',
                          type: 'select',
                          required: true,
                          defaultValue: 'ip',
                          admin: { width: '25%' },
                          options: [
                            { label: 'IP hash', value: 'ip' },
                            { label: 'Visitor cookie', value: 'visitor' },
                            { label: 'IP + visitor', value: 'both' },
                          ],
                        },
                        {
                          name: 'scope',
                          type: 'select',
                          defaultValue: 'global',
                          admin: { width: '15%', description: 'global = semua channel, atau per channel.' },
                          options: [
                            { label: 'Global', value: 'global' },
                            { label: 'Per channel', value: 'perChannel' },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'action',
                      type: 'select',
                      defaultValue: 'block',
                      options: [
                        { label: 'Block (429)', value: 'block' },
                        { label: 'Challenge (force verification)', value: 'challenge' },
                        { label: 'Log only', value: 'log' },
                      ],
                    },
                  ],
                },
                {
                  name: 'blockDurationSeconds',
                  type: 'number',
                  defaultValue: 300,
                  admin: {
                    description:
                      'Setelah rule triggered dengan action=block, durasi cooldown sebelum visitor bisa lagi.',
                  },
                },
              ],
            },

            // ── Layer 2: Human Verification (silent) ────────────────
            {
              type: 'collapsible',
              label: 'Layer 2 — Human Verification',
              admin: {
                initCollapsed: false,
                description:
                  'Silent verification (invisible ke user normal). Trigger saat rate-limit challenge atau saat message pertama. Secret key TIDAK disimpan di DB — pakai apiKeyRef (env var).',
              },
              fields: [
                {
                  name: 'verificationProvider',
                  type: 'select',
                  defaultValue: 'none',
                  options: [
                    { label: 'None', value: 'none' },
                    { label: 'Cloudflare Turnstile (recommended)', value: 'turnstile' },
                    { label: 'Google reCAPTCHA v3', value: 'recaptcha_v3' },
                    // Future: hcaptcha, arkose. Never remove old options.
                  ],
                },
                {
                  name: 'verificationSiteKey',
                  type: 'text',
                  admin: {
                    description:
                      'PUBLIC site key (aman disimpan). Turnstile: dari dashboard.cloudflare.com. reCAPTCHA: dari google.com/recaptcha.',
                    condition: (_, d) => d?.verificationProvider && d.verificationProvider !== 'none',
                  },
                },
                {
                  name: 'verificationSecretKeyRef',
                  type: 'text',
                  admin: {
                    description:
                      'NAMA env variable secret key (mis. TURNSTILE_SECRET_KEY). JANGAN paste raw secret.',
                    condition: (_, d) => d?.verificationProvider && d.verificationProvider !== 'none',
                  },
                },
                {
                  name: 'verificationMinScore',
                  type: 'number',
                  defaultValue: 0.5,
                  admin: {
                    description: 'reCAPTCHA v3 only. Range 0.0-1.0. Score < min → blocked.',
                    condition: (_, d) => d?.verificationProvider === 'recaptcha_v3',
                  },
                },
                {
                  name: 'verificationMode',
                  type: 'select',
                  defaultValue: 'silent',
                  options: [
                    { label: 'Silent (invisible, verify on send)', value: 'silent' },
                    { label: 'On suspicion only (after rate-limit challenge)', value: 'onSuspicion' },
                    { label: 'Always visible (managed challenge)', value: 'alwaysVisible' },
                  ],
                },
                {
                  name: 'verificationChannels',
                  type: 'select',
                  hasMany: true,
                  defaultValue: ['aiChatbotChannel', 'emailChannel'],
                  options: [
                    { label: 'WhatsApp', value: 'whatsappChannel' },
                    { label: 'AI Chatbot', value: 'aiChatbotChannel' },
                    { label: 'Live Chat', value: 'liveChatChannel' },
                    { label: 'Email', value: 'emailChannel' },
                  ],
                  admin: {
                    description:
                      'Channel mana yang butuh verifikasi. Default: hanya AI & Email (backend-hit).',
                  },
                },
              ],
            },

            // ── Layer 3: Backend Validation ─────────────────────────
            {
              type: 'collapsible',
              label: 'Layer 3 — Backend Validation',
              admin: {
                initCollapsed: false,
                description:
                  'Constraint di server. Frontend juga menghormati (disable button + maxlength) tapi server tetap authoritative.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'sendCooldownMs',
                      type: 'number',
                      defaultValue: 1500,
                      admin: { width: '50%', description: 'Tombol send disabled selama ini setelah klik (ms).' },
                    },
                    {
                      name: 'clientMinIntervalMs',
                      type: 'number',
                      defaultValue: 800,
                      admin: {
                        width: '50%',
                        description:
                          'Interval min antar send di same session (ms). Server reject bila kurang.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'minMessageLength',
                      type: 'number',
                      defaultValue: 2,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'maxMessageLength',
                      type: 'number',
                      defaultValue: 1000,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'blockDuplicateConsecutive',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Reject pesan identik dengan pesan sebelumnya di session yang sama.',
                  },
                },
                {
                  name: 'blockDuplicateWindowMinutes',
                  type: 'number',
                  defaultValue: 5,
                  admin: {
                    description:
                      'Window untuk dedup by content-hash (bukan hanya consecutive). 0 = disabled.',
                    condition: (_, d) => !!d?.blockDuplicateConsecutive,
                  },
                },
                {
                  name: 'blockedKeywords',
                  type: 'array',
                  labels: { singular: 'Keyword', plural: 'Keywords' },
                  admin: {
                    description:
                      'Case-insensitive substring match. Message yang mengandung keyword ini akan di-reject.',
                  },
                  fields: [{ name: 'value', type: 'text', required: true }],
                },
                {
                  name: 'blockedPatterns',
                  type: 'array',
                  labels: { singular: 'Regex Pattern', plural: 'Regex Patterns' },
                  admin: { description: 'JavaScript regex (tanpa slash). Diuji di backend.' },
                  fields: [
                    { name: 'pattern', type: 'text', required: true },
                    { name: 'flags', type: 'text', defaultValue: 'i' },
                    { name: 'note', type: 'text' },
                  ],
                },
              ],
            },

            // ── Layer 4: Bot Signals ─────────────────────────────────
            {
              type: 'collapsible',
              label: 'Layer 4 — Bot Signals',
              admin: {
                initCollapsed: true,
                description:
                  'Deteksi bot pasif. Signal disimpan di chat-blocked-events.context (JSON) → tambah signal baru zero-migration.',
              },
              fields: [
                {
                  name: 'enableHoneypot',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Field hidden yang harus tetap kosong. Bot naive akan mengisinya → auto-block.',
                  },
                },
                {
                  name: 'enableTimingCheck',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Tolak submit yang datang < minFormFillMs setelah panel dibuka (bot instant-fill).',
                  },
                },
                {
                  name: 'minFormFillMs',
                  type: 'number',
                  defaultValue: 1500,
                  admin: { condition: (_, d) => !!d?.enableTimingCheck },
                },
                {
                  name: 'enableUserAgentCheck',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { description: 'Block UA yang cocok blocklist bawaan (curl, headless, dsb).' },
                },
                {
                  name: 'customBlockedUserAgents',
                  type: 'array',
                  labels: { singular: 'UA Pattern', plural: 'UA Patterns' },
                  fields: [{ name: 'pattern', type: 'text', required: true }],
                  admin: { description: 'Regex tambahan untuk UA blocking.' },
                },
              ],
            },

            // ── Layer 5: IP / Country Controls ──────────────────────
            {
              type: 'collapsible',
              label: 'Layer 5 — IP & Country Controls',
              admin: {
                initCollapsed: true,
                description:
                  'Blocklist eksplisit. Country pakai header CF-IPCountry (butuh Cloudflare Workers).',
              },
              fields: [
                {
                  name: 'blockedIps',
                  type: 'array',
                  labels: { singular: 'IP / CIDR', plural: 'IPs / CIDRs' },
                  fields: [
                    { name: 'value', type: 'text', required: true, admin: { description: 'Single IP atau CIDR (mis. 1.2.3.0/24).' } },
                    { name: 'note', type: 'text' },
                  ],
                },
                {
                  name: 'countryMode',
                  type: 'select',
                  defaultValue: 'off',
                  options: [
                    { label: 'Off', value: 'off' },
                    { label: 'Allowlist (hanya country ini)', value: 'allowlist' },
                    { label: 'Blocklist (semua kecuali country ini)', value: 'blocklist' },
                  ],
                },
                {
                  name: 'countryCodes',
                  type: 'array',
                  labels: { singular: 'Country Code', plural: 'Country Codes' },
                  fields: [{ name: 'code', type: 'text', required: true, admin: { description: 'ISO-3166-1 alpha-2 (mis. ID, US, SG).' } }],
                  admin: { condition: (_, d) => d?.countryMode && d.countryMode !== 'off' },
                },
              ],
            },

            // ── Visitor / Privacy ────────────────────────────────────
            {
              type: 'collapsible',
              label: 'Visitor & Privacy',
              admin: {
                initCollapsed: true,
                description:
                  'Cookie visitor untuk tracking session lintas message. IP disimpan sebagai HMAC hash (GDPR-friendly), bukan raw.',
              },
              fields: [
                {
                  name: 'visitorCookieName',
                  type: 'text',
                  defaultValue: '__cwvid',
                  admin: { description: 'Nama cookie visitor ID. HttpOnly + SameSite=Lax + Secure.' },
                },
                {
                  name: 'visitorCookieTtlDays',
                  type: 'number',
                  defaultValue: 90,
                },
                {
                  name: 'ipHashSaltRef',
                  type: 'text',
                  defaultValue: 'CHAT_IP_HASH_SALT',
                  admin: {
                    description:
                      'NAMA env variable untuk HMAC salt. IP disimpan sebagai HMAC-SHA256(salt, ip). Rotasi salt akan me-invalidate riwayat.',
                  },
                },
                {
                  name: 'auditRetentionDays',
                  type: 'number',
                  defaultValue: 30,
                  admin: {
                    description:
                      'chat-messages & chat-blocked-events di-purge setelah N hari. 0 = disabled (retain forever).',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
