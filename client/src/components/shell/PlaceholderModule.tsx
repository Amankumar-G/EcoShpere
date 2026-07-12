import { PageHeader } from '@/components/shared/page-header';

export function PlaceholderModule({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description ?? 'This module will be built out next.'}
      />
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Coming soon
      </div>
    </div>
  );
}
