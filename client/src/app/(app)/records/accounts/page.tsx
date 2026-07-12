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
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useImportAccountsCsv,
  useUpdateAccount,
} from '@/data/accounts/accounts.hooks';
import { ACCOUNT_TYPES, Account } from '@/types/account.interface';
import { RECORD_STATUSES } from '@/types/records.interface';
import { AccountSchema, accountSchema } from '@/lib/zod-schemas/account.schema';

function toFormValues(account?: Account): AccountSchema {
  return {
    code: account?.code ?? '',
    name: account?.name ?? '',
    type: (account?.type as AccountSchema['type']) ?? 'expense',
    status: (account?.status as AccountSchema['status']) ?? 'active',
  };
}

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const importAccounts = useImportAccountsCsv();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Account | undefined>(undefined);
  const [deleting, setDeleting] = React.useState<Account | undefined>(
    undefined,
  );

  const form = useForm<AccountSchema>({
    resolver: zodResolver(accountSchema),
    values: toFormValues(editing),
  });

  const onSubmit = async (values: AccountSchema) => {
    if (editing) {
      await updateAccount.mutateAsync({ id: editing.id, payload: values });
    } else {
      await createAccount.mutateAsync(values);
    }
  };

  const openCreate = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditing(account);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<Account>> = [
    { id: 'code', header: 'Code', cell: (row) => row.code },
    { id: 'name', header: 'Name', cell: (row) => row.name },
    { id: 'type', header: 'Type', cell: (row) => row.type },
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
            onClick={() => openEdit(row)}
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Chart-of-accounts entries that monetary assignation rules attach to."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="size-4" />
              Import CSV
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New account
            </Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={accounts ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={accounts?.length ?? 1}
        total={accounts?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No accounts yet"
        emptyDescription="Create your first account or import a CSV."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit account' : 'New account'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Account updated' : 'Account created'}
      >
        <Field>
          <FieldLabel htmlFor="account-code">Code</FieldLabel>
          <Input id="account-code" {...form.register('code')} />
          <FieldError errors={[form.formState.errors.code]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="account-name">Name</FieldLabel>
          <Input id="account-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="account-type">Type</FieldLabel>
          <NativeSelect id="account-type" {...form.register('type')}>
            {ACCOUNT_TYPES.map((type) => (
              <NativeSelectOption key={type} value={type}>
                {type}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="account-status">Status</FieldLabel>
          <NativeSelect id="account-status" {...form.register('status')}>
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
        title="Import accounts"
        columnsHint="code, name, type, status"
        onImport={(csv) => importAccounts.mutateAsync(csv)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title={`Delete ${deleting?.name ?? 'account'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteAccount.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}
