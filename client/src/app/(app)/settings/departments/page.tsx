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
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from '@/data/departments/departments.hooks';
import { useEmployeeOptions } from '@/data/employees/employees.hooks';
import { Department } from '@/types/department.interface';
import {
  DepartmentSchema,
  departmentSchema,
} from '@/lib/zod-schemas/department.schema';

const NONE_VALUE = '__none__';

function toDepartmentFormValues(department?: Department): DepartmentSchema {
  return {
    name: department?.name ?? '',
    code: department?.code ?? '',
    parentId: department?.parentId ? String(department.parentId) : NONE_VALUE,
    headEmployeeId: department?.headEmployeeId
      ? String(department.headEmployeeId)
      : NONE_VALUE,
  };
}

function findEmployeeName(
  employees: Array<{ id: number; name: string }> | undefined,
  id: number | null,
) {
  if (!id) return '—';
  return employees?.find((employee) => employee.id === id)?.name ?? '—';
}

function findDepartmentName(
  departments: Department[] | undefined,
  id: number | null,
) {
  if (!id) return '—';
  return departments?.find((department) => department.id === id)?.name ?? '—';
}

function DepartmentFormFields({
  form,
  departments,
  currentDepartmentId,
  employeeOptions,
}: {
  form: ReturnType<typeof useForm<DepartmentSchema>>;
  departments: Department[];
  currentDepartmentId?: number;
  employeeOptions: Array<{ id: number; name: string }>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="department-name">Name</FieldLabel>
        <Input id="department-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="department-code">Code</FieldLabel>
        <Input id="department-code" {...register('code')} />
        <FieldError errors={[errors.code]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="department-parent">Parent department</FieldLabel>
        <NativeSelect id="department-parent" {...register('parentId')}>
          <NativeSelectOption value={NONE_VALUE}>None</NativeSelectOption>
          {departments
            .filter((department) => department.id !== currentDepartmentId)
            .map((department) => (
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
        <FieldLabel htmlFor="department-head">Head</FieldLabel>
        <NativeSelect id="department-head" {...register('headEmployeeId')}>
          <NativeSelectOption value={NONE_VALUE}>None</NativeSelectOption>
          {employeeOptions.map((employee) => (
            <NativeSelectOption key={employee.id} value={String(employee.id)}>
              {employee.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
    </>
  );
}

function useDepartmentFormDialog(
  editingDepartment: Department | undefined,
  onClose: () => void,
) {
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();

  const form = useForm<DepartmentSchema>({
    resolver: zodResolver(departmentSchema),
    values: toDepartmentFormValues(editingDepartment),
  });

  const onSubmit = async (values: DepartmentSchema) => {
    const payload = {
      name: values.name,
      code: values.code,
      parentId: values.parentId === NONE_VALUE ? null : Number(values.parentId),
      headEmployeeId:
        values.headEmployeeId === NONE_VALUE
          ? null
          : Number(values.headEmployeeId),
    };
    if (editingDepartment) {
      await updateDepartment.mutateAsync({ id: editingDepartment.id, payload });
    } else {
      await createDepartment.mutateAsync(payload);
    }
    onClose();
  };

  return { form, onSubmit };
}

export default function SettingsDepartmentsPage() {
  const { data: departments, isLoading } = useDepartments(true);
  const { data: employeeData } = useEmployeeOptions();
  const deleteDepartment = useDeleteDepartment();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingDepartment, setEditingDepartment] = React.useState<
    Department | undefined
  >(undefined);
  const [deletingDepartment, setDeletingDepartment] = React.useState<
    Department | undefined
  >(undefined);

  const employeeOptions = employeeData?.items ?? [];

  const { form, onSubmit } = useDepartmentFormDialog(editingDepartment, () =>
    setIsFormOpen(false),
  );

  const openCreateForm = () => {
    setEditingDepartment(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<Department>> = [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    { id: 'code', header: 'Code', cell: (row) => row.code },
    {
      id: 'head',
      header: 'Head',
      cell: (row) => findEmployeeName(employeeOptions, row.headEmployeeId),
    },
    {
      id: 'parent',
      header: 'Parent Dept',
      cell: (row) => findDepartmentName(departments, row.parentId),
    },
    { id: 'employees', header: 'Employees', cell: (row) => row.employeeCount },
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
            onClick={() => openEditForm(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${row.name}`}
            onClick={() => setDeletingDepartment(row)}
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
        title="Departments"
        description="Manage the department hierarchy, heads, and status."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" />
            New department
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={departments ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={departments?.length ?? 1}
        total={departments?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No departments yet"
        emptyDescription="Create your first department to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingDepartment ? 'Edit department' : 'New department'}
        form={form}
        onSubmit={onSubmit}
        successMessage={
          editingDepartment ? 'Department updated' : 'Department created'
        }
      >
        <DepartmentFormFields
          form={form}
          departments={departments ?? []}
          currentDepartmentId={editingDepartment?.id}
          employeeOptions={employeeOptions}
        />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingDepartment)}
        onOpenChange={(open) => !open && setDeletingDepartment(undefined)}
        title={`Delete ${deletingDepartment?.name ?? 'department'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingDepartment) {
            await deleteDepartment.mutateAsync(deletingDepartment.id);
          }
        }}
      />
    </div>
  );
}
