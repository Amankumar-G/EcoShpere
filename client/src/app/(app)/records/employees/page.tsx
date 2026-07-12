'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import {
  DataTable,
  DataTableColumn,
  DataTableSort,
} from '@/components/shared/data-table';
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
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployee,
} from '@/data/employees/employees.hooks';
import { Employee, GENDERS } from '@/types/employee.interface';
import { Role } from '@/types/auth.interface';
import {
  EmployeeSchema,
  buildEmployeeSchema,
} from '@/lib/zod-schemas/employee.schema';

const NONE_VALUE = '__none__';
const PAGE_SIZE = 10;
const ASSIGNABLE_ROLES: Record<Role, Role[]> = {
  admin: ['admin', 'manager', 'employee'],
  manager: ['manager', 'employee'],
  employee: [],
};

function toDateInput(value?: string | null): string {
  return value ? value.slice(0, 10) : '';
}

function toEmployeeFormValues(employee?: Employee): EmployeeSchema {
  return {
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    password: '',
    role: employee?.role ?? 'employee',
    departmentId: employee?.departmentId
      ? String(employee.departmentId)
      : NONE_VALUE,
    gender: (employee?.gender as EmployeeSchema['gender']) ?? '',
    dob: toDateInput(employee?.dob),
    homeWorkDistance:
      employee?.homeWorkDistance != null
        ? String(employee.homeWorkDistance)
        : '',
  };
}

function EmployeeFormFields({
  form,
  isEditing,
  assignableRoles,
  departments,
}: {
  form: ReturnType<typeof useForm<EmployeeSchema>>;
  isEditing: boolean;
  assignableRoles: Role[];
  departments: Array<{ id: number; name: string }>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="employee-name">Name</FieldLabel>
        <Input id="employee-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="employee-email">Email</FieldLabel>
        <Input id="employee-email" type="email" {...register('email')} />
        <FieldError errors={[errors.email]} />
      </Field>
      {!isEditing && (
        <Field>
          <FieldLabel htmlFor="employee-password">Password</FieldLabel>
          <Input
            id="employee-password"
            type="password"
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      )}
      {assignableRoles.length > 0 && (
        <Field>
          <FieldLabel htmlFor="employee-role">Role</FieldLabel>
          <NativeSelect id="employee-role" {...register('role')}>
            {assignableRoles.map((role) => (
              <NativeSelectOption key={role} value={role}>
                {role}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      )}
      <Field>
        <FieldLabel htmlFor="employee-department">Department</FieldLabel>
        <NativeSelect id="employee-department" {...register('departmentId')}>
          <NativeSelectOption value={NONE_VALUE}>None</NativeSelectOption>
          {departments.map((department) => (
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
        <FieldLabel htmlFor="employee-gender">Gender</FieldLabel>
        <NativeSelect id="employee-gender" {...register('gender')}>
          <NativeSelectOption value="">Unspecified</NativeSelectOption>
          {GENDERS.map((gender) => (
            <NativeSelectOption key={gender} value={gender}>
              {gender}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="employee-dob">Date of birth</FieldLabel>
        <Input id="employee-dob" type="date" {...register('dob')} />
      </Field>
      <Field>
        <FieldLabel htmlFor="employee-distance">
          Home-work distance (km)
        </FieldLabel>
        <Input id="employee-distance" {...register('homeWorkDistance')} />
      </Field>
    </>
  );
}

function useEmployeeFormDialog(
  editingEmployee: Employee | undefined,
  onClose: () => void,
) {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const isEditing = Boolean(editingEmployee);

  const form = useForm<EmployeeSchema>({
    resolver: zodResolver(buildEmployeeSchema(isEditing)),
    values: toEmployeeFormValues(editingEmployee),
  });

  const onSubmit = async (values: EmployeeSchema) => {
    const departmentId =
      values.departmentId === NONE_VALUE ? null : Number(values.departmentId);
    const homeWorkDistance = values.homeWorkDistance
      ? Number(values.homeWorkDistance)
      : null;

    if (editingEmployee) {
      await updateEmployee.mutateAsync({
        id: editingEmployee.id,
        payload: {
          name: values.name,
          email: values.email,
          role: values.role,
          departmentId,
          gender: values.gender || null,
          dob: values.dob || null,
          homeWorkDistance,
        },
      });
    } else {
      await createEmployee.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        departmentId,
        gender: values.gender || null,
        dob: values.dob || null,
        homeWorkDistance,
      });
    }
    onClose();
  };

  return { form, onSubmit, isEditing };
}

export default function RecordsEmployeesPage() {
  const { data: currentUser } = useMe();
  const { data: departmentData } = useDepartments(true);
  const deleteEmployee = useDeleteEmployee();

  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<DataTableSort | undefined>(undefined);
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<
    Employee | undefined
  >(undefined);
  const [deletingEmployee, setDeletingEmployee] = React.useState<
    Employee | undefined
  >(undefined);

  const { data, isLoading } = useEmployees({
    page,
    pageSize: PAGE_SIZE,
    sort: sort?.columnId,
    order: sort?.direction,
    filter: filters.name,
  });

  const departments = departmentData ?? [];
  const assignableRoles = currentUser ? ASSIGNABLE_ROLES[currentUser.role] : [];
  // Employee creation (as opposed to editing) is admin-only.
  const canCreate = currentUser?.role === 'admin';

  const { form, onSubmit, isEditing } = useEmployeeFormDialog(
    editingEmployee,
    () => setIsFormOpen(false),
  );

  const openCreateForm = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<Employee>> = [
    {
      id: 'name',
      header: 'Name',
      cell: (row) => row.name,
      sortable: true,
      filterable: true,
      filterPlaceholder: 'Filter name',
    },
    { id: 'email', header: 'Email', cell: (row) => row.email },
    {
      id: 'role',
      header: 'Role',
      cell: (row) => <Badge variant="secondary">{row.role}</Badge>,
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
            onClick={() => openEditForm(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${row.name}`}
            onClick={() => setDeletingEmployee(row)}
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
        title="Employees"
        description="Manage employee records, departments, and roles."
        action={
          canCreate ? (
            <Button onClick={openCreateForm}>
              <Plus className="size-4" />
              New employee
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sort={sort}
        onSortChange={setSort}
        filters={filters}
        onFilterChange={(columnId, value) =>
          setFilters((current) => ({ ...current, [columnId]: value }))
        }
        emptyTitle="No employees yet"
        emptyDescription="Create your first employee to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingEmployee ? 'Edit employee' : 'New employee'}
        form={form}
        onSubmit={onSubmit}
        successMessage={
          editingEmployee ? 'Employee updated' : 'Employee created'
        }
      >
        <EmployeeFormFields
          form={form}
          isEditing={isEditing}
          assignableRoles={assignableRoles}
          departments={departments}
        />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingEmployee)}
        onOpenChange={(open) => !open && setDeletingEmployee(undefined)}
        title={`Delete ${deletingEmployee?.name ?? 'employee'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingEmployee) {
            await deleteEmployee.mutateAsync(deletingEmployee.id);
          }
        }}
      />
    </div>
  );
}
