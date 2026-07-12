'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';

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
  useCreateInvoice,
  useDeleteInvoice,
  useInvoices,
  usePostInvoice,
  useUpdateInvoice,
} from '@/data/invoices/invoices.hooks';
import { usePartners } from '@/data/partners/partners.hooks';
import { useAccounts } from '@/data/accounts/accounts.hooks';
import { useProducts } from '@/data/products/products.hooks';
import { useMe } from '@/data/auth/auth.hooks';
import { Invoice } from '@/types/invoice.interface';
import { UNITS_OF_MEASURE } from '@/types/records.interface';
import { InvoiceSchema, invoiceSchema } from '@/lib/zod-schemas/invoice.schema';

function toDateInput(value?: string): string {
  return value ? value.slice(0, 10) : '';
}

function emptyLine() {
  return {
    productId: '',
    accountId: '',
    description: '',
    quantity: '',
    uom: 'unit' as const,
    unitPrice: '',
  };
}

function toFormValues(invoice?: Invoice): InvoiceSchema {
  if (!invoice) {
    return {
      partnerId: '',
      date: '',
      currency: 'EUR',
      lines: [emptyLine()],
    };
  }
  return {
    partnerId: String(invoice.partnerId),
    date: toDateInput(invoice.date),
    currency: invoice.currency,
    lines: invoice.lines.map((line) => ({
      productId: line.productId ? String(line.productId) : '',
      accountId: String(line.accountId),
      description: line.description ?? '',
      quantity: line.quantity,
      uom: line.uom as (typeof UNITS_OF_MEASURE)[number],
      unitPrice: line.unitPrice,
    })),
  };
}

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: partners } = usePartners();
  const { data: accounts } = useAccounts();
  const { data: products } = useProducts();
  const { data: user } = useMe();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const postInvoice = usePostInvoice();
  const deleteInvoice = useDeleteInvoice();

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Invoice | undefined>(undefined);
  const [deleting, setDeleting] = React.useState<Invoice | undefined>(
    undefined,
  );

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
    values: toFormValues(editing),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });
  const watchedLines = form.watch('lines');
  const runningTotal = (watchedLines ?? []).reduce(
    (sum, line) =>
      sum + Number(line.quantity || 0) * Number(line.unitPrice || 0),
    0,
  );

  const onSubmit = async (values: InvoiceSchema) => {
    const payload = {
      partnerId: Number(values.partnerId),
      date: values.date,
      currency: values.currency,
      lines: values.lines.map((line) => ({
        productId: line.productId ? Number(line.productId) : undefined,
        accountId: Number(line.accountId),
        description: line.description || undefined,
        quantity: Number(line.quantity),
        uom: line.uom,
        unitPrice: Number(line.unitPrice),
      })),
    };
    if (editing) {
      await updateInvoice.mutateAsync({ id: editing.id, payload });
    } else {
      await createInvoice.mutateAsync(payload);
    }
  };

  const partnerName = (id: number) =>
    partners?.find((partner) => partner.id === id)?.name ?? `#${id}`;

  const columns: Array<DataTableColumn<Invoice>> = [
    {
      id: 'partner',
      header: 'Partner',
      cell: (row) => partnerName(row.partnerId),
    },
    { id: 'date', header: 'Date', cell: (row) => toDateInput(row.date) },
    {
      id: 'total',
      header: 'Total',
      cell: (row) => `${row.totalAmount} ${row.currency}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'posted' ? 'default' : 'outline'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'draft' && canManage && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Post"
                onClick={() => postInvoice.mutate(row.id)}
              >
                <Upload className="size-4" />
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
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Purchase and vendor bills. Posting an invoice triggers the Phase 2 accounting emission path."
        action={
          canManage ? (
            <Button
              onClick={() => {
                setEditing(undefined);
                setIsFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              New invoice
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={invoices ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={invoices?.length ?? 1}
        total={invoices?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit invoice' : 'New invoice'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Invoice updated' : 'Invoice created'}
        submitLabel="Save invoice"
      >
        <Field>
          <FieldLabel htmlFor="invoice-partner">Partner</FieldLabel>
          <NativeSelect id="invoice-partner" {...form.register('partnerId')}>
            <NativeSelectOption value="">Select partner…</NativeSelectOption>
            {(partners ?? []).map((partner) => (
              <NativeSelectOption key={partner.id} value={String(partner.id)}>
                {partner.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[form.formState.errors.partnerId]} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="invoice-date">Date</FieldLabel>
            <Input id="invoice-date" type="date" {...form.register('date')} />
            <FieldError errors={[form.formState.errors.date]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="invoice-currency">Currency</FieldLabel>
            <Input id="invoice-currency" {...form.register('currency')} />
          </Field>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Lines</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptyLine())}
            >
              <Plus className="size-4" />
              Add line
            </Button>
          </div>
          {form.formState.errors.lines?.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.lines.message}
            </p>
          )}
          {fields.map((field, index) => {
            const line = watchedLines?.[index];
            const amount =
              Number(line?.quantity || 0) * Number(line?.unitPrice || 0);
            return (
              <div
                key={field.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Field>
                    <FieldLabel htmlFor={`line-${index}-account`}>
                      Account
                    </FieldLabel>
                    <NativeSelect
                      id={`line-${index}-account`}
                      {...form.register(`lines.${index}.accountId`)}
                    >
                      <NativeSelectOption value="">Select…</NativeSelectOption>
                      {(accounts ?? []).map((account) => (
                        <NativeSelectOption
                          key={account.id}
                          value={String(account.id)}
                        >
                          {account.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError
                      errors={[form.formState.errors.lines?.[index]?.accountId]}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`line-${index}-product`}>
                      Product
                    </FieldLabel>
                    <NativeSelect
                      id={`line-${index}-product`}
                      {...form.register(`lines.${index}.productId`)}
                    >
                      <NativeSelectOption value="">None</NativeSelectOption>
                      {(products ?? []).map((product) => (
                        <NativeSelectOption
                          key={product.id}
                          value={String(product.id)}
                        >
                          {product.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor={`line-${index}-description`}>
                    Description
                  </FieldLabel>
                  <Input
                    id={`line-${index}-description`}
                    {...form.register(`lines.${index}.description`)}
                  />
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  <Field>
                    <FieldLabel htmlFor={`line-${index}-quantity`}>
                      Quantity
                    </FieldLabel>
                    <Input
                      id={`line-${index}-quantity`}
                      type="number"
                      step="0.0001"
                      {...form.register(`lines.${index}.quantity`)}
                    />
                    <FieldError
                      errors={[form.formState.errors.lines?.[index]?.quantity]}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`line-${index}-uom`}>UoM</FieldLabel>
                    <NativeSelect
                      id={`line-${index}-uom`}
                      {...form.register(`lines.${index}.uom`)}
                    >
                      {UNITS_OF_MEASURE.map((uom) => (
                        <NativeSelectOption key={uom} value={uom}>
                          {uom}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`line-${index}-unit-price`}>
                      Unit price
                    </FieldLabel>
                    <Input
                      id={`line-${index}-unit-price`}
                      type="number"
                      step="0.0001"
                      {...form.register(`lines.${index}.unitPrice`)}
                    />
                    <FieldError
                      errors={[form.formState.errors.lines?.[index]?.unitPrice]}
                    />
                  </Field>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Line amount: {amount.toFixed(2)}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex justify-end text-sm font-medium">
            Total: {runningTotal.toFixed(2)} {form.watch('currency')}
          </div>
        </div>
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete this invoice?"
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteInvoice.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}
