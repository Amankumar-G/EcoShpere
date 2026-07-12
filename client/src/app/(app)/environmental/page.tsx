'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { FileBarChart, Leaf, Target } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useEmissionsFootprint } from '@/data/emitted-emissions/emitted-emissions.hooks';
import { useEnvironmentalGoals } from '@/data/environmental-goals/environmental-goals.hooks';
import { useInitiatives } from '@/data/initiatives/initiatives.hooks';

const chartConfig = {
  co2eValue: { label: 'kgCO2e', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const NAV_CARDS = [
  {
    href: '/environmental/goals',
    title: 'Goals',
    description: 'Reduction targets with deadlines',
    icon: Target,
  },
  {
    href: '/environmental/initiatives',
    title: 'Initiatives',
    description: 'Reduction actions and delivery',
    icon: Leaf,
  },
  {
    href: '/environmental/emissions',
    title: 'Emissions Ledger',
    description: 'Every recorded emission, by scope',
    icon: FileBarChart,
  },
];

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {sub ? (
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {sub}
        </CardContent>
      ) : null}
    </Card>
  );
}

export default function EnvironmentalDashboardPage() {
  const { data: footprint } = useEmissionsFootprint({ groupBy: 'scope' });
  const { data: goals } = useEnvironmentalGoals();
  const { data: initiatives } = useInitiatives();

  const totalFootprint = (footprint ?? []).reduce(
    (sum, group) => sum + group.co2eValue,
    0,
  );
  const activeGoals = (goals ?? []).filter(
    (goal) => goal.status === 'active',
  ).length;
  const totalActualSaved = (initiatives ?? []).reduce(
    (sum, initiative) => sum + (initiative.actualCo2Reduction ?? 0),
    0,
  );
  const avgProgress = initiatives?.length
    ? Math.round(
        initiatives.reduce((sum, i) => sum + i.progress, 0) /
          initiatives.length,
      )
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Environmental"
        description="Carbon footprint, reduction goals, and initiative delivery."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total footprint"
          value={`${Math.round(totalFootprint).toLocaleString()} kgCO2e`}
        />
        <StatCard label="Active goals" value={String(activeGoals)} />
        <StatCard
          label="CO2e saved (initiatives)"
          value={`${Math.round(totalActualSaved).toLocaleString()} kgCO2e`}
        />
        <StatCard label="Avg initiative progress" value={`${avgProgress}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Footprint by scope</CardTitle>
          <CardDescription>
            Total recorded emissions grouped by GHG Protocol scope.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {footprint && footprint.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart accessibilityLayer data={footprint}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} width={72} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="co2eValue"
                  fill="var(--color-co2eValue)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No emissions recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {NAV_CARDS.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <card.icon className="size-5 text-muted-foreground" />
                <CardTitle className="text-base">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
