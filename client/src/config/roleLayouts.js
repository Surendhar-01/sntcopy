import { normalizeRole, USER_ROLES, USER_ROLE_LABELS } from '../utils/roles';

const pageAccessByRole = {
  [USER_ROLES.ADMIN]: [
    'dashboard',
    'products',
    'stock',
    'pricing',
    'priceboard',
    'sales',
    'customers',
    'reports',
    'loginlog',
    'settings',
  ],
  [USER_ROLES.MANAGER]: [
    'dashboard',
    'products',
    'stock',
    'pricing',
    'priceboard',
    'sales',
    'reports',
    'loginlog',
  ],
  [USER_ROLES.STAFF]: [
    'billing',
    'dashboard',
    'products',
    'stock',
    'priceboard',
  ],
};

export const roleLayouts = {
  [USER_ROLES.ADMIN]: {
    key: USER_ROLES.ADMIN,
    label: USER_ROLE_LABELS[USER_ROLES.ADMIN],
    accessLabel: 'Full Access',
    title: 'Sri Nikil Admin Dashboard',
    subtitle: 'Complete business control',
    defaultPage: 'dashboard',
    menu: [
      {
        id: 'main',
        label: 'Control',
        children: [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        children: [
          { id: 'products', label: 'Products', icon: 'products' },
          { id: 'stock', label: 'Stock', icon: 'stock' },
          { id: 'pricing', label: 'Pricing', icon: 'pricing' },
          { id: 'priceboard', label: 'Price Board', icon: 'priceboard' },
        ],
      },
      {
        id: 'business',
        label: 'Business',
        children: [
          { id: 'sales', label: 'Sales', icon: 'sales' },
          { id: 'customers', label: 'Customers', icon: 'customers' },
          { id: 'reports', label: 'Reports', icon: 'reports' },
        ],
      },
      {
        id: 'admin',
        label: 'Admin',
        children: [
          { id: 'loginlog', label: 'Login Activity', icon: 'loginlog' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ],
      },
    ],
  },
  [USER_ROLES.MANAGER]: {
    key: USER_ROLES.MANAGER,
    label: USER_ROLE_LABELS[USER_ROLES.MANAGER],
    accessLabel: 'Manager Access',
    title: 'Sri Nikil Manager Dashboard',
    subtitle: 'Sales, stock, and team activity',
    defaultPage: 'dashboard',
    menu: [
      {
        id: 'main',
        label: 'Operations',
        children: [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'sales', label: 'Sales', icon: 'sales' },
          { id: 'reports', label: 'Reports', icon: 'reports' },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        children: [
          { id: 'products', label: 'Products', icon: 'products' },
          { id: 'stock', label: 'Stock', icon: 'stock' },
          { id: 'pricing', label: 'Pricing', icon: 'pricing' },
          { id: 'priceboard', label: 'Price Board', icon: 'priceboard' },
        ],
      },
      {
        id: 'team',
        label: 'Team',
        children: [
          { id: 'loginlog', label: 'Staff Activity', icon: 'loginlog' },
        ],
      },
    ],
  },
  [USER_ROLES.STAFF]: {
    key: USER_ROLES.STAFF,
    label: USER_ROLE_LABELS[USER_ROLES.STAFF],
    accessLabel: 'Counter Access',
    title: 'Sri Nikil Staff Counter',
    subtitle: 'Billing-focused workspace',
    defaultPage: 'dashboard',
    menu: [
      {
        id: 'counter',
        label: 'Counter',
        children: [
          { id: 'dashboard', label: 'My Dashboard', icon: 'dashboard' },
          { id: 'billing', label: 'Billing', icon: 'billing' },
          { id: 'priceboard', label: 'Price Board', icon: 'priceboard' },
        ],
      },
      {
        id: 'stock_view',
        label: 'Stock View',
        children: [
          { id: 'products', label: 'Products', icon: 'products' },
          { id: 'stock', label: 'Stock', icon: 'stock' },
        ],
      },
    ],
  },
};

export function getRoleLayout(userOrRole) {
  const role = normalizeRole(typeof userOrRole === 'string' ? userOrRole : userOrRole?.role);
  return roleLayouts[role] || roleLayouts[USER_ROLES.STAFF];
}

export function canRoleOpenPage(userOrRole, page) {
  const roleKey = getRoleLayout(userOrRole).key;
  return pageAccessByRole[roleKey]?.includes(page);
}
