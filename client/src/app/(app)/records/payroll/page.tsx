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
  useCreatePayrollContract,
  useDeletePayrollContract,
  usePayrollContracts,
  useUpdatePayrollContract,
} from '@/data/payroll/payroll.hooks';
import { useEmployeeOptions } from '@/data/employees/employees.hooks';
import {
  CONTRACT_TYPES,
  LEADERSHIP_LEVELS,
  PayrollContract,
} from '@/types/payroll.interface';
import { PayrollSchema, payrollSchema } from '@/lib/zod-schemas/payroll.schema';

function toDateInput(value?: string | null): string {
  return value ? value.slice(0, 10) : '';
}

function toFormValues(contract?: PayrollContract): PayrollSchema {
  return {
    employeeId: contract?.employeeId ? String(contract.employeeId) : '',
    jobPosition: contract?.jobPosition ?? '',
    contractType:
      (contract?.contractType as PayrollSchema['contractType']) ?? 'permanent',
    leadershipLevel:
      (contract?.leadershipLevel as PayrollSchema['leadershipLevel']) ?? '',
    country: contract?.country ?? '',
    wage: contract?.wage ?? '',
    startDate: toDateInput(contract?.startDate),
    endDate: toDateInput(contract?.endDate),
  };
}

export default function PayrollPage() {
  const { data: contracts, isLoading } = usePayrollContracts();
  const { data: employeeData } = useEmployeeOptions();
  const createContract = useCreatePayrollContract();
  const updateContract = useUpdatePayrollContract();
  const deleteContract = useDeletePayrollContract();

  const employees = employeeData?.items ?? [];

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PayrollContract | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = React.useState<PayrollContract | undefined>(
    undefined,
  );

  const form = useForm<PayrollSchema>({
    resolver: zodResolver(payrollSchema),
    values: toFormValues(editing),
  });

  const onSubmit = async (values: PayrollSchema) => {
    const payload = {
      employeeId: Number(values.employeeId),
      jobPosition: values.jobPosition,
      contractType: values.contractType,
      leadershipLevel: values.leadershipLevel || undefined,
      country: values.country || undefined,
      wage: Number(values.wage),
      startDate: values.startDate,
      endDate: values.endDate || undefined,
    };
    if (editing) {
      await updateContract.mutateAsync({ id: editing.id, payload });
    } else {
      await createContract.mutateAsync(payload);
    }
  };

  const openCreate = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (contract: PayrollContract) => {
    setEditing(contract);
    setIsFormOpen(true);
  };

  const employeeName = (id: number) =>
    employees.find((employee) => employee.id === id)?.name ?? `#${id}`;

  const columns: Array<DataTableColumn<PayrollContract>> = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => employeeName(row.employeeId),
    },
    {
      id: 'jobPosition',
      header: 'Job position',
      cell: (row) => row.jobPosition,
    },
    { id: 'contractType', header: 'Contract', cell: (row) => row.contractType },
    { id: 'wage', header: 'Wage', cell: (row) => row.wage },
    {
      id: 'startDate',
      header: 'Start',
      cell: (row) => toDateInput(row.startDate),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit contract"
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete contract"
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
        title="Payroll Contracts"
        description="Contract and wage data (admin-only) that feeds the pay-gap scoring formula."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New contract
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={contracts ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={contracts?.length ?? 1}
        total={contracts?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No payroll contracts yet"
        emptyDescription="Add your first contract."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit contract' : 'New contract'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Contract updated' : 'Contract created'}
      >
        <Field>
          <FieldLabel htmlFor="payroll-employee">Employee</FieldLabel>
          <NativeSelect id="payroll-employee" {...form.register('employeeId')}>
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
          <FieldLabel htmlFor="payroll-job">Job position</FieldLabel>
          <Input id="payroll-job" {...form.register('jobPosition')} />
          <FieldError errors={[form.formState.errors.jobPosition]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="payroll-contract-type">Contract type</FieldLabel>
          <NativeSelect
            id="payroll-contract-type"
            {...form.register('contractType')}
          >
            {CONTRACT_TYPES.map((type) => (
              <NativeSelectOption key={type} value={type}>
                {type}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="payroll-leadership">Leadership level</FieldLabel>
          <NativeSelect
            id="payroll-leadership"
            {...form.register('leadershipLevel')}
          >
            <NativeSelectOption value="">None</NativeSelectOption>
            {LEADERSHIP_LEVELS.map((level) => (
              <NativeSelectOption key={level} value={level}>
                {level}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="payroll-country">Country</FieldLabel>
          <Input id="payroll-country" {...form.register('country')} />
        </Field>
        <Field>
          <FieldLabel htmlFor="payroll-wage">Wage</FieldLabel>
          <Input
            id="payroll-wage"
            type="number"
            step="0.01"
            {...form.register('wage')}
          />
          <FieldError errors={[form.formState.errors.wage]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="payroll-start">Start date</FieldLabel>
          <Input
            id="payroll-start"
            type="date"
            {...form.register('startDate')}
          />
          <FieldError errors={[form.formState.errors.startDate]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="payroll-end">End date</FieldLabel>
          <Input id="payroll-end" type="date" {...form.register('endDate')} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete this contract?"
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteContract.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}
