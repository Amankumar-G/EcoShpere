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
  useCreatePartner,
  useDeletePartner,
  useImportPartnersCsv,
  usePartners,
  useUpdatePartner,
} from '@/data/partners/partners.hooks';
import { PARTNER_TYPES, Partner } from '@/types/partner.interface';
import { RECORD_STATUSES } from '@/types/records.interface';
import { PartnerSchema, partnerSchema } from '@/lib/zod-schemas/partner.schema';

function toFormValues(partner?: Partner): PartnerSchema {
  return {
    name: partner?.name ?? '',
    type: (partner?.type as PartnerSchema['type']) ?? 'vendor',
    email: partner?.email ?? '',
    phone: partner?.phone ?? '',
    address: partner?.address ?? '',
    status: (partner?.status as PartnerSchema['status']) ?? 'active',
  };
}

export default function PartnersPage() {
  const { data: partners, isLoading } = usePartners();
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const deletePartner = useDeletePartner();
  const importPartners = useImportPartnersCsv();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Partner | undefined>(undefined);
  const [deleting, setDeleting] = React.useState<Partner | undefined>(
    undefined,
  );

  const form = useForm<PartnerSchema>({
    resolver: zodResolver(partnerSchema),
    values: toFormValues(editing),
  });

  const onSubmit = async (values: PartnerSchema) => {
    const payload = {
      name: values.name,
      type: values.type,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
      status: values.status,
    };
    if (editing) {
      await updatePartner.mutateAsync({ id: editing.id, payload });
    } else {
      await createPartner.mutateAsync(payload);
    }
  };

  const openCreate = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (partner: Partner) => {
    setEditing(partner);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<Partner>> = [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    { id: 'type', header: 'Type', cell: (row) => row.type },
    { id: 'email', header: 'Email', cell: (row) => row.email ?? '—' },
    { id: 'phone', header: 'Phone', cell: (row) => row.phone ?? '—' },
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
        title="Partners"
        description="Vendors and customers that activity is attributed to."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="size-4" />
              Import CSV
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New partner
            </Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={partners ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={partners?.length ?? 1}
        total={partners?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No partners yet"
        emptyDescription="Create your first partner or import a CSV."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit partner' : 'New partner'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Partner updated' : 'Partner created'}
      >
        <Field>
          <FieldLabel htmlFor="partner-name">Name</FieldLabel>
          <Input id="partner-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="partner-type">Type</FieldLabel>
          <NativeSelect id="partner-type" {...form.register('type')}>
            {PARTNER_TYPES.map((type) => (
              <NativeSelectOption key={type} value={type}>
                {type}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="partner-email">Email</FieldLabel>
          <Input id="partner-email" type="email" {...form.register('email')} />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="partner-phone">Phone</FieldLabel>
          <Input id="partner-phone" {...form.register('phone')} />
        </Field>
        <Field>
          <FieldLabel htmlFor="partner-address">Address</FieldLabel>
          <Input id="partner-address" {...form.register('address')} />
        </Field>
        <Field>
          <FieldLabel htmlFor="partner-status">Status</FieldLabel>
          <NativeSelect id="partner-status" {...form.register('status')}>
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
        title="Import partners"
        columnsHint="name, type, email, phone, address, status"
        onImport={(csv) => importPartners.mutateAsync(csv)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title={`Delete ${deleting?.name ?? 'partner'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deletePartner.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}
