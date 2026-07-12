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
import {
  useCreateEnvironmentalGoal,
  useDeleteEnvironmentalGoal,
  useEnvironmentalGoals,
  useUpdateEnvironmentalGoal,
} from '@/data/environmental-goals/environmental-goals.hooks';
import {
  EnvironmentalGoal,
  GOAL_STATUSES,
} from '@/types/environmental.interface';
import {
  EnvironmentalGoalSchema,
  environmentalGoalSchema,
} from '@/lib/zod-schemas/environmental-goal.schema';

function toGoalFormValues(goal?: EnvironmentalGoal): EnvironmentalGoalSchema {
  return {
    departmentId: goal?.departmentId ? String(goal.departmentId) : '',
    metric: goal?.metric ?? '',
    targetValue: goal ? String(goal.targetValue) : '',
    unit: goal?.unit ?? '',
    startDate: goal?.startDate?.slice(0, 10) ?? '',
    endDate: goal?.endDate?.slice(0, 10) ?? '',
    status: (goal?.status as EnvironmentalGoalSchema['status']) ?? 'active',
  };
}

export default function EnvironmentalGoalsPage() {
  const { data: user } = useMe();
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const { data: goals, isLoading } = useEnvironmentalGoals();
  const { data: departments } = useDepartments(Boolean(canManage));
  const createGoal = useCreateEnvironmentalGoal();
  const updateGoal = useUpdateEnvironmentalGoal();
  const deleteGoal = useDeleteEnvironmentalGoal();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EnvironmentalGoal | undefined>();
  const [deleting, setDeleting] = React.useState<
    EnvironmentalGoal | undefined
  >();

  const form = useForm<EnvironmentalGoalSchema>({
    resolver: zodResolver(environmentalGoalSchema),
    values: toGoalFormValues(editing),
  });

  const onSubmit = async (values: EnvironmentalGoalSchema) => {
    const payload = {
      departmentId: values.departmentId
        ? Number(values.departmentId)
        : undefined,
      metric: values.metric,
      targetValue: Number(values.targetValue),
      unit: values.unit,
      startDate: values.startDate,
      endDate: values.endDate,
      status: values.status,
    };
    if (editing) {
      await updateGoal.mutateAsync({ id: editing.id, payload });
    } else {
      await createGoal.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  const departmentName = (id: number | null) =>
    departments?.find((department) => department.id === id)?.name ?? '—';

  const columns: Array<DataTableColumn<EnvironmentalGoal>> = [
    { id: 'metric', header: 'Metric', cell: (row) => row.metric },
    {
      id: 'target',
      header: 'Target',
      cell: (row) => (
        <span className="tabular-nums">
          {row.targetValue} {row.unit}
        </span>
      ),
    },
    {
      id: 'period',
      header: 'Period',
      cell: (row) =>
        `${row.startDate.slice(0, 10)} → ${row.endDate.slice(0, 10)}`,
    },
    {
      id: 'department',
      header: 'Department',
      cell: (row) => departmentName(row.departmentId),
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
            cell: (row: EnvironmentalGoal) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${row.metric}`}
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
                  aria-label={`Delete ${row.metric}`}
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
        title="Environmental Goals"
        description="Set reduction targets per department with a deadline."
        breadcrumb={[
          { label: 'Environmental', href: '/environmental' },
          { label: 'Goals' },
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
              New goal
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={goals ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={goals?.length ?? 1}
        total={goals?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No goals yet"
        emptyDescription="Create your first environmental goal to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit goal' : 'New goal'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Goal updated' : 'Goal created'}
      >
        <Field>
          <FieldLabel htmlFor="goal-metric">Metric</FieldLabel>
          <Input
            id="goal-metric"
            placeholder="e.g. Scope 2 kgCO2e"
            {...form.register('metric')}
          />
          <FieldError errors={[form.formState.errors.metric]} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="goal-target">Target value</FieldLabel>
            <Input
              id="goal-target"
              type="number"
              step="any"
              {...form.register('targetValue')}
            />
            <FieldError errors={[form.formState.errors.targetValue]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="goal-unit">Unit</FieldLabel>
            <Input
              id="goal-unit"
              placeholder="kgCO2e"
              {...form.register('unit')}
            />
            <FieldError errors={[form.formState.errors.unit]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="goal-start">Start date</FieldLabel>
            <Input
              id="goal-start"
              type="date"
              {...form.register('startDate')}
            />
            <FieldError errors={[form.formState.errors.startDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="goal-end">End date</FieldLabel>
            <Input id="goal-end" type="date" {...form.register('endDate')} />
            <FieldError errors={[form.formState.errors.endDate]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="goal-department">Department</FieldLabel>
            <NativeSelect
              id="goal-department"
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
            <FieldLabel htmlFor="goal-status">Status</FieldLabel>
            <NativeSelect id="goal-status" {...form.register('status')}>
              {GOAL_STATUSES.map((status) => (
                <NativeSelectOption key={status} value={status}>
                  {status}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title={`Delete ${deleting?.metric ?? 'goal'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) await deleteGoal.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
