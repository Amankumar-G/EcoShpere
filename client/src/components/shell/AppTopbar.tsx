'use client';

import { Bell, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useNotifications } from '@/data/notifications/notifications.hooks';

export function AppTopbar() {
  const { data } = useNotifications();
  const unreadCount = data?.unreadCount;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger />
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search records, people…"
          className="pl-8"
          aria-label="Search records, people"
        />
      </div>
      <button
        type="button"
        aria-label={
          unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        className="relative inline-flex size-8 items-center justify-center rounded-lg text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Bell className="size-4" />
        {Boolean(unreadCount) && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[0.65rem]"
          >
            {unreadCount}
          </Badge>
        )}
      </button>
    </header>
  );
}
