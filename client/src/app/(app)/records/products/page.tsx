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
  useCreateProduct,
  useDeleteProduct,
  useImportProductsCsv,
  useProducts,
  useUpdateProduct,
} from '@/data/products/products.hooks';
import { useAccounts } from '@/data/accounts/accounts.hooks';
import { Product } from '@/types/product.interface';
import { RECORD_STATUSES, UNITS_OF_MEASURE } from '@/types/records.interface';
import { ProductSchema, productSchema } from '@/lib/zod-schemas/product.schema';

const NONE_VALUE = '__none__';

function toFormValues(product?: Product): ProductSchema {
  return {
    name: product?.name ?? '',
    code: product?.code ?? '',
    uom: (product?.uom as ProductSchema['uom']) ?? 'unit',
    defaultAccountId: product?.defaultAccountId
      ? String(product.defaultAccountId)
      : NONE_VALUE,
    status: (product?.status as ProductSchema['status']) ?? 'active',
  };
}

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const { data: accounts } = useAccounts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const importProducts = useImportProductsCsv();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | undefined>(undefined);
  const [deleting, setDeleting] = React.useState<Product | undefined>(
    undefined,
  );

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    values: toFormValues(editing),
  });

  const onSubmit = async (values: ProductSchema) => {
    const payload = {
      name: values.name,
      code: values.code,
      uom: values.uom,
      defaultAccountId:
        values.defaultAccountId === NONE_VALUE
          ? null
          : Number(values.defaultAccountId),
      status: values.status,
    };
    if (editing) {
      await updateProduct.mutateAsync({ id: editing.id, payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
  };

  const openCreate = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setIsFormOpen(true);
  };

  const accountName = (id: number | null) =>
    id ? (accounts?.find((account) => account.id === id)?.name ?? '—') : '—';

  const columns: Array<DataTableColumn<Product>> = [
    { id: 'code', header: 'Code', cell: (row) => row.code },
    { id: 'name', header: 'Name', cell: (row) => row.name },
    { id: 'uom', header: 'UoM', cell: (row) => row.uom },
    {
      id: 'defaultAccount',
      header: 'Default account',
      cell: (row) => accountName(row.defaultAccountId),
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
        title="Products"
        description="Purchasable goods and services. The unit of measure must match physical emission factors."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="size-4" />
              Import CSV
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New product
            </Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={products ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={products?.length ?? 1}
        total={products?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No products yet"
        emptyDescription="Create your first product or import a CSV."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? 'Edit product' : 'New product'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editing ? 'Product updated' : 'Product created'}
      >
        <Field>
          <FieldLabel htmlFor="product-code">Code</FieldLabel>
          <Input id="product-code" {...form.register('code')} />
          <FieldError errors={[form.formState.errors.code]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="product-name">Name</FieldLabel>
          <Input id="product-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="product-uom">Unit of measure</FieldLabel>
          <NativeSelect id="product-uom" {...form.register('uom')}>
            {UNITS_OF_MEASURE.map((uom) => (
              <NativeSelectOption key={uom} value={uom}>
                {uom}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="product-account">Default account</FieldLabel>
          <NativeSelect
            id="product-account"
            {...form.register('defaultAccountId')}
          >
            <NativeSelectOption value={NONE_VALUE}>None</NativeSelectOption>
            {(accounts ?? []).map((account) => (
              <NativeSelectOption key={account.id} value={String(account.id)}>
                {account.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="product-status">Status</FieldLabel>
          <NativeSelect id="product-status" {...form.register('status')}>
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
        title="Import products"
        columnsHint="name, code, uom, status"
        onImport={(csv) => importProducts.mutateAsync(csv)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title={`Delete ${deleting?.name ?? 'product'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            await deleteProduct.mutateAsync(deleting.id);
          }
        }}
      />
    </div>
  );
}
