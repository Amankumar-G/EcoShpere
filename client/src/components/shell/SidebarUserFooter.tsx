'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarFooter } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/data/auth/auth.hooks';
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
  const router = useRouter();
  const logout = useLogout();

  return (
    <SidebarFooter>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent">
          <Avatar>
            <AvatarFallback>
              {initialsFor(user.name, user.email)}
            </AvatarFallback>
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
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top">
          <DropdownMenuItem
            variant="destructive"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => router.push('/login'),
              })
            }
          >
            <LogOut />
            {logout.isPending ? 'Signing out...' : 'Log out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}
