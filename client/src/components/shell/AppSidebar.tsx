'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { AppSidebarNav } from '@/components/shell/AppSidebarNav';
import { SidebarUserFooter } from '@/components/shell/SidebarUserFooter';
import { AuthUser } from '@/types/auth.interface';

export function AppSidebar({ user }: { user: AuthUser }) {
  return (
    <aside aria-label="Primary navigation">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md p-2 text-sm font-semibold text-sidebar-foreground"
          >
            <Leaf className="size-5 text-sidebar-primary" />
            <span>EcoSphere</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <AppSidebarNav role={user.role} />
        </SidebarContent>
        <SidebarUserFooter user={user} />
      </Sidebar>
    </aside>
  );
}
