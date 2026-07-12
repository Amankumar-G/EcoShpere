'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable, DataTableColumn } from '@/components/shared/data-table';
import { FormDialog } from '@/components/shared/form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CsvImportDialog } from '@/components/records/csv-import-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCreateFleetModel,
  useCreateFleetVehicle,
  useDeleteFleetModel,
  useDeleteFleetVehicle,
  useFleetModels,
  useFleetVehicles,
  useImportFleetModelsCsv,
  useUpdateFleetModel,
  useUpdateFleetVehicle,
} from '@/data/fleet/fleet.hooks';
import { useEmployeeOptions } from '@/data/employees/employees.hooks';
import { FleetVehicle, FleetVehicleModel } from '@/types/fleet.interface';
import { RECORD_STATUSES } from '@/types/records.interface';
import {
  FleetModelSchema,
  FleetVehicleSchema,
  fleetModelSchema,
  fleetVehicleSchema,
} from '@/lib/zod-schemas/fleet.schema';

function toDateInput(value?: string | null): string {
  return value ? value.slice(0, 10) : '';
}

function ModelsSection() {
  const { data: models, isLoading } = useFleetModels();
  const createModel = useCreateFleetModel();
  const updateModel = useUpdateFleetModel();
  const deleteModel = useDeleteFleetModel();
  const importModels = useImportFleetModelsCsv();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FleetVehicleModel | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = React.useState<FleetVehicleModel | undefined>(
    undefined,
  );

  const form = useForm<FleetModelSchema>({
    resolver: zodResolver(fleetModelSchema),
    values: {
      name: editing?.name ?? '',
      co2Emissions: editing?.co2Emissions ?? '',
      status: (editing?.status as FleetModelSchema['status']) ?? 'active',
    },
  });

  const onSubmit = async (values: FleetModelSchema) => {
    const payload = {
      name: values.name,
      co2Emissions: Number(values.co2Emissions),
      status: values.status,
    };
    if (editing) {
      await updateModel.mutateAsync({ id: editing.id, payload });
    } else {
      await createModel.mutateAsync(payload);
    }
  };

  const columns: Array<DataTableColumn<FleetVehicleModel>> = [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    {
      id: 'co2',
      header: 'kgCO₂e / km',
      cell: (row) => row.co2Emissions,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant="secondary">{row.status}</Badge>,
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
            onClick={() => {
              setEditing(row);
              setIsFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${row.name}`}
            onClick={() => setDeleting(row)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsImportOpen(true)}>
          <Upload className="size-4" />
          Import CSV
        </Button>
        <Button
          onClick={() => {
            setEditing(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New model
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={models ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={models?.length ?? 1}
        total={models?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No vehicle models yet"
        emptyDescription="Add a model or import a CSV."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit model' : 'New model'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Model updated' : 'Model created'}
      >
        <Field>
          <FieldLabel htmlFor="model-name">Name</FieldLabel>
          <Input id="model-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="model-co2">kgCO₂e per km</FieldLabel>
          <Input
            id="model-co2"
            type="number"
            step="0.0001"
            {...form.register('co2Emissions')}
          />
          <FieldError errors={[form.formState.errors.co2Emissions]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="model-status">Status</FieldLabel>
          <NativeSelect id="model-status" {...form.register('status')}>
            {RECORD_STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {status}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </FormDialog>
      <CsvImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import vehicle models"
        columnsHint="name, co2Emissions, status"
        onImport={(csv) => importModels.mutateAsync(csv)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title={`Delete ${deleting?.name ?? 'model'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteModel.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}

function VehiclesSection() {
  const { data: vehicles, isLoading } = useFleetVehicles();
  const { data: models } = useFleetModels();
  const { data: employeeData } = useEmployeeOptions();
  const createVehicle = useCreateFleetVehicle();
  const updateVehicle = useUpdateFleetVehicle();
  const deleteVehicle = useDeleteFleetVehicle();

  const employees = employeeData?.items ?? [];

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FleetVehicle | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = React.useState<FleetVehicle | undefined>(
    undefined,
  );

  const form = useForm<FleetVehicleSchema>({
    resolver: zodResolver(fleetVehicleSchema),
    values: {
      employeeId: editing?.employeeId ? String(editing.employeeId) : '',
      modelId: editing?.modelId ? String(editing.modelId) : '',
      startDate: toDateInput(editing?.startDate),
      endDate: toDateInput(editing?.endDate),
    },
  });

  const onSubmit = async (values: FleetVehicleSchema) => {
    if (editing) {
      await updateVehicle.mutateAsync({
        id: editing.id,
        payload: {
          modelId: Number(values.modelId),
          startDate: values.startDate,
          endDate: values.endDate || undefined,
        },
      });
    } else {
      await createVehicle.mutateAsync({
        employeeId: Number(values.employeeId),
        modelId: Number(values.modelId),
        startDate: values.startDate,
        endDate: values.endDate || undefined,
      });
    }
  };

  const employeeName = (id: number) =>
    employees.find((employee) => employee.id === id)?.name ?? `#${id}`;

  const columns: Array<DataTableColumn<FleetVehicle>> = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => employeeName(row.employeeId),
    },
    {
      id: 'model',
      header: 'Model',
      cell: (row) => row.model?.name ?? `#${row.modelId}`,
    },
    {
      id: 'start',
      header: 'Start',
      cell: (row) => toDateInput(row.startDate),
    },
    {
      id: 'end',
      header: 'End',
      cell: (row) =>
        row.endDate ? toDateInput(row.endDate) : <Badge>active</Badge>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit assignment"
            onClick={() => {
              setEditing(row);
              setIsFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete assignment"
            onClick={() => setDeleting(row)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Assign vehicle
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={vehicles ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={vehicles?.length ?? 1}
        total={vehicles?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No vehicle assignments yet"
        emptyDescription="Assign a vehicle to an employee."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit assignment' : 'Assign vehicle'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Assignment updated' : 'Vehicle assigned'}
      >
        <Field>
          <FieldLabel htmlFor="vehicle-employee">Employee</FieldLabel>
          <NativeSelect
            id="vehicle-employee"
            disabled={Boolean(editing)}
            {...form.register('employeeId')}
          >
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
          <FieldLabel htmlFor="vehicle-model">Model</FieldLabel>
          <NativeSelect id="vehicle-model" {...form.register('modelId')}>
            <NativeSelectOption value="">Select model…</NativeSelectOption>
            {(models ?? []).map((model) => (
              <NativeSelectOption key={model.id} value={String(model.id)}>
                {model.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[form.formState.errors.modelId]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="vehicle-start">Start date</FieldLabel>
          <Input
            id="vehicle-start"
            type="date"
            {...form.register('startDate')}
          />
          <FieldError errors={[form.formState.errors.startDate]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="vehicle-end">
            End date (leave blank if active)
          </FieldLabel>
          <Input id="vehicle-end" type="date" {...form.register('endDate')} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete this assignment?"
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteVehicle.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}

export default function FleetPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fleet"
        description="Vehicle models (kgCO₂e/km) and employee vehicle assignments for commuting emissions."
      />
      <Tabs defaultValue="models">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        <TabsContent value="models">
          <ModelsSection />
        </TabsContent>
        <TabsContent value="vehicles">
          <VehiclesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
