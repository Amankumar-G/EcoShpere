'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useDepartmentCount } from '@/data/departments/departments.hooks';
import { useEmployeeCount } from '@/data/employees/employees.hooks';
import {
  canAccessNavItem,
  primaryNavItems,
  recordsSubNavItems,
  settingsSubNavItems,
} from '@/components/shell/nav-items';
import { Role } from '@/types/auth.interface';

const activeItemClassName =
  'data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:font-semibold data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground';

export function AppSidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const canManageSettings = canAccessNavItem(
    primaryNavItems.find((item) => item.label === 'Settings')!,
    role,
  );
  const employeeCount = useEmployeeCount(canManageSettings);
  const departmentCount = useDepartmentCount(canManageSettings);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {primaryNavItems
            .filter((item) => canAccessNavItem(item, role))
            .map((item) => {
              const isActive = pathname.startsWith(item.href);
              const subItems =
                item.label === 'Settings'
                  ? settingsSubNavItems
                  : item.label === 'Records'
                    ? recordsSubNavItems
                    : undefined;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive}
                    className={activeItemClassName}
                    render={
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    }
                  />
                  {subItems && isActive && (
                    <SidebarMenuSub>
                      {subItems
                        .filter((subItem) => canAccessNavItem(subItem, role))
                        .map((subItem) => {
                          const count =
                            subItem.label === 'Employees'
                              ? employeeCount.data
                              : subItem.label === 'Departments'
                                ? departmentCount.data
                                : undefined;

                          return (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                isActive={pathname === subItem.href}
                                render={
                                  <Link href={subItem.href}>
                                    <subItem.icon />
                                    <span>{subItem.label}</span>
                                  </Link>
                                }
                              />
                              {count !== undefined && (
                                <SidebarMenuBadge>{count}</SidebarMenuBadge>
                              )}
                            </SidebarMenuSubItem>
                          );
                        })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
