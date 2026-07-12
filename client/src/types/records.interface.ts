// Shared shapes for the Phase 1 operational-records feature.

export const RECORD_STATUSES = ['active', 'inactive'] as const;

export const UNITS_OF_MEASURE = [
  'kWh',
  'L',
  'km',
  'kg',
  'unit',
  'ream',
  'm3',
] as const;

/** Result of a bulk CSV import, mirroring the server `CsvImportResult`. */
export interface CsvRowError {
  row: number;
  errors: string[];
}

export interface CsvImportResult {
  imported: number;
  failed: CsvRowError[];
}
