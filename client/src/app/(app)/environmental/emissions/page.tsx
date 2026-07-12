'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable, DataTableColumn } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { useEmittedEmissions } from '@/data/emitted-emissions/emitted-emissions.hooks';
import { useEmissionScopeTree } from '@/data/emission-scopes/emission-scopes.hooks';
import { useDepartments } from '@/data/departments/departments.hooks';
import { useEmissionFactors } from '@/data/emission-factors/emission-factors.hooks';
import {
  EmissionSourceType,
  EmittedEmission,
} from '@/types/emitted-emission.interface';
import { ManualEntryFormDialog } from './manual-entry-form';
import { EmissionDrilldownSheet } from './emission-drilldown-sheet';

const SOURCE_TYPES: EmissionSourceType[] = [
  'accounting',
  'fleet_commuting',
  'manual',
];

function useLedgerFilters() {
  const [scopeId, setScopeId] = React.useState('');
  const [departmentId, setDepartmentId] = React.useState('');
  const [sourceType, setSourceType] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');

  const filters = React.useMemo(
    () => ({
      scopeId: scopeId ? Number(scopeId) : undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      sourceType: (sourceType || undefined) as EmissionSourceType | undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [scopeId, departmentId, sourceType, from, to],
  );

  return {
    filters,
    scopeId,
    setScopeId,
    departmentId,
    setDepartmentId,
    sourceType,
    setSourceType,
    from,
    setFrom,
    to,
    setTo,
  };
}

function LedgerFilterRow({
  scopes,
  departments,
  ledger,
}: {
  scopes: Array<{ id: number; name: string }>;
  departments: Array<{ id: number; name: string }>;
  ledger: ReturnType<typeof useLedgerFilters>;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Scope</label>
        <NativeSelect
          value={ledger.scopeId}
          onChange={(event) => ledger.setScopeId(event.target.value)}
        >
          <NativeSelectOption value="">All scopes</NativeSelectOption>
          {scopes.map((scope) => (
            <NativeSelectOption key={scope.id} value={String(scope.id)}>
              {scope.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Department</label>
        <NativeSelect
          value={ledger.departmentId}
          onChange={(event) => ledger.setDepartmentId(event.target.value)}
        >
          <NativeSelectOption value="">All departments</NativeSelectOption>
          {departments.map((department) => (
            <NativeSelectOption
              key={department.id}
              value={String(department.id)}
            >
              {department.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Source type</label>
        <NativeSelect
          value={ledger.sourceType}
          onChange={(event) => ledger.setSourceType(event.target.value)}
        >
          <NativeSelectOption value="">All source types</NativeSelectOption>
          {SOURCE_TYPES.map((type) => (
            <NativeSelectOption key={type} value={type}>
              {type}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">From</label>
        <Input
          type="date"
          value={ledger.from}
          onChange={(event) => ledger.setFrom(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">To</label>
        <Input
          type="date"
          value={ledger.to}
          onChange={(event) => ledger.setTo(event.target.value)}
        />
      </div>
    </div>
  );
}

export default function EmissionsLedgerPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedEmission, setSelectedEmission] = React.useState<
    EmittedEmission | undefined
  >(undefined);

  const ledger = useLedgerFilters();
  const { data: emissions, isLoading } = useEmittedEmissions(ledger.filters);
  const { data: scopeTree } = useEmissionScopeTree();
  const { data: departments } = useDepartments(true);
  const { data: factors } = useEmissionFactors();

  const factorNameById = React.useMemo(() => {
    const map = new Map<number, string>();
    (factors ?? []).forEach((factor) => map.set(factor.id, factor.name));
    return map;
  }, [factors]);

  const columns: Array<DataTableColumn<EmittedEmission>> = [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    {
      id: 'factor',
      header: 'Factor',
      cell: (row) =>
        factorNameById.get(row.emissionFactorId) ?? row.emissionFactorId,
    },
    {
      id: 'sourceType',
      header: 'Source',
      cell: (row) => <Badge variant="outline">{row.sourceType}</Badge>,
    },
    {
      id: 'quantity',
      header: 'Quantity',
      cell: (row) => (
        <span className="block text-right tabular-nums">{row.quantity}</span>
      ),
    },
    {
      id: 'co2eValue',
      header: 'CO2e',
      cell: (row) => (
        <span className="block text-right tabular-nums">
          {row.co2eValue.toFixed(4)}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Emissions Ledger"
        description="Manually recorded emissions and their computed CO2e contributions."
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="size-4" />
            Add Emission
          </Button>
        }
      />
      <LedgerFilterRow
        scopes={scopeTree ?? []}
        departments={departments ?? []}
        ledger={ledger}
      />
      <DataTable
        columns={columns}
        rows={emissions ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        page={1}
        pageSize={emissions?.length ?? 1}
        total={emissions?.length ?? 0}
        onPageChange={() => undefined}
        onRowClick={setSelectedEmission}
        emptyTitle="No emissions recorded yet"
        emptyDescription="Add your first manual emission entry to get started."
      />
      <ManualEntryFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
      <EmissionDrilldownSheet
        emission={selectedEmission}
        onOpenChange={(open) => !open && setSelectedEmission(undefined)}
      />
    </div>
  );
}
