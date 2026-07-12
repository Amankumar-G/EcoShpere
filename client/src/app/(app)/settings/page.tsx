import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import { settingsSubNavItems } from '@/components/shell/nav-items';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage departments, employees, categories, and ESG configuration."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {settingsSubNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted"
          >
            <item.icon className="size-5 text-primary" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
