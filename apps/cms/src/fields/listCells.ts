import type { Field } from 'payload'

/**
 * GtJourneysID — Shared list-view Cell helpers (Phase 4.12).
 *
 * Keeps per-collection edits down to two lines:
 *   1. Wrap the collection's status field with `withStatusCell(...)`.
 *   2. Add `updatedAtRelativeField` (and optionally `blockCountField`)
 *      to the fields array + include in `admin.defaultColumns`.
 *
 * All Cell components live in `apps/cms/src/admin/cells/`. The shared
 * `fields/status.ts#statusField` helper is intentionally NOT mutated —
 * each collection opts in explicitly, so a collection that hasn't opted
 * in keeps Payload's default rendering.
 */

/** Return a copy of a status/select field with the StatusCell attached. */
export const withStatusCell = <T extends Field>(field: T): T =>
  ({
    ...field,
    admin: {
      ...(((field as any).admin) ?? {}),
      components: {
        ...(((field as any).admin?.components) ?? {}),
        Cell: '/admin/cells/StatusCell#default',
      },
    },
  }) as T

/** Virtual `ui` field: relative timestamp cell driven by rowData.updatedAt. */
export const updatedAtRelativeField: Field = {
  name: 'updatedAtRelative',
  type: 'ui',
  label: 'Modified',
  admin: { components: { Cell: '/admin/cells/RelativeDateCell#default' } },
}

/**
 * Virtual `ui` field: item-count cell that reads rowData[fieldName].length.
 * BlockCountCell reads rowData.content by default — this factory keeps
 * the same visual for other array fields (e.g. gallery, itinerary).
 * Pass a distinct `name` so multiple counts can coexist.
 */
export const arrayCountField = (opts: {
  name: string
  label: string
  from: string
  singular: string
  plural: string
}): Field => ({
  name: opts.name,
  type: 'ui',
  label: opts.label,
  admin: { components: { Cell: '/admin/cells/BlockCountCell#default' } },
})
