import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSourceDatabase,
  deleteSourceDatabase,
  getSourceDatabases,
  updateSourceDatabase,
} from '@/data/source-databases/source-databases.api';
import { SourceDatabasePayload } from '@/types/source-database.interface';

export const sourceDatabasesQueryKeys = {
  list: ['source-databases', 'list'] as const,
};

export const useSourceDatabases = () => {
  return useQuery({
    queryKey: sourceDatabasesQueryKeys.list,
    queryFn: getSourceDatabases,
  });
};

const useInvalidateSourceDatabases = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: sourceDatabasesQueryKeys.list });
};

export const useCreateSourceDatabase = () => {
  const invalidate = useInvalidateSourceDatabases();
  return useMutation({
    mutationFn: (payload: SourceDatabasePayload) =>
      createSourceDatabase(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateSourceDatabase = () => {
  const invalidate = useInvalidateSourceDatabases();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SourceDatabasePayload;
    }) => updateSourceDatabase(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteSourceDatabase = () => {
  const invalidate = useInvalidateSourceDatabases();
  return useMutation({
    mutationFn: (id: number) => deleteSourceDatabase(id),
    onSuccess: invalidate,
  });
};
