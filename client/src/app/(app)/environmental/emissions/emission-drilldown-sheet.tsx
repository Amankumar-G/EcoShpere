'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useEmissionFactor } from '@/data/emission-factors/emission-factors.hooks';
import { EmissionFactor } from '@/types/emission-factor.interface';
import { EmittedEmission } from '@/types/emitted-emission.interface';

function formatCo2e(amount: number): string {
  return amount.toFixed(4);
}

function EmissionEquation({
  emission,
  factor,
}: {
  emission: EmittedEmission;
  factor: EmissionFactor | undefined;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>Factor × Quantity = Subtotal</span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground tabular-nums">
          {factor ? factor.value.toFixed(4) : '—'} × {emission.quantity}
        </span>
        <span className="text-lg font-semibold tabular-nums">
          {formatCo2e(emission.co2eValue)} kgCO2e
        </span>
      </div>
    </div>
  );
}

function GasLinesTable({ factor }: { factor: EmissionFactor | undefined }) {
  if (!factor) {
    return <p className="text-sm text-muted-foreground">Loading gas lines…</p>;
  }

  if (factor.gasLines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No gas lines recorded.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Contributing gases</h3>
      <div className="flex flex-col gap-1">
        {factor.gasLines.map((gasLine) => (
          <div
            key={gasLine.id}
            className="flex items-center justify-between gap-2 border-b border-border py-1.5 text-sm last:border-b-0"
          >
            <span>{gasLine.gas.name}</span>
            <span className="text-muted-foreground tabular-nums">
              GWP {gasLine.gas.gwp}
            </span>
            <span className="tabular-nums">
              {gasLine.value} {gasLine.unit}
            </span>
            <span className="font-medium tabular-nums">
              {formatCo2e(gasLine.value * gasLine.gas.gwp)} kgCO2e
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmissionDrilldownContent({ emission }: { emission: EmittedEmission }) {
  const { data: factor } = useEmissionFactor(emission.emissionFactorId);

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <EmissionEquation emission={emission} factor={factor} />
      <GasLinesTable factor={factor} />
    </div>
  );
}

export function EmissionDrilldownSheet({
  emission,
  onOpenChange,
}: {
  emission: EmittedEmission | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={Boolean(emission)} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{emission?.name ?? 'Emission detail'}</SheetTitle>
        </SheetHeader>
        {emission && <EmissionDrilldownContent emission={emission} />}
      </SheetContent>
    </Sheet>
  );
}
