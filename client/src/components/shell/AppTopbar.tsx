'use client';

import * as React from 'react';
import { Bell, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  useMarkNotificationRead,
  useNotifications,
} from '@/data/notifications/notifications.hooks';
import { NotificationItem } from '@/types/notification.interface';

function NotificationBellButton({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'
      }
      className="relative inline-flex size-8 items-center justify-center rounded-lg text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Bell className="size-4" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[0.65rem]"
        >
          {unreadCount}
        </Badge>
      )}
    </button>
  );
}

function NotificationRow({ notification }: { notification: NotificationItem }) {
  const markRead = useMarkNotificationRead();

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{notification.type}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </div>
      {!notification.isRead && (
        <Button
          variant="outline"
          size="sm"
          disabled={markRead.isPending}
          onClick={() => markRead.mutate(notification.id)}
        >
          Mark read
        </Button>
      )}
    </div>
  );
}

function NotificationDrawerBody({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  if (notifications.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No notifications</EmptyTitle>
          <EmptyDescription>You&apos;re all caught up.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">
      {notifications.map((notification) => (
        <NotificationRow key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

export function AppTopbar() {
  const { data } = useNotifications();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const unreadCount = data?.unreadCount ?? 0;

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
      <NotificationBellButton
        unreadCount={unreadCount}
        onClick={() => setIsDrawerOpen(true)}
      />
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
                : 'You have no unread notifications.'}
            </SheetDescription>
          </SheetHeader>
          <NotificationDrawerBody notifications={data?.items ?? []} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
