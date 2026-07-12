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
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  useBusinessTravels,
  useCreateBusinessTravel,
  useDeleteBusinessTravel,
  useUpdateBusinessTravel,
} from '@/data/business-travel/business-travel.hooks';
import { useEmployeeOptions } from '@/data/employees/employees.hooks';
import {
  BusinessTravel,
  TRAVEL_MODES,
} from '@/types/business-travel.interface';
import {
  BusinessTravelSchema,
  businessTravelSchema,
} from '@/lib/zod-schemas/business-travel.schema';

function toDateInput(value?: string): string {
  return value ? value.slice(0, 10) : '';
}

function toFormValues(travel?: BusinessTravel): BusinessTravelSchema {
  return {
    employeeId: travel?.employeeId ? String(travel.employeeId) : '',
    mode: (travel?.mode as BusinessTravelSchema['mode']) ?? 'flight',
    origin: travel?.origin ?? '',
    destination: travel?.destination ?? '',
    distanceKm: travel?.distanceKm ?? '',
    date: toDateInput(travel?.date),
    purpose: travel?.purpose ?? '',
  };
}

export default function BusinessTravelPage() {
  const { data: travels, isLoading } = useBusinessTravels();
  const { data: employeeData } = useEmployeeOptions();
  const createTravel = useCreateBusinessTravel();
  const updateTravel = useUpdateBusinessTravel();
  const deleteTravel = useDeleteBusinessTravel();

  const employees = employeeData?.items ?? [];

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BusinessTravel | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = React.useState<BusinessTravel | undefined>(
    undefined,
  );

  const form = useForm<BusinessTravelSchema>({
    resolver: zodResolver(businessTravelSchema),
    values: toFormValues(editing),
  });

  const onSubmit = async (values: BusinessTravelSchema) => {
    const payload = {
      employeeId: Number(values.employeeId),
      mode: values.mode,
      origin: values.origin || undefined,
      destination: values.destination || undefined,
      distanceKm: values.distanceKm ? Number(values.distanceKm) : undefined,
      date: values.date,
      purpose: values.purpose || undefined,
    };
    if (editing) {
      await updateTravel.mutateAsync({ id: editing.id, payload });
    } else {
      await createTravel.mutateAsync(payload);
    }
  };

  const openCreate = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (travel: BusinessTravel) => {
    setEditing(travel);
    setIsFormOpen(true);
  };

  const employeeName = (id: number) =>
    employees.find((employee) => employee.id === id)?.name ?? `#${id}`;

  const columns: Array<DataTableColumn<BusinessTravel>> = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => employeeName(row.employeeId),
    },
    { id: 'mode', header: 'Mode', cell: (row) => row.mode },
    {
      id: 'route',
      header: 'Route',
      cell: (row) =>
        row.origin || row.destination
          ? `${row.origin ?? '—'} → ${row.destination ?? '—'}`
          : '—',
    },
    {
      id: 'distance',
      header: 'Distance (km)',
      cell: (row) => row.distanceKm ?? '—',
    },
    { id: 'date', header: 'Date', cell: (row) => toDateInput(row.date) },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit trip"
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete trip"
            onClick={() => setDeleting(row)}
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
        title="Business Travel"
        description="One-off employee travel. Feeds Scope 3 Category 6 emissions."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New trip
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={travels ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={travels?.length ?? 1}
        total={travels?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No trips yet"
        emptyDescription="Log your first business trip."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit trip' : 'New trip'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Trip updated' : 'Trip logged'}
      >
        <Field>
          <FieldLabel htmlFor="travel-employee">Employee</FieldLabel>
          <NativeSelect id="travel-employee" {...form.register('employeeId')}>
            <NativeSelectOption value="">Select employee…</NativeSelectOption>
            {employees.map((employee) => (
              <NativeSelectOption key={employee.id} value={String(employee.id)}>
                {employee.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[form.formState.errors.employeeId]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="travel-mode">Mode</FieldLabel>
          <NativeSelect id="travel-mode" {...form.register('mode')}>
            {TRAVEL_MODES.map((mode) => (
              <NativeSelectOption key={mode} value={mode}>
                {mode}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="travel-origin">Origin</FieldLabel>
          <Input id="travel-origin" {...form.register('origin')} />
        </Field>
        <Field>
          <FieldLabel htmlFor="travel-destination">Destination</FieldLabel>
          <Input id="travel-destination" {...form.register('destination')} />
        </Field>
        <Field>
          <FieldLabel htmlFor="travel-distance">Distance (km)</FieldLabel>
          <Input
            id="travel-distance"
            type="number"
            step="0.01"
            {...form.register('distanceKm')}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="travel-date">Date</FieldLabel>
          <Input id="travel-date" type="date" {...form.register('date')} />
          <FieldError errors={[form.formState.errors.date]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="travel-purpose">Purpose</FieldLabel>
          <Input id="travel-purpose" {...form.register('purpose')} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete this trip?"
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteTravel.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}
