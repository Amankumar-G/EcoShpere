import Link from 'next/link';
import { FileBarChart } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';

export default function EnvironmentalPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Environmental"
        description="Track and manage the organization's environmental impact."
      />
      <Link
        href="/environmental/emissions"
        className="flex items-center gap-3 rounded-lg border border-border p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <FileBarChart className="size-5 text-muted-foreground" />
        Emissions Ledger
      </Link>
    </div>
  );
}
