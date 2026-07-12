export class SourceDatabaseResponseDto {
  id: number;
  name: string;
  provider: string | null;
  url: string | null;
  lastImportedAt: Date | null;
}
