import type { CollectionConfig } from 'payload'
import { isSuperAdmin, authenticatedRead, superAdminFieldAccess } from '../access/roles'
import { sidebarTabsFieldWith, withSidebarTab } from '../fields/sidebarTabs'
import { updatedAtRelativeField } from '../fields/listCells'
import { updateLastLogin } from '../hooks/updateLastLogin'

/**
 * Users — CMS accounts (super-admin / admin / editor).
 *
 * Phase 4.14 additions:
 *   - Profile fields: avatar (upload), phone, address.
 *   - `enabled` soft-disable checkbox (super-admin gate on login is
 *     wired via a beforeLogin hook if we ever need it; for now the
 *     field is used as a UI signal + audit trail).
 *   - `lastLoginAt` written by the afterLogin hook.
 *   - Main content tabs: Profile / Security / Activity.
 *   - Sidebar tabs (General / Publishing) via Phase 4.9 helper.
 *   - Custom list cells: avatar + relative modified date.
 *
 * Auth: Payload auto-adds email + password + salt + hash + resetPassword*
 * + lockUntil + loginAttempts + sessions (via `auth: true`). We don't
 * touch those.
 * Passwords are one-way hashed and NEVER viewable.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  // Phase 4.62.1 — enable API keys agar server-side endpoint (newsletter,
  // bookings) bisa authenticate ke Payload REST via
  // `Authorization: users API-Key <key>`. Tanpa flag ini, DB tidak punya
  // kolom `api_key` / `enable_api_key` dan admin UI tak menampilkan toggle.
  auth: { useAPIKey: true },
  admin: {
    useAsTitle: 'name',
    group: 'Administration',
    hidden: ({ user }) => user?.role !== 'super-admin',
    defaultColumns: ['avatar', 'name', 'email', 'role', 'updatedAtRelative'],
    listSearchableFields: ['name', 'email'],
  },
  access: {
    read: authenticatedRead,
    create: isSuperAdmin,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return user.id === id
    },
    delete: isSuperAdmin,
  },
  hooks: {
    afterLogin: [updateLastLogin],
  },
  fields: [
    // ── Sidebar ─────────────────────────────────────
    // Phase 4.59 audit fix — Users only has `general` (role) + `status`
    // (enabled) sidebar groups, no SEO fields. The default `sidebarTabsField`
    // always renders all 3 tabs (General/SEO/Publishing), which left a dead
    // empty "SEO" tab in the sidebar. Use the explicit-list variant instead
    // (same pattern as ServiceTypes, phase-4.9).
    sidebarTabsFieldWith(['general', 'status']),
    withSidebarTab(
      {
        name: 'role',
        type: 'select',
        required: true,
        defaultValue: 'editor',
        options: [
          { label: 'Editor', value: 'editor' },
          { label: 'Admin', value: 'admin' },
          { label: 'Super Admin', value: 'super-admin' },
        ],
        access: {
          update: superAdminFieldAccess,
        },
        admin: {
          position: 'sidebar',
          description: 'Only super-admin can change roles.',
        },
      },
      'general',
    ),
    withSidebarTab(
      {
        name: 'enabled',
        type: 'checkbox',
        defaultValue: true,
        label: 'Account Enabled',
        access: {
          update: superAdminFieldAccess,
        },
        admin: {
          position: 'sidebar',
          description: 'Uncheck to soft-disable an account without deleting it. Currently used as an audit signal — active enforcement of login lockout should be wired via a beforeLogin hook when required.',
        },
      },
      'status',
    ),

    // ── Main content — Profile / Security / Activity tabs ──
    {
      type: 'tabs',
      admin: { className: 'dnj-main-tabs' }, // Phase 4.10 sticky pill tabs
      tabs: [
        {
          label: 'Profile',
          description: 'Public-facing info shown in the admin sidebar + user list.',
          fields: [
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Profile picture. Falls back to initials if empty.',
                components: {
                  Cell: '/admin/cells/UserAvatarCell#default',
                },
              },
            },
            { name: 'name', type: 'text', required: true },
            {
              name: 'phone',
              type: 'text',
              admin: {
                description: 'Contact number (WhatsApp-compatible). Format: +62 812 xxxx-xxxx.',
                placeholder: '+62 812 xxxx-xxxx',
              },
              validate: (value: unknown) => {
                if (value === undefined || value === null || value === '') return true
                return typeof value === 'string' && /^[+0-9 ()\-]{6,20}$/.test(value)
                  ? true
                  : 'Use digits, spaces, +, (), or - only (6–20 chars).'
              },
            },
            {
              name: 'address',
              type: 'textarea',
              maxLength: 500,
              admin: {
                description: 'Full address (optional). Max 500 characters.',
              },
            },
          ],
        },
        {
          label: 'Security',
          description: 'Password management + account unlock. Passwords are one-way hashed and never viewable — reset means WRITE a new value, not read the old one.',
          fields: [
            // Payload renders its own password + confirm inputs automatically
            // for auth collections. We add helpers around them.
            {
              name: 'passwordGenerator',
              type: 'ui',
              admin: {
                components: {
                  Field: '/admin/PasswordGeneratorButton#default',
                },
                condition: (_, __, { user }) => user?.role === 'super-admin',
              },
            },
            {
              name: 'forceUnlock',
              type: 'ui',
              admin: {
                components: {
                  Field: '/admin/ForceUnlockButton#default',
                },
                condition: (_, __, { user }) => user?.role === 'super-admin',
              },
            },
          ],
        },
        {
          label: 'Activity',
          description: 'Read-only audit info.',
          fields: [
            {
              name: 'lastLoginAt',
              type: 'date',
              label: 'Last login',
              admin: {
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'MMM d, yyyy — HH:mm',
                },
                description: 'Set automatically after each successful login.',
              },
              access: {
                update: () => false, // hook writes it via overrideAccess; blocks admin edits
              },
            },
          ],
        },
      ],
    },

    // ── Sidebar (list-view helpers) ──
    updatedAtRelativeField,
  ],
}
