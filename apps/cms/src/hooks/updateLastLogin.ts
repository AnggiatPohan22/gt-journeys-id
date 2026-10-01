import type { CollectionAfterLoginHook } from 'payload'

/**
 * GtJourneysID — Users afterLogin hook (Phase 4.14 · Track A).
 *
 * Writes `lastLoginAt` (ISO timestamp) onto the user doc every time
 * they successfully log in. Powers the "Last login: 2h ago" line in
 * the redesigned user edit view (Activity tab).
 *
 * Runs AFTER Payload validates the credentials, so failed logins do
 * NOT touch the field. Fire-and-forget: if the write fails (e.g. DB
 * hiccup), we swallow the error so the login flow itself never breaks.
 */
export const updateLastLogin: CollectionAfterLoginHook = async ({
  req,
  user,
}) => {
  if (!user?.id) return user
  try {
    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: { lastLoginAt: new Date().toISOString() },
      overrideAccess: true,   // hook runs server-side; bypass field access
      depth: 0,
    })
  } catch {
    // Don't let a stat-write failure block a valid login.
  }
  return user
}
