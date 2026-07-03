import { canAccessCustomers, canAccessSettings, hasAdminAccess } from '../utils/roles';

export const sidebarMenu = [
  {
    id: 'main',
    label: 'Main',
    children: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      {
        id: 'billing',
        label: 'Billing',
        icon: 'billing',
        visible: (user) => !hasAdminAccess(user)
      }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    children: [
      { id: 'products', label: 'Products', icon: 'products' },
      { id: 'stock', label: 'Stock', icon: 'stock' },
      {
        id: 'pricing',
        label: 'Pricing',
        icon: 'pricing',
        visible: hasAdminAccess
      },
      { id: 'priceboard', label: 'Price Board', icon: 'priceboard' }
    ]
  },
  {
    id: 'business',
    label: 'Business',
    visible: hasAdminAccess,
    children: [
      { id: 'sales', label: 'Sales', icon: 'sales' },
      {
        id: 'customers',
        label: 'Customers',
        icon: 'customers',
        visible: canAccessCustomers
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    visible: hasAdminAccess,
    children: [
      { id: 'reports', label: 'Reports', icon: 'reports' }
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    visible: hasAdminAccess,
    children: [
      { id: 'loginlog', label: 'Login Activity', icon: 'loginlog' },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        visible: canAccessSettings
      }
    ]
  }
];
