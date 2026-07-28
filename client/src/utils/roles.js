function resolveRole(userOrRole) {
  return typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
}

export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
});

export const USER_ROLE_LABELS = Object.freeze({
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.STAFF]: 'Staff',
});

export const USER_ROLE_OPTIONS = Object.freeze([
  { label: USER_ROLE_LABELS[USER_ROLES.STAFF], value: USER_ROLE_LABELS[USER_ROLES.STAFF] },
  { label: USER_ROLE_LABELS[USER_ROLES.MANAGER], value: USER_ROLE_LABELS[USER_ROLES.MANAGER] },
]);

export function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

export function getRoleLabel(userOrRole) {
  return USER_ROLE_LABELS[normalizeRole(resolveRole(userOrRole))] || USER_ROLE_LABELS[USER_ROLES.STAFF];
}

export function isRole(userOrRole, role) {
  return normalizeRole(resolveRole(userOrRole)) === role;
}

export function hasAdminAccess(userOrRole) {
  const role = normalizeRole(resolveRole(userOrRole));
  return role === USER_ROLES.ADMIN || role === USER_ROLES.MANAGER;
}

export function canAccessCustomers(userOrRole) {
  return isRole(userOrRole, USER_ROLES.ADMIN);
}

export function canAccessSettings(userOrRole) {
  return isRole(userOrRole, USER_ROLES.ADMIN);
}

export function getVisibleLoginActivityRoles(userOrRole) {
  const normalizedRole = normalizeRole(resolveRole(userOrRole));

  if (normalizedRole === USER_ROLES.ADMIN) {
    return [
      USER_ROLE_LABELS[USER_ROLES.ADMIN],
      USER_ROLE_LABELS[USER_ROLES.MANAGER],
      USER_ROLE_LABELS[USER_ROLES.STAFF],
    ];
  }

  if (normalizedRole === USER_ROLES.MANAGER) {
    return [USER_ROLE_LABELS[USER_ROLES.STAFF]];
  }

  return [];
}
