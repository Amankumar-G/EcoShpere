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
import { Switch } from '@/components/ui/switch';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  useCreateAssignationRule,
  useDeleteAssignationRule,
  useAssignationRules,
  useUpdateAssignationRule,
} from '@/data/assignation-rules/assignation-rules.hooks';
import { useEmissionFactors } from '@/data/emission-factors/emission-factors.hooks';
import { AssignationRule } from '@/types/assignation-rule.interface';
import {
  AssignationRuleSchema,
  assignationRuleSchema,
} from '@/lib/zod-schemas/assignation-rule.schema';

function toFormValues(rule?: AssignationRule): AssignationRuleSchema {
  return {
    emissionFactorId: rule?.emissionFactorId
      ? String(rule.emissionFactorId)
      : '',
    productId: rule?.productId ? String(rule.productId) : undefined,
    partnerId: rule?.partnerId ? String(rule.partnerId) : undefined,
    accountId: rule?.accountId ? String(rule.accountId) : undefined,
    applicationPeriodStart: rule?.applicationPeriodStart
      ? rule.applicationPeriodStart.slice(0, 10)
      : '',
    applicationPeriodEnd: rule?.applicationPeriodEnd
      ? rule.applicationPeriodEnd.slice(0, 10)
      : '',
    replaceExisting: rule?.replaceExisting ?? false,
  };
}

function formatPeriod(rule: AssignationRule): string {
  if (!rule.applicationPeriodStart && !rule.applicationPeriodEnd) {
    return 'Always';
  }
  const start = rule.applicationPeriodStart
    ? rule.applicationPeriodStart.slice(0, 10)
    : '…';
  const end = rule.applicationPeriodEnd
    ? rule.applicationPeriodEnd.slice(0, 10)
    : '…';
  return `${start} → ${end}`;
}

function AssignationRuleFormFields({
  form,
  factorOptions,
}: {
  form: ReturnType<typeof useForm<AssignationRuleSchema>>;
  factorOptions: Array<{ id: number; name: string }>;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="rule-emission-factor">Emission factor</FieldLabel>
        <NativeSelect
          id="rule-emission-factor"
          {...register('emissionFactorId')}
        >
          <NativeSelectOption value="">Select a factor</NativeSelectOption>
          {factorOptions.map((factor) => (
            <NativeSelectOption key={factor.id} value={String(factor.id)}>
              {factor.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[errors.emissionFactorId]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="rule-product-id">Product ID (optional)</FieldLabel>
        <Input id="rule-product-id" type="number" {...register('productId')} />
        <FieldError errors={[errors.productId]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="rule-partner-id">Partner ID (optional)</FieldLabel>
        <Input id="rule-partner-id" type="number" {...register('partnerId')} />
        <FieldError errors={[errors.partnerId]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="rule-account-id">Account ID (optional)</FieldLabel>
        <Input id="rule-account-id" type="number" {...register('accountId')} />
        <FieldError errors={[errors.accountId]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="rule-period-start">
          Application period start (optional)
        </FieldLabel>
        <Input
          id="rule-period-start"
          type="date"
          {...register('applicationPeriodStart')}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="rule-period-end">
          Application period end (optional)
        </FieldLabel>
        <Input
          id="rule-period-end"
          type="date"
          {...register('applicationPeriodEnd')}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="rule-replace-existing">
          Replace existing assignment
        </FieldLabel>
        <Switch
          id="rule-replace-existing"
          checked={watch('replaceExisting')}
          onCheckedChange={(checked) =>
            setValue('replaceExisting', checked, { shouldValidate: true })
          }
        />
      </Field>
    </>
  );
}

function useAssignationRuleFormDialog(
  editingRule: AssignationRule | undefined,
  onClose: () => void,
) {
  const createRule = useCreateAssignationRule();
  const updateRule = useUpdateAssignationRule();

  const form = useForm<AssignationRuleSchema>({
    resolver: zodResolver(assignationRuleSchema),
    values: toFormValues(editingRule),
  });

  const onSubmit = async (values: AssignationRuleSchema) => {
    const payload = {
      emissionFactorId: Number(values.emissionFactorId),
      productId: values.productId ? Number(values.productId) : undefined,
      partnerId: values.partnerId ? Number(values.partnerId) : undefined,
      accountId: values.accountId ? Number(values.accountId) : undefined,
      applicationPeriodStart: values.applicationPeriodStart || undefined,
      applicationPeriodEnd: values.applicationPeriodEnd || undefined,
      replaceExisting: values.replaceExisting,
    };
    if (editingRule) {
      await updateRule.mutateAsync({ id: editingRule.id, payload });
    } else {
      await createRule.mutateAsync(payload);
    }
    onClose();
  };

  return { form, onSubmit };
}

export default function AssignationRulesPage() {
  const { data: rules, isLoading } = useAssignationRules();
  const { data: emissionFactors } = useEmissionFactors();
  const deleteRule = useDeleteAssignationRule();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<
    AssignationRule | undefined
  >(undefined);
  const [deletingRule, setDeletingRule] = React.useState<
    AssignationRule | undefined
  >(undefined);

  const { form, onSubmit } = useAssignationRuleFormDialog(editingRule, () =>
    setIsFormOpen(false),
  );

  const factorName = (id: number) =>
    emissionFactors?.find((factor) => factor.id === id)?.name ?? `#${id}`;

  const openCreateForm = () => {
    setEditingRule(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (rule: AssignationRule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const columns: Array<DataTableColumn<AssignationRule>> = [
    {
      id: 'emissionFactor',
      header: 'Emission Factor',
      cell: (row) => factorName(row.emissionFactorId),
    },
    {
      id: 'product',
      header: 'Product',
      cell: (row) => row.productId ?? '—',
    },
    {
      id: 'partner',
      header: 'Partner',
      cell: (row) => row.partnerId ?? '—',
    },
    {
      id: 'account',
      header: 'Account',
      cell: (row) => row.accountId ?? '—',
    },
    {
      id: 'period',
      header: 'Application Period',
      cell: (row) => formatPeriod(row),
    },
    {
      id: 'replaceExisting',
      header: 'Replace Existing',
      cell: (row) => (
        <Badge variant={row.replaceExisting ? 'default' : 'secondary'}>
          {row.replaceExisting ? 'Yes' : 'No'}
        </Badge>
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
            aria-label={`Edit rule ${row.id}`}
            onClick={() => openEditForm(row)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete rule ${row.id}`}
            onClick={() => setDeletingRule(row)}
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
        title="Assignation Rules"
        description="Rules to automatically assign emission factors to products, partners, or accounts."
        action={
          <Button onClick={openCreateForm}>
            <Plus className="size-4" />
            New rule
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={rules ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={rules?.length ?? 1}
        total={rules?.length ?? 0}
        onPageChange={() => undefined}
        emptyTitle="No assignation rules yet"
        emptyDescription="Create your first rule to get started."
      />
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingRule ? 'Edit rule' : 'New rule'}
        form={form}
        onSubmit={onSubmit}
        successMessage={editingRule ? 'Rule updated' : 'Rule created'}
      >
        <AssignationRuleFormFields
          form={form}
          factorOptions={emissionFactors ?? []}
        />
      </FormDialog>
      <ConfirmDialog
        open={Boolean(deletingRule)}
        onOpenChange={(open) => !open && setDeletingRule(undefined)}
        title={`Delete rule ${deletingRule?.id ?? ''}?`}
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingRule) {
            await deleteRule.mutateAsync(deletingRule.id);
          }
        }}
      />
    </div>
  );
}
