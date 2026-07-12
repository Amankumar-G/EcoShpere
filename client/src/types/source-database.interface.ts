export interface SourceDatabase {
  id: number;
  name: string;
  provider: string | null;
  url: string | null;
  lastImportedAt: string | null;
}

export interface SourceDatabasePayload {
  name: string;
  provider?: string;
  url?: string;
  lastImportedAt?: string;
}
