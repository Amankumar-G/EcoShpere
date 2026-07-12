'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarFooter } from '@/components/ui/sidebar';
import { deriveLevelProgress } from '@/lib/gamification/level';
import { AuthUser } from '@/types/auth.interface';

const initialsFor = (name: string | null, email: string): string => {
  const source = name?.trim() || email;
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const resolveDepartmentLabel = (user: AuthUser): string => {
  if (user.departmentName) return user.departmentName;
  if (user.departmentId === null) return 'No department';
  return `Department #${user.departmentId}`;
};

export function SidebarUserFooter({ user }: { user: AuthUser }) {
  const departmentLabel = resolveDepartmentLabel(user);
  const { level, xp } = deriveLevelProgress(user.xp);

  return (
    <SidebarFooter>
      <div className="flex items-center gap-2 rounded-md p-2">
        <Avatar>
          <AvatarFallback>{initialsFor(user.name, user.email)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name ?? user.email}
          </span>
          <span className="truncate text-xs text-sidebar-foreground/70">
            {departmentLabel}
          </span>
          <span className="truncate text-xs text-sidebar-foreground/70">
            Level {level} · {xp} XP
          </span>
        </div>
      </div>
    </SidebarFooter>
  );
}
