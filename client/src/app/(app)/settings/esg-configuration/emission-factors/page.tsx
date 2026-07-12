'use client';

import * as React from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable, DataTableColumn } from '@/components/shared/data-table';
import { FormDialog } from '@/components/shared/form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  useCreateEmissionFactor,
  useDeleteEmissionFactor,
  useEmissionFactors,
} from '@/data/emission-factors/emission-factors.hooks';
import { useEmissionScopeTree } from '@/data/emission-scopes/emission-scopes.hooks';
import { useSourceDatabases } from '@/data/source-databases/source-databases.hooks';
import { EmissionFactor } from '@/types/emission-factor.interface';
import { EmissionScope } from '@/types/emission-scope.interface';
import { UNITS_OF_MEASURE, RECORD_STATUSES } from '@/types/records.interface';
import {
  EmissionFactorSchema,
  emissionFactorSchema,
} from '@/lib/zod-schemas/emission-factor.schema';

function flattenScopes(scopes: EmissionScope[]): EmissionScope[] {
  return scopes.flatMap((scope) => [
    scope,
    ...flattenScopes(scope.children ?? []),
  ]);
}

function EmissionFactorFormFields({
  form,
  scopes,
  sourceDatabases,
}: {
  form: ReturnType<typeof useForm<EmissionFactorSchema>>;
  scopes: EmissionScope[];
  sourceDatabases: Array<{ id: number; name: string }>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="factor-name">Name</FieldLabel>
        <Input id="factor-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="factor-scope">Scope</FieldLabel>
        <NativeSelect id="factor-scope" {...register('scopeId')}>
          <NativeSelectOption value="">Select a scope</NativeSelectOption>
          {scopes.map((scope) => (
            <NativeSelectOption key={scope.id} value={String(scope.id)}>
              {scope.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[errors.scopeId]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="factor-source-database">
          Source database
        </FieldLabel>
        <NativeSelect
          id="factor-source-database"
          {...register('sourceDatabaseId')}
        >
          <NativeSelectOption value="">
            Select a source database
          </NativeSelectOption>
          {sourceDatabases.map((sourceDatabase) => (
            <NativeSelectOption
              key={sourceDatabase.id}
              value={String(sourceDatabase.id)}
            >
              {sourceDatabase.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[errors.sourceDatabaseId]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="factor-compute-method">Compute method</FieldLabel>
        <NativeSelect id="factor-compute-method" {...register('computeMethod')}>
          <NativeSelectOption value="physical">Physical</NativeSelectOption>
          <NativeSelectOption value="monetary">Monetary</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="factor-unit">Unit of measure</FieldLabel>
        <NativeSelect id="factor-unit" {...register('unitOfMeasure')}>
          <NativeSelectOption value="">Select a unit</NativeSelectOption>
          {UNITS_OF_MEASURE.map((uom) => (
            <NativeSelectOption key={uom} value={uom}>
              {uom}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[errors.unitOfMeasure]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="factor-uncertainty">
          Uncertainty (%, optional)
        </FieldLabel>
        <Input
          id="factor-uncertainty"
          type="number"
          step="any"
          {...register('uncertainty')}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="factor-status">Status</FieldLabel>
        <NativeSelect id="factor-status" {...register('status')}>
          {RECORD_STATUSES.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {status}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[errors.status]} />
      </Field>
    </>
  );
}

function useEmissionFactorFormDialog(onClose: () => void) {
  const createEmissionFactor = useCreateEmissionFactor();

  const form = useForm<EmissionFactorSchema>({
    resolver: zodResolver(emissionFactorSchema),
    defaultValues: {
      name: '',
      scopeId: '',
      sourceDatabaseId: '',
      computeMethod: 'physical',
      // Empty placeholder; zod requires a real unit before submit.
      unitOfMeasure: '' as EmissionFactorSchema['unitOfMeasure'],
      uncertainty: '',
      status: 'active',
    },
  });

  const onSubmit = async (values: EmissionFactorSchema) => {
    await createEmissionFactor.mutateAsync({
      name: values.name,
      scopeId: Number(values.scopeId),
      sourceDatabaseId: Number(values.sourceDatabaseId),
      computeMethod: values.computeMethod,
      unitOfMeasure: values.unitOfMeasure,
      uncertainty: values.uncertainty ? Number(values.uncertainty) : undefined,
      status: values.status,
    });
    form.reset();
    onClose();
  };

  return { form, onSubmit };
}

export default function SettingsEmissionFactorsPage() {
  const [scopeFilter, setScopeFilter] = React.useState('');
  const [sourceDatabaseFilter, setSourceDatabaseFilter] = React.useState('');

  const { data: scopeTree } = useEmissionScopeTree();
  const { data: sourceDatabases } = useSourceDatabases();
  const scopes = React.useMemo(
    () => flattenScopes(scopeTree ?? []),
    [scopeTree],
  );

  const filters = React.useMemo(() => {
    const matchedScope = scopes.find((scope) =>
      scope.name.toLowerCase().includes(scopeFilter.toLowerCase()),
    );
    const matchedSourceDatabase = (sourceDatabases ?? []).find(
      (sourceDatabase) =>
        sourceDatabase.name
          .toLowerCase()
          .includes(sourceDatabaseFilter.toLowerCase()),
    );
    return {
      scopeId: scopeFilter ? matchedScope?.id : undefined,
      sourceDatabaseId: sourceDatabaseFilter
        ? matchedSourceDatabase?.id
        : undefined,
    };
  }, [scopeFilter, sourceDatabaseFilter, scopes, sourceDatabases]);

  const { data: factors, isLoading } = useEmissionFactors(filters);
  const deleteEmissionFactor = useDeleteEmissionFactor();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [deletingFactor, setDeletingFactor] = React.useState<
    EmissionFactor | undefined
  >(undefined);

  const { form, onSubmit } = useEmissionFactorFormDialog(() =>
    setIsFormOpen(false),
  );

  const columns: Array<DataTableColumn<EmissionFactor>> = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => (
        <Link
          href={`/settings/esg-configuration/emission-factors/${row.id}`}
          className="font-medium hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    {
      id: 'scope',
      header: 'Scope',
      filterable: true,
      filterPlaceholder: 'Filter by scope',
      cell: (row) => <Badge variant="secondary">{row.scope.name}</Badge>,
    },
    {
      id: 'sourceDatabase',
      header: 'Source database',
      filterable: true,
      filterPlaceholder: 'Filter by source DB',
      cell: (row) => row.sourceDatabase.name,
    },
    {
      id: 'unitOfMeasure',
      header: 'UoM',
      cell: (row) => row.unitOfMeasure,
    },
    {
      id: 'value',
      header: 'CO2e/unit',
      cell: (row) => (
        <span className="block text-right tabular-nums">
          {row.value.toFixed(4)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant="outline">{row.status}</Badge>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${row.name}`}
          onClick={() => setDeletingFactor(row)}
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Emission Factors"
        description="Manage emission factors, their gas composition, and computed CO2e value."
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="size-4" />
            New emission factor
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={factors ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={factors?.length ?? 1}
        total={factors?.length ?? 0}
        onPageChange={() => undefined}
        filters={{ scope: scopeFilter, sourceDatabase: sourceDatabaseFilter }}
        onFilterChange={(columnId, value) => {
          if (columnId === 'scope') setScopeFilter(value);
          if (columnId === 'sourceDatabase') setSourceDatabaseFilter(value);
        }}
        emptyTitle="No emission factors yet"
        emptyDescription="Create your first emission factor to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title="New emission factor"
        form={form}
        onSubmit={onSubmit}
        successMessage="Emission factor created"
      >
        <EmissionFactorFormFields
          form={form}
          scopes={scopes}
          sourceDatabases={sourceDatabases ?? []}
        />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingFactor)}
        onOpenChange={(open) => !open && setDeletingFactor(undefined)}
        title={`Delete ${deletingFactor?.name ?? 'emission factor'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingFactor) {
            await deleteEmissionFactor.mutateAsync(deletingFactor.id);
          }
        }}
      />
    </div>
  );
}
