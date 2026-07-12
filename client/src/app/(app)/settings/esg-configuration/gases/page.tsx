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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  useCreateGas,
  useDeleteGas,
  useGases,
  useUpdateGas,
} from '@/data/gases/gases.hooks';
import { Gas } from '@/types/gas.interface';
import { GasSchema, gasSchema } from '@/lib/zod-schemas/gas.schema';

function toGasFormValues(gas?: Gas): GasSchema {
  return {
    name: gas?.name ?? '',
    symbol: gas?.symbol ?? '',
    gwp: gas?.gwp ?? 0,
  };
}

function GasFormFields({
  form,
}: {
  form: ReturnType<typeof useForm<GasSchema>>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="gas-name">Name</FieldLabel>
        <Input id="gas-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="gas-symbol">Symbol</FieldLabel>
        <Input id="gas-symbol" {...register('symbol')} />
        <FieldError errors={[errors.symbol]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="gas-gwp">GWP</FieldLabel>
        <Input id="gas-gwp" type="number" step="any" {...register('gwp')} />
        <FieldError errors={[errors.gwp]} />
      </Field>
    </>
  );
}

function useGasFormDialog(editingGas: Gas | undefined, onClose: () => void) {
  const createGas = useCreateGas();
  const updateGas = useUpdateGas();

  const form = useForm<GasSchema>({
    resolver: zodResolver(gasSchema),
    values: toGasFormValues(editingGas),
  });

  const onSubmit = async (values: GasSchema) => {
    if (editingGas) {
      await updateGas.mutateAsync({ id: editingGas.id, payload: values });
    } else {
      await createGas.mutateAsync(values);
    }
    onClose();
  };

  return { form, onSubmit };
}

export default function SettingsGasesPage() {
  const { data: gases, isLoading } = useGases();
  const deleteGas = useDeleteGas();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingGas, setEditingGas] = React.useState<Gas | undefined>(
    undefined,
  );
  const [deletingGas, setDeletingGas] = React.useState<Gas | undefined>(
    undefined,
  );

  const { form, onSubmit } = useGasFormDialog(editingGas, () =>
    setIsFormOpen(false),
  );

  const openCreateForm = () => {
    setEditingGas(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (gas: Gas) => {
    setEditingGas(gas);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<Gas>> = [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    {
      id: 'symbol',
      header: 'Symbol',
      cell: (row) => <Badge variant="secondary">{row.symbol}</Badge>,
    },
    {
      id: 'gwp',
      header: 'GWP',
      cell: (row) => (
        <span className="tabular-nums">{row.gwp.toLocaleString()}</span>
      ),
    },
    { id: 'gwpMetric', header: 'GWP Metric', cell: (row) => row.gwpMetric },
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
            onClick={() => setDeletingGas(row)}
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
        title="Gases"
        description="Manage greenhouse gases and their global warming potential (GWP)."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" />
            New gas
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={gases ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={gases?.length ?? 1}
        total={gases?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No gases yet"
        emptyDescription="Create your first gas to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingGas ? 'Edit gas' : 'New gas'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editingGas ? 'Gas updated' : 'Gas created'}
      >
        <GasFormFields form={form} />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingGas)}
        onOpenChange={(open) => !open && setDeletingGas(undefined)}
        title={`Delete ${deletingGas?.name ?? 'gas'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingGas) {
            await deleteGas.mutateAsync(deletingGas.id);
          }
        }}
      />
    </div>
  );
}
