'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Check, Pencil, Plus, Send, Trash2, Upload, X } from 'lucide-react';

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
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useTransitionExpense,
  useUpdateExpense,
} from '@/data/expenses/expenses.hooks';
import { useAccounts } from '@/data/accounts/accounts.hooks';
import { useProducts } from '@/data/products/products.hooks';
import { useEmployeeOptions } from '@/data/employees/employees.hooks';
import { useMe } from '@/data/auth/auth.hooks';
import { ExpenseRecord } from '@/types/expense.interface';
import { UNITS_OF_MEASURE } from '@/types/records.interface';
import { ExpenseSchema, expenseSchema } from '@/lib/zod-schemas/expense.schema';

const NONE_VALUE = '';

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  submitted: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  posted: 'default',
};

function toDateInput(value?: string): string {
  return value ? value.slice(0, 10) : '';
}

function toFormValues(expense?: ExpenseRecord): ExpenseSchema {
  return {
    employeeId: expense?.employeeId ? String(expense.employeeId) : '',
    date: toDateInput(expense?.date),
    accountId: expense?.accountId ? String(expense.accountId) : NONE_VALUE,
    productId: expense?.productId ? String(expense.productId) : NONE_VALUE,
    description: expense?.description ?? '',
    quantity: expense?.quantity ?? '',
    uom: (expense?.uom as ExpenseSchema['uom']) ?? '',
    amount: expense?.amount ?? '',
  };
}

export default function ExpensesPage() {
  const { data: expenses, isLoading } = useExpenses();
  const { data: accounts } = useAccounts();
  const { data: products } = useProducts();
  const { data: employeeData } = useEmployeeOptions();
  const { data: user } = useMe();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const transition = useTransitionExpense();

  const employees = employeeData?.items ?? [];
  const canApprove = user?.role === 'admin' || user?.role === 'manager';

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ExpenseRecord | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = React.useState<ExpenseRecord | undefined>(
    undefined,
  );

  const form = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    values: toFormValues(editing),
  });

  const onSubmit = async (values: ExpenseSchema) => {
    const payload = {
      employeeId: Number(values.employeeId),
      date: values.date,
      accountId: values.accountId ? Number(values.accountId) : undefined,
      productId: values.productId ? Number(values.productId) : undefined,
      description: values.description || undefined,
      quantity: values.quantity ? Number(values.quantity) : undefined,
      uom: values.uom || undefined,
      amount: Number(values.amount),
    };
    if (editing) {
      await updateExpense.mutateAsync({ id: editing.id, payload });
    } else {
      await createExpense.mutateAsync(payload);
    }
  };

  const employeeName = (id: number) =>
    employees.find((employee) => employee.id === id)?.name ?? `#${id}`;

  const run = (id: number, action: 'submit' | 'approve' | 'reject' | 'post') =>
    transition.mutate({ id, action });

  const columns: Array<DataTableColumn<ExpenseRecord>> = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => employeeName(row.employeeId),
    },
    { id: 'date', header: 'Date', cell: (row) => toDateInput(row.date) },
    {
      id: 'description',
      header: 'Description',
      cell: (row) => row.description ?? '—',
    },
    { id: 'amount', header: 'Amount', cell: (row) => row.amount },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={statusVariant[row.status] ?? 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'draft' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Submit"
                onClick={() => run(row.id, 'submit')}
              >
                <Send className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit"
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
                aria-label="Delete"
                onClick={() => setDeleting(row)}
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
          {row.status === 'submitted' && canApprove && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Approve"
                onClick={() => run(row.id, 'approve')}
              >
                <Check className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reject"
                onClick={() => run(row.id, 'reject')}
              >
                <X className="size-4" />
              </Button>
            </>
          )}
          {row.status === 'approved' && canApprove && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Post"
              onClick={() => run(row.id, 'post')}
            >
              <Upload className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenses"
        description="Employee expenses with submit → approve → post workflow. Posting feeds carbon accounting."
        action={
          <Button
            onClick={() => {
              setEditing(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New expense
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={expenses ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={expenses?.length ?? 1}
        total={expenses?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No expenses yet"
        emptyDescription="Submit your first expense."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit expense' : 'New expense'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Expense updated' : 'Expense created'}
      >
        <Field>
          <FieldLabel htmlFor="expense-employee">Employee</FieldLabel>
          <NativeSelect id="expense-employee" {...form.register('employeeId')}>
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
          <FieldLabel htmlFor="expense-date">Date</FieldLabel>
          <Input id="expense-date" type="date" {...form.register('date')} />
          <FieldError errors={[form.formState.errors.date]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-account">Account</FieldLabel>
          <NativeSelect id="expense-account" {...form.register('accountId')}>
            <NativeSelectOption value={NONE_VALUE}>None</NativeSelectOption>
            {(accounts ?? []).map((account) => (
              <NativeSelectOption key={account.id} value={String(account.id)}>
                {account.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-product">Product</FieldLabel>
          <NativeSelect id="expense-product" {...form.register('productId')}>
            <NativeSelectOption value={NONE_VALUE}>None</NativeSelectOption>
            {(products ?? []).map((product) => (
              <NativeSelectOption key={product.id} value={String(product.id)}>
                {product.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-description">Description</FieldLabel>
          <Input id="expense-description" {...form.register('description')} />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-quantity">Quantity</FieldLabel>
          <Input
            id="expense-quantity"
            type="number"
            step="0.0001"
            {...form.register('quantity')}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-uom">Unit of measure</FieldLabel>
          <NativeSelect id="expense-uom" {...form.register('uom')}>
            <NativeSelectOption value="">None</NativeSelectOption>
            {UNITS_OF_MEASURE.map((uom) => (
              <NativeSelectOption key={uom} value={uom}>
                {uom}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-amount">Amount</FieldLabel>
          <Input
            id="expense-amount"
            type="number"
            step="0.01"
            {...form.register('amount')}
          />
          <FieldError errors={[form.formState.errors.amount]} />
        </Field>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete this expense?"
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteExpense.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}
