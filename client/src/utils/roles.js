function resolveRole(userOrRole) {
  return typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
}

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

export function hasAdminAccess(userOrRole) {
  const role = normalizeRole(resolveRole(userOrRole));
  return role === 'admin' || role === 'manager';
}

export function canAccessCustomers(userOrRole) {
  return normalizeRole(resolveRole(userOrRole)) === 'admin';
}

export function canAccessSettings(userOrRole) {
  return normalizeRole(resolveRole(userOrRole)) === 'admin';
}

export function getVisibleLoginActivityRoles(userOrRole) {
  const normalizedRole = normalizeRole(resolveRole(userOrRole));

  if (normalizedRole === 'admin') {
    return ['Staff', 'Manager'];
  }

  if (normalizedRole === 'manager') {
    return ['Staff'];
  }

  return [];
}
