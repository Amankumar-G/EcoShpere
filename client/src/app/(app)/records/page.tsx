'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/shared/page-header';
import {
  canAccessNavItem,
  recordsSubNavItems,
} from '@/components/shell/nav-items';
import { useMe } from '@/data/auth/auth.hooks';

export default function RecordsPage() {
  const { data: user } = useMe();
  const role = user?.role;

  const items = recordsSubNavItems.filter(
    (item) => !role || canAccessNavItem(item, role),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Records"
        description="Operational records that feed carbon accounting: invoices, expenses, master data, fleet, travel, and payroll."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
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
