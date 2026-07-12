import { IsString } from 'class-validator';

/**
 * Bulk-import payload: the raw CSV document as a string (header row + data
 * rows). The client reads the chosen file and posts its text content — no
 * multipart upload, so imports stay trivially testable.
 */
export class ImportCsvDto {
  @IsString()
  csv: string;
}
