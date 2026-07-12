import {
  Banknote,
  BookOpen,
  Building2,
  Calculator,
  Car,
  ClipboardList,
  Contact,
  Database,
  FlaskConical,
  Gauge,
  GitMerge,
  Leaf,
  ListTree,
  Package,
  Plane,
  ReceiptText,
  Settings,
  Shield,
  SlidersHorizontal,
  Trophy,
  Users2,
  Wallet,
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
  { label: 'Records', href: '/records', icon: ClipboardList },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'manager'],
  },
];

export interface SubNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
}

export const settingsSubNavItems: SubNavItem[] = [
  { label: 'Departments', href: '/settings/departments', icon: Building2 },
  { label: 'Categories', href: '/settings/categories', icon: ListTree },
  {
    label: 'ESG Configuration',
    href: '/settings/esg-configuration',
    icon: SlidersHorizontal,
  },
  {
    label: 'Emission Factors',
    href: '/settings/esg-configuration/emission-factors',
    icon: Calculator,
  },
  {
    label: 'Emission Scopes',
    href: '/settings/esg-configuration/emission-scopes',
    icon: ListTree,
  },
  {
    label: 'Gases',
    href: '/settings/esg-configuration/gases',
    icon: FlaskConical,
  },
  {
    label: 'Source Databases',
    href: '/settings/esg-configuration/source-databases',
    icon: Database,
  },
  {
    label: 'Assignation Rules',
    href: '/settings/esg-configuration/assignation-rules',
    icon: GitMerge,
    roles: ['admin'],
  },
];

// Records — the Phase 1 operational-records data-entry layer. Employees is
// listable by admin/manager only; Payroll is admin-only (feeds the pay-gap
// scoring formula).
export const recordsSubNavItems: SubNavItem[] = [
  { label: 'Invoices', href: '/records/invoices', icon: ReceiptText },
  { label: 'Expenses', href: '/records/expenses', icon: Wallet },
  { label: 'Products', href: '/records/products', icon: Package },
  { label: 'Partners', href: '/records/partners', icon: Contact },
  { label: 'Accounts', href: '/records/accounts', icon: BookOpen },
  { label: 'Fleet', href: '/records/fleet', icon: Car },
  {
    label: 'Business Travel',
    href: '/records/business-travel',
    icon: Plane,
  },
  {
    label: 'Employees',
    href: '/records/employees',
    icon: Users2,
    roles: ['admin', 'manager'],
  },
  {
    label: 'Payroll',
    href: '/records/payroll',
    icon: Banknote,
    roles: ['admin'],
  },
];

export const canAccessNavItem = (
  item: { roles?: Role[] },
  role: Role,
): boolean => !item.roles || item.roles.includes(role);
