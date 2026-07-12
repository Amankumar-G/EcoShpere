'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  useCreateEmissionScope,
  useDeleteEmissionScope,
  useEmissionScopeTree,
  useUpdateEmissionScope,
} from '@/data/emission-scopes/emission-scopes.hooks';
import { EmissionScope } from '@/types/emission-scope.interface';
import {
  EmissionScopeSchema,
  emissionScopeSchema,
} from '@/lib/zod-schemas/emission-scope.schema';

const NONE_VALUE = '__none__';

function toEmissionScopeFormValues(scope?: EmissionScope): EmissionScopeSchema {
  return {
    name: scope?.name ?? '',
    code: scope?.code ?? '',
    parentId: scope?.parentId ? String(scope.parentId) : NONE_VALUE,
  };
}

function flattenScopes(scopes: EmissionScope[]): EmissionScope[] {
  return scopes.flatMap((scope) => [
    scope,
    ...flattenScopes(scope.children ?? []),
  ]);
}

function countDescendants(scope: EmissionScope): number {
  const children = scope.children ?? [];
  return children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0,
  );
}

function EmissionScopeFormFields({
  form,
  flatScopes,
  currentScopeId,
}: {
  form: ReturnType<typeof useForm<EmissionScopeSchema>>;
  flatScopes: EmissionScope[];
  currentScopeId?: number;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="emission-scope-name">Name</FieldLabel>
        <Input id="emission-scope-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="emission-scope-code">Code</FieldLabel>
        <Input id="emission-scope-code" {...register('code')} />
        <FieldError errors={[errors.code]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="emission-scope-parent">Parent scope</FieldLabel>
        <NativeSelect id="emission-scope-parent" {...register('parentId')}>
          <NativeSelectOption value={NONE_VALUE}>None</NativeSelectOption>
          {flatScopes
            .filter((scope) => scope.id !== currentScopeId)
            .map((scope) => (
              <NativeSelectOption key={scope.id} value={String(scope.id)}>
                {scope.name}
              </NativeSelectOption>
            ))}
        </NativeSelect>
      </Field>
    </>
  );
}

function useEmissionScopeFormDialog(
  editingScope: EmissionScope | undefined,
  onClose: () => void,
) {
  const createEmissionScope = useCreateEmissionScope();
  const updateEmissionScope = useUpdateEmissionScope();

  const form = useForm<EmissionScopeSchema>({
    resolver: zodResolver(emissionScopeSchema),
    values: toEmissionScopeFormValues(editingScope),
  });

  const onSubmit = async (values: EmissionScopeSchema) => {
    const payload = {
      name: values.name,
      code: values.code,
      parentId: values.parentId === NONE_VALUE ? null : Number(values.parentId),
    };
    if (editingScope) {
      await updateEmissionScope.mutateAsync({
        id: editingScope.id,
        payload,
      });
    } else {
      await createEmissionScope.mutateAsync(payload);
    }
    onClose();
  };

  return { form, onSubmit };
}

function EmissionScopeTreeRow({
  scope,
  depth,
  onEdit,
  onDelete,
}: {
  scope: EmissionScope;
  depth: number;
  onEdit: (scope: EmissionScope) => void;
  onDelete: (scope: EmissionScope) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = (scope.children?.length ?? 0) > 0;
  const factorCount = countDescendants(scope);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="group flex items-center gap-2 rounded-md border-l border-border py-2 pr-2"
        style={{ paddingLeft: `${depth * 1 + 0.5}rem` }}
      >
        <CollapsibleTrigger
          className="flex size-6 shrink-0 items-center justify-center rounded hover:bg-muted disabled:opacity-30"
          disabled={!hasChildren}
          aria-label={
            hasChildren
              ? isOpen
                ? `Collapse ${scope.name}`
                : `Expand ${scope.name}`
              : undefined
          }
        >
          <ChevronRight
            className={cn(
              'size-4 transition-transform',
              hasChildren && isOpen && 'rotate-90',
              !hasChildren && 'opacity-0',
            )}
          />
        </CollapsibleTrigger>
        <span className="font-medium">{scope.name}</span>
        <Badge variant="outline">{scope.code}</Badge>
        {hasChildren && (
          <Badge variant="secondary">{factorCount} nested scopes</Badge>
        )}
        <div className="ml-auto flex items-center gap-1 opacity-0 focus-within:opacity-100 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${scope.name}`}
            onClick={() => onEdit(scope)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${scope.name}`}
            onClick={() => onDelete(scope)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {hasChildren && (
        <CollapsibleContent>
          {scope.children?.map((child) => (
            <EmissionScopeTreeRow
              key={child.id}
              scope={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export default function SettingsEmissionScopesPage() {
  const { data: scopeTree, isLoading } = useEmissionScopeTree();
  const deleteEmissionScope = useDeleteEmissionScope();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingScope, setEditingScope] = React.useState<
    EmissionScope | undefined
  >(undefined);
  const [deletingScope, setDeletingScope] = React.useState<
    EmissionScope | undefined
  >(undefined);

  const flatScopes = React.useMemo(
    () => flattenScopes(scopeTree ?? []),
    [scopeTree],
  );

  const { form, onSubmit } = useEmissionScopeFormDialog(editingScope, () =>
    setIsFormOpen(false),
  );

  const openCreateForm = () => {
    setEditingScope(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (scope: EmissionScope) => {
    setEditingScope(scope);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Emission Scopes"
        description="Manage the emission scope hierarchy (Scope 1, 2, 3 and Scope-3 categories)."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" />
            New scope
          </Button>
        }
      />
      <div className="rounded-xl border p-2">
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (scopeTree?.length ?? 0) === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No emission scopes yet.
          </p>
        ) : (
          scopeTree?.map((scope) => (
            <EmissionScopeTreeRow
              key={scope.id}
              scope={scope}
              depth={0}
              onEdit={openEditForm}
              onDelete={setDeletingScope}
            />
          ))
        )}
      </div>
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingScope ? 'Edit emission scope' : 'New emission scope'}
        form={form}
        onSubmit={onSubmit}
        successMessage={
          editingScope ? 'Emission scope updated' : 'Emission scope created'
        }
      >
        <EmissionScopeFormFields
          form={form}
          flatScopes={flatScopes}
          currentScopeId={editingScope?.id}
        />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingScope)}
        onOpenChange={(open) => !open && setDeletingScope(undefined)}
        title={`Delete ${deletingScope?.name ?? 'scope'}?`}
        description="This action cannot be undone. Scopes with child scopes or linked emission factors cannot be deleted."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingScope) {
            await deleteEmissionScope.mutateAsync(deletingScope.id);
          }
        }}
      />
    </div>
  );
}
