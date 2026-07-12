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
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { useMe } from '@/data/auth/auth.hooks';
import { useDepartments } from '@/data/departments/departments.hooks';
import { useEmployeeOptions } from '@/data/employees/employees.hooks';
import {
  useCreateInitiative,
  useDeleteInitiative,
  useInitiatives,
  useUpdateInitiative,
} from '@/data/initiatives/initiatives.hooks';
import {
  Initiative,
  INITIATIVE_STATUSES,
} from '@/types/environmental.interface';
import {
  InitiativeSchema,
  initiativeSchema,
} from '@/lib/zod-schemas/initiative.schema';

function toInitiativeFormValues(initiative?: Initiative): InitiativeSchema {
  return {
    title: initiative?.title ?? '',
    description: initiative?.description ?? '',
    departmentId: initiative?.departmentId
      ? String(initiative.departmentId)
      : '',
    assigneeEmployeeId: initiative?.assigneeEmployeeId
      ? String(initiative.assigneeEmployeeId)
      : '',
    estimatedCo2Reduction:
      initiative?.estimatedCo2Reduction != null
        ? String(initiative.estimatedCo2Reduction)
        : '',
    actualCo2Reduction:
      initiative?.actualCo2Reduction != null
        ? String(initiative.actualCo2Reduction)
        : '',
    progress: initiative ? String(initiative.progress) : '0',
    deadline: initiative?.deadline?.slice(0, 10) ?? '',
    status: (initiative?.status as InitiativeSchema['status']) ?? 'open',
  };
}

export default function InitiativesPage() {
  const { data: user } = useMe();
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const { data: initiatives, isLoading } = useInitiatives();
  const { data: departments } = useDepartments(Boolean(canManage));
  const { data: employees } = useEmployeeOptions();
  const createInitiative = useCreateInitiative();
  const updateInitiative = useUpdateInitiative();
  const deleteInitiative = useDeleteInitiative();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Initiative | undefined>();
  const [deleting, setDeleting] = React.useState<Initiative | undefined>();

  const form = useForm<InitiativeSchema>({
    resolver: zodResolver(initiativeSchema),
    values: toInitiativeFormValues(editing),
  });

  const onSubmit = async (values: InitiativeSchema) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      departmentId: values.departmentId
        ? Number(values.departmentId)
        : undefined,
      assigneeEmployeeId: values.assigneeEmployeeId
        ? Number(values.assigneeEmployeeId)
        : undefined,
      estimatedCo2Reduction: values.estimatedCo2Reduction
        ? Number(values.estimatedCo2Reduction)
        : undefined,
      actualCo2Reduction: values.actualCo2Reduction
        ? Number(values.actualCo2Reduction)
        : undefined,
      progress: values.progress ? Number(values.progress) : undefined,
      deadline: values.deadline || undefined,
      status: values.status,
    };
    if (editing) {
      await updateInitiative.mutateAsync({ id: editing.id, payload });
    } else {
      await createInitiative.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  const columns: Array<DataTableColumn<Initiative>> = [
    { id: 'title', header: 'Title', cell: (row) => row.title },
    {
      id: 'progress',
      header: 'Progress',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, row.progress)}%` }}
            />
          </div>
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.progress}%
          </span>
        </div>
      ),
    },
    {
      id: 'reduction',
      header: 'CO2e saved (actual / est.)',
      cell: (row) => (
        <span className="tabular-nums">
          {row.actualCo2Reduction ?? '—'} / {row.estimatedCo2Reduction ?? '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant="outline">{row.status}</Badge>,
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: (row: Initiative) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${row.title}`}
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
                  aria-label={`Delete ${row.title}`}
                  onClick={() => setDeleting(row)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Initiatives"
        description="Reduction actions with estimated vs actual CO2 saved."
        breadcrumb={[
          { label: 'Environmental', href: '/environmental' },
          { label: 'Initiatives' },
        ]}
        action={
          canManage ? (
            <Button
              onClick={() => {
                setEditing(undefined);
                setIsFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              New initiative
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={initiatives ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={initiatives?.length ?? 1}
        total={initiatives?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No initiatives yet"
        emptyDescription="Create your first reduction initiative to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit initiative' : 'New initiative'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Initiative updated' : 'Initiative created'}
      >
        <Field>
          <FieldLabel htmlFor="initiative-title">Title</FieldLabel>
          <Input id="initiative-title" {...form.register('title')} />
          <FieldError errors={[form.formState.errors.title]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="initiative-description">Description</FieldLabel>
          <Input
            id="initiative-description"
            {...form.register('description')}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="initiative-department">Department</FieldLabel>
            <NativeSelect
              id="initiative-department"
              {...form.register('departmentId')}
            >
              <NativeSelectOption value="">
                Organization-wide
              </NativeSelectOption>
              {(departments ?? []).map((department) => (
                <NativeSelectOption
                  key={department.id}
                  value={String(department.id)}
                >
                  {department.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="initiative-assignee">Assignee</FieldLabel>
            <NativeSelect
              id="initiative-assignee"
              {...form.register('assigneeEmployeeId')}
            >
              <NativeSelectOption value="">Unassigned</NativeSelectOption>
              {(employees?.items ?? []).map((employee) => (
                <NativeSelectOption
                  key={employee.id}
                  value={String(employee.id)}
                >
                  {employee.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="initiative-est">
              Estimated CO2e saved
            </FieldLabel>
            <Input
              id="initiative-est"
              type="number"
              step="any"
              {...form.register('estimatedCo2Reduction')}
            />
            <FieldError
              errors={[form.formState.errors.estimatedCo2Reduction]}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="initiative-actual">
              Actual CO2e saved
            </FieldLabel>
            <Input
              id="initiative-actual"
              type="number"
              step="any"
              {...form.register('actualCo2Reduction')}
            />
            <FieldError errors={[form.formState.errors.actualCo2Reduction]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="initiative-progress">Progress (%)</FieldLabel>
            <Input
              id="initiative-progress"
              type="number"
              step="any"
              {...form.register('progress')}
            />
            <FieldError errors={[form.formState.errors.progress]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="initiative-deadline">Deadline</FieldLabel>
            <Input
              id="initiative-deadline"
              type="date"
              {...form.register('deadline')}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="initiative-status">Status</FieldLabel>
          <NativeSelect id="initiative-status" {...form.register('status')}>
            {INITIATIVE_STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {status.replace('_', ' ')}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title={`Delete ${deleting?.title ?? 'initiative'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) await deleteInitiative.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
