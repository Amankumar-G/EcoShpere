'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormDialog } from '@/components/shared/form-dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@/components/ui/combobox';
import { useEmissionFactors } from '@/data/emission-factors/emission-factors.hooks';
import { useEmissionScopeTree } from '@/data/emission-scopes/emission-scopes.hooks';
import { useDepartments } from '@/data/departments/departments.hooks';
import { useCreateEmittedEmission } from '@/data/emitted-emissions/emitted-emissions.hooks';
import { useBusinessTravels } from '@/data/business-travel/business-travel.hooks';
import { buildScopePathMap } from '@/lib/emission-scope-path';
import {
  EmittedEmissionSchema,
  emittedEmissionSchema,
} from '@/lib/zod-schemas/emitted-emission.schema';

type FactorOption = { value: number; label: string };
type FactorGroup = { value: string; items: FactorOption[] };
type BusinessTravelOption = { value: number; label: string };

function useGroupedFactorOptions() {
  const { data: factors } = useEmissionFactors();
  const { data: scopeTree } = useEmissionScopeTree();

  return React.useMemo(() => {
    const scopePaths = buildScopePathMap(scopeTree ?? []);
    const groups = new Map<string, FactorOption[]>();

    (factors ?? []).forEach((factor) => {
      const groupLabel = scopePaths[factor.scopeId] ?? factor.scope.name;
      const options = groups.get(groupLabel) ?? [];
      options.push({ value: factor.id, label: factor.name });
      groups.set(groupLabel, options);
    });

    const factorGroups: FactorGroup[] = Array.from(groups.entries()).map(
      ([value, items]) => ({ value, items }),
    );

    return { factors: factors ?? [], factorGroups };
  }, [factors, scopeTree]);
}

function FactorPicker({
  value,
  onChange,
  factorGroups,
  error,
}: {
  value: string;
  onChange: (factorId: string) => void;
  factorGroups: FactorGroup[];
  error?: string;
}) {
  const selected = React.useMemo(() => {
    for (const group of factorGroups) {
      const match = group.items.find(
        (option) => String(option.value) === value,
      );
      if (match) return match;
    }
    return null;
  }, [factorGroups, value]);

  return (
    <Field>
      <FieldLabel htmlFor="emission-factor">Emission factor</FieldLabel>
      <Combobox<FactorOption>
        items={factorGroups}
        value={selected}
        onValueChange={(option) => onChange(option ? String(option.value) : '')}
      >
        <ComboboxInput id="emission-factor" placeholder="Select a factor" />
        <ComboboxContent>
          <ComboboxEmpty>No factors found.</ComboboxEmpty>
          <ComboboxList>
            {factorGroups.map((group) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(item: FactorOption) => (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError errors={[error ? { message: error } : undefined]} />
    </Field>
  );
}

function BusinessTravelPicker({
  value,
  onChange,
  options,
}: {
  value: string | undefined;
  onChange: (id: string) => void;
  options: BusinessTravelOption[];
}) {
  const selected = React.useMemo(
    () => options.find((option) => String(option.value) === value) ?? null,
    [options, value],
  );

  return (
    <Field>
      <FieldLabel htmlFor="emission-business-travel">
        Link to Business Travel record (optional)
      </FieldLabel>
      <Combobox<BusinessTravelOption>
        items={options}
        value={selected}
        onValueChange={(option) => onChange(option ? String(option.value) : '')}
      >
        <ComboboxInput
          id="emission-business-travel"
          placeholder="Select a business travel record"
        />
        <ComboboxContent>
          <ComboboxEmpty>No business travel records found.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxCollection>
              {(item: BusinessTravelOption) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxCollection>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

function ManualEntryFormFields({
  form,
  factorGroups,
  unitOfMeasure,
  departments,
  businessTravelOptions,
}: {
  form: ReturnType<typeof useForm<EmittedEmissionSchema>>;
  factorGroups: FactorGroup[];
  unitOfMeasure?: string;
  departments: Array<{ id: number; name: string }>;
  businessTravelOptions: BusinessTravelOption[];
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <>
      <Field>
        <FieldLabel htmlFor="emission-name">Name</FieldLabel>
        <Input id="emission-name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>
      <FactorPicker
        value={watch('emissionFactorId')}
        onChange={(factorId) =>
          setValue('emissionFactorId', factorId, { shouldValidate: true })
        }
        factorGroups={factorGroups}
        error={errors.emissionFactorId?.message}
      />
      <Field>
        <FieldLabel htmlFor="emission-quantity">Quantity</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="emission-quantity"
            type="number"
            step="any"
            {...register('quantity')}
          />
          {unitOfMeasure && (
            <InputGroupAddon align="inline-end">
              <InputGroupText>{unitOfMeasure}</InputGroupText>
            </InputGroupAddon>
          )}
        </InputGroup>
        <FieldError errors={[errors.quantity]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="emission-date">Date</FieldLabel>
        <Input id="emission-date" type="date" {...register('date')} />
        <FieldError errors={[errors.date]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="emission-department">Department</FieldLabel>
        <NativeSelect id="emission-department" {...register('departmentId')}>
          <NativeSelectOption value="">Select a department</NativeSelectOption>
          {departments.map((department) => (
            <NativeSelectOption
              key={department.id}
              value={String(department.id)}
            >
              {department.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[errors.departmentId]} />
      </Field>
      <Field>
        <FieldLabel htmlFor="emission-evidence-url">
          Evidence link (optional)
        </FieldLabel>
        <Input
          id="emission-evidence-url"
          type="url"
          placeholder="https://…"
          {...register('evidenceUrl')}
        />
        <FieldError errors={[errors.evidenceUrl]} />
      </Field>
      <BusinessTravelPicker
        value={watch('businessTravelRefId')}
        onChange={(id) =>
          setValue('businessTravelRefId', id, { shouldValidate: true })
        }
        options={businessTravelOptions}
      />
    </>
  );
}

export function useManualEntryForm(onClose: () => void) {
  const createEmittedEmission = useCreateEmittedEmission();

  const form = useForm<EmittedEmissionSchema>({
    resolver: zodResolver(emittedEmissionSchema),
    defaultValues: {
      name: '',
      emissionFactorId: '',
      quantity: 0,
      date: new Date(),
      departmentId: '',
      evidenceUrl: '',
      businessTravelRefId: '',
    },
  });

  const onSubmit = async (values: EmittedEmissionSchema) => {
    await createEmittedEmission.mutateAsync({
      name: values.name,
      emissionFactorId: Number(values.emissionFactorId),
      quantity: values.quantity,
      date: values.date,
      departmentId: Number(values.departmentId),
      evidenceUrl: values.evidenceUrl || undefined,
      businessTravelRefId: values.businessTravelRefId
        ? Number(values.businessTravelRefId)
        : undefined,
    });
    form.reset();
    onClose();
  };

  return { form, onSubmit };
}

export function ManualEntryFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { factors, factorGroups } = useGroupedFactorOptions();
  const { data: departments } = useDepartments(true);
  const { data: businessTravels } = useBusinessTravels();
  const { form, onSubmit } = useManualEntryForm(() => onOpenChange(false));

  const selectedFactor = factors.find(
    (factor) => String(factor.id) === form.watch('emissionFactorId'),
  );

  const businessTravelOptions: BusinessTravelOption[] = (
    businessTravels ?? []
  ).map((travel) => ({
    value: travel.id,
    label: `${travel.mode} — ${travel.origin ?? '—'} → ${travel.destination ?? '—'} — ${travel.date.slice(0, 10)}`,
  }));

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add emission"
      form={form}
      onSubmit={onSubmit}
      successMessage="Emission recorded"
    >
      <ManualEntryFormFields
        form={form}
        factorGroups={factorGroups}
        unitOfMeasure={selectedFactor?.unitOfMeasure}
        departments={departments ?? []}
        businessTravelOptions={businessTravelOptions}
      />
    </FormDialog>
  );
}
