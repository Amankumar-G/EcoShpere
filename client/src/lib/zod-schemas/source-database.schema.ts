import { z } from 'zod';

export const sourceDatabaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.string(),
  url: z.string(),
  lastImportedAt: z.string(),
});

export type SourceDatabaseSchema = z.infer<typeof sourceDatabaseSchema>;
