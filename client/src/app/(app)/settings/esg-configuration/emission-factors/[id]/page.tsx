'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useEmissionFactor,
  useUpdateEmissionFactor,
} from '@/data/emission-factors/emission-factors.hooks';
import { useEmissionScopeTree } from '@/data/emission-scopes/emission-scopes.hooks';
import { useSourceDatabases } from '@/data/source-databases/source-databases.hooks';
import { useGases } from '@/data/gases/gases.hooks';
import { EmissionFactor } from '@/types/emission-factor.interface';
import { EmissionScope } from '@/types/emission-scope.interface';
import { UNITS_OF_MEASURE, RECORD_STATUSES } from '@/types/records.interface';
import {
  EmissionFactorSchema,
  emissionFactorSchema,
} from '@/lib/zod-schemas/emission-factor.schema';
import { getErrorMessage } from '@/lib/axios/get-error-message';
import { GasLineEditor } from './gas-line-editor';

function flattenScopes(scopes: EmissionScope[]): EmissionScope[] {
  return scopes.flatMap((scope) => [
    scope,
    ...flattenScopes(scope.children ?? []),
  ]);
}

function toFormValues(factor: EmissionFactor): EmissionFactorSchema {
  return {
    name: factor.name,
    scopeId: String(factor.scopeId),
    sourceDatabaseId: String(factor.sourceDatabaseId),
    computeMethod: factor.computeMethod,
    unitOfMeasure:
      factor.unitOfMeasure as EmissionFactorSchema['unitOfMeasure'],
    uncertainty: factor.uncertainty !== null ? String(factor.uncertainty) : '',
    status: factor.status as EmissionFactorSchema['status'],
  };
}

function EmissionFactorMetadataForm({
  factor,
  scopes,
  sourceDatabases,
}: {
  factor: EmissionFactor;
  scopes: EmissionScope[];
  sourceDatabases: Array<{ id: number; name: string }>;
}) {
  const updateEmissionFactor = useUpdateEmissionFactor();
  const form = useForm<EmissionFactorSchema>({
    resolver: zodResolver(emissionFactorSchema),
    values: toFormValues(factor),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateEmissionFactor.mutateAsync({
        id: factor.id,
        payload: {
          name: values.name,
          scopeId: Number(values.scopeId),
          sourceDatabaseId: Number(values.sourceDatabaseId),
          computeMethod: values.computeMethod,
          unitOfMeasure: values.unitOfMeasure,
          uncertainty: values.uncertainty
            ? Number(values.uncertainty)
            : undefined,
          status: values.status,
        },
      });
      toast.success('Emission factor updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="factor-name">Name</FieldLabel>
          <Input id="factor-name" {...register('name')} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="factor-scope">Scope</FieldLabel>
          <NativeSelect id="factor-scope" {...register('scopeId')}>
            {scopes.map((scope) => (
              <NativeSelectOption key={scope.id} value={String(scope.id)}>
                {scope.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[errors.scopeId]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="factor-source-database">
            Source database
          </FieldLabel>
          <NativeSelect
            id="factor-source-database"
            {...register('sourceDatabaseId')}
          >
            {sourceDatabases.map((sourceDatabase) => (
              <NativeSelectOption
                key={sourceDatabase.id}
                value={String(sourceDatabase.id)}
              >
                {sourceDatabase.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[errors.sourceDatabaseId]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="factor-compute-method">
            Compute method
          </FieldLabel>
          <NativeSelect
            id="factor-compute-method"
            {...register('computeMethod')}
          >
            <NativeSelectOption value="physical">Physical</NativeSelectOption>
            <NativeSelectOption value="monetary">Monetary</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="factor-unit">Unit of measure</FieldLabel>
          <NativeSelect id="factor-unit" {...register('unitOfMeasure')}>
            <NativeSelectOption value="">Select a unit</NativeSelectOption>
            {UNITS_OF_MEASURE.map((uom) => (
              <NativeSelectOption key={uom} value={uom}>
                {uom}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[errors.unitOfMeasure]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="factor-uncertainty">
            Uncertainty (%, optional)
          </FieldLabel>
          <Input
            id="factor-uncertainty"
            type="number"
            step="any"
            {...register('uncertainty')}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="factor-status">Status</FieldLabel>
          <NativeSelect id="factor-status" {...register('status')}>
            {RECORD_STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {status}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[errors.status]} />
        </Field>
        <Field>
          <FieldLabel>Computed CO2e/unit</FieldLabel>
          <span className="text-lg font-semibold tabular-nums">
            {factor.value.toFixed(4)}
          </span>
        </Field>
      </div>
      <div>
        <Button type="submit" disabled={isSubmitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

export default function EmissionFactorDetailPage() {
  const params = useParams<{ id: string }>();
  const factorId = Number(params.id);

  const { data: factor, isLoading } = useEmissionFactor(factorId);
  const { data: scopeTree } = useEmissionScopeTree();
  const { data: sourceDatabases } = useSourceDatabases();
  const { data: gases } = useGases();

  const scopes = React.useMemo(
    () => flattenScopes(scopeTree ?? []),
    [scopeTree],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={factor?.name ?? 'Emission Factor'}
        breadcrumb={[
          {
            label: 'Emission Factors',
            href: '/settings/esg-configuration/emission-factors',
          },
          { label: factor?.name ?? '…' },
        ]}
      />
      {isLoading || !factor ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <Card className="p-6">
            <EmissionFactorMetadataForm
              factor={factor}
              scopes={scopes}
              sourceDatabases={sourceDatabases ?? []}
            />
          </Card>
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="font-heading text-lg font-semibold">
              Gas Composition
            </h2>
            <GasLineEditor
              factorId={factor.id}
              gasLines={factor.gasLines}
              gases={gases ?? []}
            />
          </Card>
        </>
      )}
    </div>
  );
}
