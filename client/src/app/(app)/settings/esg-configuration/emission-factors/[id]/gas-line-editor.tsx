'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Check, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/ui/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  useAddGasLine,
  useRemoveGasLine,
  useUpdateGasLine,
} from '@/data/emission-factors/emission-factors.hooks';
import {
  ACTIVITY_TYPES,
  EmissionFactorGasLine,
  GAS_QUANTITY_UNITS,
} from '@/types/emission-factor.interface';
import { Gas } from '@/types/gas.interface';
import { gasLineSchema } from '@/lib/zod-schemas/emission-factor.schema';
import { getErrorMessage } from '@/lib/axios/get-error-message';

type GasLineDraft = {
  gasId: string;
  value: string;
  unit: string;
  activityType: string;
};

function toDraft(gasLine?: EmissionFactorGasLine): GasLineDraft {
  return {
    gasId: gasLine ? String(gasLine.gasId) : '',
    value: gasLine ? String(gasLine.value) : '',
    unit: gasLine?.unit ?? '',
    activityType: gasLine?.activityType ?? '',
  };
}

function computeContribution(draft: GasLineDraft, gases: Gas[]): number {
  const gas = gases.find((candidate) => candidate.id === Number(draft.gasId));
  const value = Number(draft.value);
  if (!gas || !Number.isFinite(value)) {
    return 0;
  }
  return value * gas.gwp;
}

function formatCo2e(amount: number): string {
  return amount.toFixed(4);
}

function GasLineRow({
  gasLine,
  gases,
  factorId,
  onDraftChange,
}: {
  gasLine: EmissionFactorGasLine;
  gases: Gas[];
  factorId: number;
  onDraftChange: (lineId: number, draft: GasLineDraft) => void;
}) {
  const [draft, setDraft] = React.useState<GasLineDraft>(toDraft(gasLine));
  const [error, setError] = React.useState<string | undefined>(undefined);
  const updateGasLine = useUpdateGasLine(factorId);
  const removeGasLine = useRemoveGasLine(factorId);

  React.useEffect(() => {
    onDraftChange(gasLine.id, draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const update = (patch: Partial<GasLineDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleSave = async () => {
    const result = gasLineSchema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid gas line');
      return;
    }
    setError(undefined);
    try {
      await updateGasLine.mutateAsync({
        lineId: gasLine.id,
        payload: {
          gasId: result.data.gasId,
          value: result.data.value,
          unit: result.data.unit,
          activityType: result.data.activityType || undefined,
        },
      });
      toast.success('Gas line updated');
    } catch (submitError) {
      toast.error(getErrorMessage(submitError));
    }
  };

  const handleRemove = async () => {
    try {
      await removeGasLine.mutateAsync(gasLine.id);
      toast.success('Gas line removed');
    } catch (removeError) {
      toast.error(getErrorMessage(removeError));
    }
  };

  return (
    <div className="flex flex-col gap-1 border-b border-border py-2 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          aria-label="Gas"
          value={draft.gasId}
          onChange={(event) => update({ gasId: event.target.value })}
        >
          <NativeSelectOption value="">Select gas</NativeSelectOption>
          {gases.map((gas) => (
            <NativeSelectOption key={gas.id} value={String(gas.id)}>
              {gas.name} ({gas.symbol})
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Input
          aria-label="Value"
          type="number"
          step="any"
          className="w-32 text-right tabular-nums"
          value={draft.value}
          onChange={(event) => update({ value: event.target.value })}
        />
        <NativeSelect
          aria-label="Unit"
          className="w-24"
          value={draft.unit}
          onChange={(event) => update({ unit: event.target.value })}
        >
          <NativeSelectOption value="">Unit</NativeSelectOption>
          {GAS_QUANTITY_UNITS.map((unit) => (
            <NativeSelectOption key={unit} value={unit}>
              {unit}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Activity type (optional)"
          className="w-40"
          value={draft.activityType}
          onChange={(event) => update({ activityType: event.target.value })}
        >
          <NativeSelectOption value="">Activity type</NativeSelectOption>
          {ACTIVITY_TYPES.map((activityType) => (
            <NativeSelectOption key={activityType} value={activityType}>
              {activityType}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <span className="ml-auto min-w-24 text-right tabular-nums text-muted-foreground">
          {formatCo2e(computeContribution(draft, gases))} kgCO2e
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Save gas line"
          onClick={handleSave}
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove gas line"
          onClick={handleRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <FieldError errors={error ? [{ message: error }] : []} />
    </div>
  );
}

function NewGasLineRow({
  factorId,
  gases,
  onDraftChange,
  onSaved,
}: {
  factorId: number;
  gases: Gas[];
  onDraftChange: (draft: GasLineDraft) => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = React.useState<GasLineDraft>(toDraft());
  const [error, setError] = React.useState<string | undefined>(undefined);
  const addGasLine = useAddGasLine(factorId);

  React.useEffect(() => {
    onDraftChange(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const update = (patch: Partial<GasLineDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleSave = async () => {
    const result = gasLineSchema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid gas line');
      return;
    }
    setError(undefined);
    try {
      await addGasLine.mutateAsync({
        gasId: result.data.gasId,
        value: result.data.value,
        unit: result.data.unit,
        activityType: result.data.activityType || undefined,
      });
      toast.success('Gas line added');
      onSaved();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError));
    }
  };

  return (
    <div className="flex flex-col gap-1 border-b border-dashed border-border py-2">
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          aria-label="Gas"
          value={draft.gasId}
          onChange={(event) => update({ gasId: event.target.value })}
        >
          <NativeSelectOption value="">Select gas</NativeSelectOption>
          {gases.map((gas) => (
            <NativeSelectOption key={gas.id} value={String(gas.id)}>
              {gas.name} ({gas.symbol})
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Input
          aria-label="Value"
          type="number"
          step="any"
          className="w-32 text-right tabular-nums"
          value={draft.value}
          onChange={(event) => update({ value: event.target.value })}
        />
        <NativeSelect
          aria-label="Unit"
          className="w-24"
          value={draft.unit}
          onChange={(event) => update({ unit: event.target.value })}
        >
          <NativeSelectOption value="">Unit</NativeSelectOption>
          {GAS_QUANTITY_UNITS.map((unit) => (
            <NativeSelectOption key={unit} value={unit}>
              {unit}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Activity type (optional)"
          className="w-40"
          value={draft.activityType}
          onChange={(event) => update({ activityType: event.target.value })}
        >
          <NativeSelectOption value="">Activity type</NativeSelectOption>
          {ACTIVITY_TYPES.map((activityType) => (
            <NativeSelectOption key={activityType} value={activityType}>
              {activityType}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <span className="ml-auto min-w-24 text-right tabular-nums text-muted-foreground">
          {formatCo2e(computeContribution(draft, gases))} kgCO2e
        </span>
        <Button type="button" size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
      <FieldError errors={error ? [{ message: error }] : []} />
    </div>
  );
}

export function GasLineEditor({
  factorId,
  gasLines,
  gases,
}: {
  factorId: number;
  gasLines: EmissionFactorGasLine[];
  gases: Gas[];
}) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [drafts, setDrafts] = React.useState<Record<string, GasLineDraft>>({});

  const handleExistingDraftChange = React.useCallback(
    (lineId: number, draft: GasLineDraft) => {
      setDrafts((current) => ({ ...current, [lineId]: draft }));
    },
    [],
  );

  const handleNewDraftChange = React.useCallback((draft: GasLineDraft) => {
    setDrafts((current) => ({ ...current, new: draft }));
  }, []);

  const total = React.useMemo(() => {
    let sum = 0;
    for (const gasLine of gasLines) {
      const draft = drafts[gasLine.id] ?? toDraft(gasLine);
      sum += computeContribution(draft, gases);
    }
    if (isAdding) {
      const draft = drafts.new ?? toDraft();
      sum += computeContribution(draft, gases);
    }
    return sum;
  }, [gasLines, gases, isAdding, drafts]);

  return (
    <div className="flex flex-col gap-3">
      {gasLines.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">
          Add at least one gas line.
        </p>
      )}
      <div>
        {gasLines.map((gasLine) => (
          <GasLineRow
            key={gasLine.id}
            gasLine={gasLine}
            gases={gases}
            factorId={factorId}
            onDraftChange={handleExistingDraftChange}
          />
        ))}
        {isAdding && (
          <NewGasLineRow
            factorId={factorId}
            gases={gases}
            onDraftChange={handleNewDraftChange}
            onSaved={() => {
              setDrafts((current) =>
                Object.fromEntries(
                  Object.entries(current).filter(([key]) => key !== 'new'),
                ),
              );
              setIsAdding(false);
            }}
          />
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsAdding(true)}
        disabled={isAdding}
      >
        <Plus className="size-4" />
        Add gas line
      </Button>
      <div
        className="flex items-center justify-between border-t border-border pt-3"
        aria-live="polite"
      >
        <span className="text-sm font-medium text-muted-foreground">
          Total CO2e
        </span>
        <span className="text-xl font-semibold tabular-nums">
          {formatCo2e(total)} kgCO2e
        </span>
      </div>
    </div>
  );
}
