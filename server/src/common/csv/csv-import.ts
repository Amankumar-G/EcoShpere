import { BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

/** Per-row failure captured during an import, keyed by 1-based data row number. */
export interface CsvRowError {
  row: number;
  errors: string[];
}

/** Outcome of a bulk CSV import: how many rows persisted and which failed. */
export interface CsvImportResult {
  imported: number;
  failed: CsvRowError[];
}

/**
 * Parse a CSV document (header row + data rows) into records keyed by column
 * name. Throws BadRequestException if the CSV itself is unparseable.
 */
export function parseCsv(csv: string): Record<string, string>[] {
  try {
    return parse(csv, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid CSV';
    throw new BadRequestException(`Could not parse CSV: ${message}`);
  }
}

/**
 * Import each parsed row through `handleRow`, isolating failures: a row that
 * throws is recorded in `failed` (with its 1-based number) and the rest still
 * import. This gives the "happy + malformed rows" behaviour the plan requires.
 */
export async function importRows(
  rows: Record<string, string>[],
  handleRow: (row: Record<string, string>) => Promise<void>,
): Promise<CsvImportResult> {
  const failed: CsvRowError[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    try {
      await handleRow(rows[i]);
      imported++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push({ row: i + 1, errors: [message] });
    }
  }

  return { imported, failed };
}
