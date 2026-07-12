'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useEsgConfigValue,
  useUpdateEsgConfigValue,
} from '@/data/esg-config/esg-config.hooks';
import { getErrorMessage } from '@/lib/axios/get-error-message';
import {
  EsgWeightsSchema,
  esgWeightsSchema,
  sumsToOne,
} from '@/lib/zod-schemas/esg-weights.schema';
import { EsgConfigKey } from '@/types/esg-config.interface';

type ToggleDefinition = {
  key: Extract<
    EsgConfigKey,
    | 'auto_emission_calculation'
    | 'evidence_required_for_approval'
    | 'badge_auto_award'
    | 'email_alerts_for_compliance_issues'
  >;
  label: string;
  description: string;
};

const TOGGLE_DEFINITIONS: ToggleDefinition[] = [
  {
    key: 'auto_emission_calculation',
    label: 'Enable auto emission calculation',
    description: 'Automatically calculate emissions from operational records.',
  },
  {
    key: 'evidence_required_for_approval',
    label: 'Require evidence for CSR approval',
    description: 'CSR activity approvals must include supporting evidence.',
  },
  {
    key: 'badge_auto_award',
    label: 'Auto-award badges on challenge completion',
    description: 'Award badges automatically when a challenge is completed.',
  },
  {
    key: 'email_alerts_for_compliance_issues',
    label: 'Email alerts for new compliance issues',
    description: 'Notify admins by email when a compliance issue is raised.',
  },
];

function EsgConfigToggle({ definition }: { definition: ToggleDefinition }) {
  const { data, isLoading } = useEsgConfigValue(definition.key);
  const updateValue = useUpdateEsgConfigValue(definition.key);

  const handleCheckedChange = async (checked: boolean) => {
    try {
      await updateValue.mutateAsync(checked);
      toast.success(`${definition.label} updated`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{definition.label}</span>
        <span className="text-sm text-muted-foreground">
          {definition.description}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-9" />
      ) : (
        <Switch
          checked={Boolean(data)}
          onCheckedChange={handleCheckedChange}
          disabled={updateValue.isPending}
          aria-label={definition.label}
        />
      )}
    </div>
  );
}

function EsgWeightsEditor() {
  const { data, isLoading } = useEsgConfigValue('esg_weights');
  const updateWeights = useUpdateEsgConfigValue('esg_weights');

  const form = useForm<EsgWeightsSchema>({
    resolver: zodResolver(esgWeightsSchema),
    values: data ?? { e: 0.4, s: 0.3, g: 0.3 },
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');
    if (!sumsToOne(values)) {
      setError('root', {
        message: 'Environmental, Social, and Governance weights must sum to 1.',
      });
      return;
    }
    try {
      await updateWeights.mutateAsync(values);
      toast.success('ESG weights updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-lg border border-border p-4"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium">ESG weights</span>
        <span className="text-sm text-muted-foreground">
          Weights used to compute the overall ESG score. Must sum to 1.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="weight-e">Environmental (E)</FieldLabel>
          <Input id="weight-e" type="number" step="0.01" {...register('e')} />
          <FieldError errors={[errors.e]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="weight-s">Social (S)</FieldLabel>
          <Input id="weight-s" type="number" step="0.01" {...register('s')} />
          <FieldError errors={[errors.s]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="weight-g">Governance (G)</FieldLabel>
          <Input id="weight-g" type="number" step="0.01" {...register('g')} />
          <FieldError errors={[errors.g]} />
        </Field>
      </div>
      <FieldError errors={[errors.root]} />
      <div>
        <Button type="submit" disabled={updateWeights.isPending}>
          Save
        </Button>
      </div>
    </form>
  );
}

export default function SettingsEsgConfigurationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="ESG Configuration"
        description="Control how ESG scoring, evidence, and alerts behave platform-wide."
      />
      <div className="flex flex-col gap-3">
        {TOGGLE_DEFINITIONS.map((definition) => (
          <EsgConfigToggle key={definition.key} definition={definition} />
        ))}
      </div>
      <EsgWeightsEditor />
    </div>
  );
}
