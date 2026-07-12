/**
 * Shared active/inactive lifecycle vocabulary for master-data records. Mirrors
 * the per-module `RECORD_STATUSES` defined in Phase 1 DTOs; new code should
 * import this shared constant.
 */
export const RECORD_STATUSES = ['active', 'inactive'] as const;

export type RecordStatus = (typeof RECORD_STATUSES)[number];
