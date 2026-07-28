import { getRoleLayout } from './roleLayouts';

export function getSidebarMenu(user) {
  return getRoleLayout(user).menu;
}
