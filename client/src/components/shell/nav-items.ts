import {
  Building2,
  Gauge,
  Leaf,
  ListTree,
  Settings,
  Shield,
  SlidersHorizontal,
  Trophy,
  Users2,
  FileBarChart,
  type LucideIcon,
} from 'lucide-react';
import { Role } from '@/types/auth.interface';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
}

export const primaryNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Gauge },
  { label: 'Environmental', href: '/environmental', icon: Leaf },
  { label: 'Social', href: '/social', icon: Users2 },
  { label: 'Governance', href: '/governance', icon: Shield },
  { label: 'Gamification', href: '/gamification', icon: Trophy },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'manager'],
  },
];

export interface SettingsSubNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const settingsSubNavItems: SettingsSubNavItem[] = [
  { label: 'Departments', href: '/settings/departments', icon: Building2 },
  { label: 'Employees', href: '/settings/employees', icon: Users2 },
  { label: 'Categories', href: '/settings/categories', icon: ListTree },
  {
    label: 'ESG Configuration',
    href: '/settings/esg-configuration',
    icon: SlidersHorizontal,
  },
];

export const canAccessNavItem = (item: NavItem, role: Role): boolean =>
  !item.roles || item.roles.includes(role);
