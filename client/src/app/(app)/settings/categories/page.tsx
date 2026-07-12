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
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/data/categories/categories.hooks';
import { Category, CategoryType } from '@/types/category.interface';
import {
  CategorySchema,
  categorySchema,
} from '@/lib/zod-schemas/category.schema';

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  csr_activity: 'CSR Activity',
  challenge: 'Challenge',
};

function toCategoryFormValues(category?: Category): CategorySchema {
  return {
    name: category?.name ?? '',
    type: category?.type ?? 'csr_activity',
  };
}

function CategoryFormFields({
  form,
}: {
  form: ReturnType<typeof useForm<CategorySchema>>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="category-name">Name</FieldLabel>
        <Input id="category-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="category-type">Type</FieldLabel>
        <NativeSelect id="category-type" {...register('type')}>
          {Object.entries(CATEGORY_TYPE_LABELS).map(([value, label]) => (
            <NativeSelectOption key={value} value={value}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[errors.type]} />
      </Field>
    </>
  );
}

function useCategoryFormDialog(
  editingCategory: Category | undefined,
  onClose: () => void,
) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    values: toCategoryFormValues(editingCategory),
  });

  const onSubmit = async (values: CategorySchema) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        payload: values,
      });
    } else {
      await createCategory.mutateAsync(values);
    }
    onClose();
  };

  return { form, onSubmit };
}

export default function SettingsCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<
    Category | undefined
  >(undefined);
  const [deletingCategory, setDeletingCategory] = React.useState<
    Category | undefined
  >(undefined);

  const { form, onSubmit } = useCategoryFormDialog(editingCategory, () =>
    setIsFormOpen(false),
  );

  const openCreateForm = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<Category>> = [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => (
        <Badge variant="secondary">{CATEGORY_TYPE_LABELS[row.type]}</Badge>
      ),
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
            onClick={() => setDeletingCategory(row)}
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
        title="Categories"
        description="Manage CSR activity and challenge categories."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" />
            New category
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={categories ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={categories?.length ?? 1}
        total={categories?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No categories yet"
        emptyDescription="Create your first category to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingCategory ? 'Edit category' : 'New category'}
        form={form}
        onSubmit={onSubmit}
        successMessage={
          editingCategory ? 'Category updated' : 'Category created'
        }
      >
        <CategoryFormFields form={form} />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(undefined)}
        title={`Delete ${deletingCategory?.name ?? 'category'}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingCategory) {
            await deleteCategory.mutateAsync(deletingCategory.id);
          }
        }}
      />
    </div>
  );
}
