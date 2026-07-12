'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable, DataTableColumn } from '@/components/shared/data-table';
import { FormDialog } from '@/components/shared/form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  useCreateSourceDatabase,
  useDeleteSourceDatabase,
  useSourceDatabases,
  useUpdateSourceDatabase,
} from '@/data/source-databases/source-databases.hooks';
import { SourceDatabase } from '@/types/source-database.interface';
import {
  SourceDatabaseSchema,
  sourceDatabaseSchema,
} from '@/lib/zod-schemas/source-database.schema';

function toSourceDatabaseFormValues(
  sourceDatabase?: SourceDatabase,
): SourceDatabaseSchema {
  return {
    name: sourceDatabase?.name ?? '',
    provider: sourceDatabase?.provider ?? '',
    url: sourceDatabase?.url ?? '',
    lastImportedAt: sourceDatabase?.lastImportedAt
      ? sourceDatabase.lastImportedAt.slice(0, 10)
      : '',
  };
}

function SourceDatabaseFormFields({
  form,
}: {
  form: ReturnType<typeof useForm<SourceDatabaseSchema>>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="source-database-name">Name</FieldLabel>
        <Input id="source-database-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="source-database-provider">Provider</FieldLabel>
        <Input id="source-database-provider" {...register('provider')} />
      </Field>
      <Field>
        <FieldLabel htmlFor="source-database-url">URL</FieldLabel>
        <Input id="source-database-url" {...register('url')} />
      </Field>
      <Field>
        <FieldLabel htmlFor="source-database-last-imported">
          Last imported
        </FieldLabel>
        <Input
          id="source-database-last-imported"
          type="date"
          {...register('lastImportedAt')}
        />
      </Field>
    </>
  );
}

function useSourceDatabaseFormDialog(
  editingSourceDatabase: SourceDatabase | undefined,
  onClose: () => void,
) {
  const createSourceDatabase = useCreateSourceDatabase();
  const updateSourceDatabase = useUpdateSourceDatabase();

  const form = useForm<SourceDatabaseSchema>({
    resolver: zodResolver(sourceDatabaseSchema),
    values: toSourceDatabaseFormValues(editingSourceDatabase),
  });

  const onSubmit = async (values: SourceDatabaseSchema) => {
    const payload = {
      name: values.name,
      provider: values.provider || undefined,
      url: values.url || undefined,
      lastImportedAt: values.lastImportedAt || undefined,
    };
    if (editingSourceDatabase) {
      await updateSourceDatabase.mutateAsync({
        id: editingSourceDatabase.id,
        payload,
      });
    } else {
      await createSourceDatabase.mutateAsync(payload);
    }
    onClose();
  };

  return { form, onSubmit };
}

export default function SettingsSourceDatabasesPage() {
  const { data: sourceDatabases, isLoading } = useSourceDatabases();
  const deleteSourceDatabase = useDeleteSourceDatabase();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingSourceDatabase, setEditingSourceDatabase] = React.useState<
    SourceDatabase | undefined
  >(undefined);
  const [deletingSourceDatabase, setDeletingSourceDatabase] = React.useState<
    SourceDatabase | undefined
  >(undefined);

  const { form, onSubmit } = useSourceDatabaseFormDialog(
    editingSourceDatabase,
    () => setIsFormOpen(false),
  );

  const openCreateForm = () => {
    setEditingSourceDatabase(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (sourceDatabase: SourceDatabase) => {
    setEditingSourceDatabase(sourceDatabase);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<SourceDatabase>> = [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    { id: 'provider', header: 'Provider', cell: (row) => row.provider ?? '—' },
    { id: 'url', header: 'URL', cell: (row) => row.url ?? '—' },
    {
      id: 'lastImportedAt',
      header: 'Last imported',
      cell: (row) => (
        <span className="tabular-nums">
          {row.lastImportedAt
            ? new Date(row.lastImportedAt).toLocaleDateString()
            : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${row.name}`}
            onClick={() => openEditForm(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${row.name}`}
            onClick={() => setDeletingSourceDatabase(row)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Source Databases"
        description="Manage the emission factor source databases (ADEME, DEFRA, EPA, IEA, etc)."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" />
            New source database
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={sourceDatabases ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={sourceDatabases?.length ?? 1}
        total={sourceDatabases?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No source databases yet"
        emptyDescription="Create your first source database to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          editingSourceDatabase ? 'Edit source database' : 'New source database'
        }
        form={form}
        onSubmit={onSubmit}
        successMessage={
          editingSourceDatabase
            ? 'Source database updated'
            : 'Source database created'
        }
      >
        <SourceDatabaseFormFields form={form} />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingSourceDatabase)}
        onOpenChange={(open) => !open && setDeletingSourceDatabase(undefined)}
        title={`Delete ${deletingSourceDatabase?.name ?? 'source database'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingSourceDatabase) {
            await deleteSourceDatabase.mutateAsync(deletingSourceDatabase.id);
          }
        }}
      />
    </div>
  );
}
