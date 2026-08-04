import React, { useCallback, useMemo, useState } from 'react';
import { Menu, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  StockOutlined,
  TagOutlined,
  MonitorOutlined,
  BarChartOutlined,
  TeamOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  SettingOutlined,
  PoweroffOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { getSidebarMenu } from '../config/sidebarMenu';
import { useSidebar } from '../context/useSidebar';
import { getRoleLayout } from '../config/roleLayouts';
// Map icon name → antd icon component
const ICON_MAP = {
  dashboard:  <AppstoreOutlined />,
  billing:    <FileTextOutlined />,
  products:   <ShoppingOutlined />,
  stock:      <StockOutlined />,
  pricing:    <TagOutlined />,
  priceboard: <MonitorOutlined />,
  sales:      <BarChartOutlined />,
  customers:  <TeamOutlined />,
  reports:    <FileSearchOutlined />,
  loginlog:   <HistoryOutlined />,
  settings:   <SettingOutlined />,
};
const sidebarStyles = ".sidebar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: var(--sidebar-current);\n  height: 100vh;\n  background: var(--sidebar-bg);\n  border-right: 1px solid var(--sidebar-border);\n  color: var(--sidebar-text);\n  display: flex;\n  flex-direction: column;\n  z-index: 120;\n  overflow: hidden;\n  box-shadow: 2px 0 18px rgba(15, 23, 42, 0.08);\n  transition:\n    width 220ms ease,\n    transform 220ms ease,\n    background 220ms ease,\n    border-color 220ms ease;\n}\n\n.sidebar[data-role=\"admin\"] {\n  --sidebar-role-accent: #556ee6;\n  --sidebar-role-accent-2: #b7c4ff;\n  --sidebar-role-soft: rgba(85, 110, 230, 0.14);\n  --sidebar-role-brand: linear-gradient(135deg, #3f51c6 0%, #849bf7 100%);\n}\n\n.sidebar[data-role=\"manager\"] {\n  --sidebar-role-accent: #556ee6;\n  --sidebar-role-accent-2: #b7c4ff;\n  --sidebar-role-soft: rgba(85, 110, 230, 0.14);\n  --sidebar-role-brand: linear-gradient(135deg, #3f51c6 0%, #849bf7 100%);\n}\n\n.sidebar[data-role=\"staff\"] {\n  --sidebar-role-accent: #556ee6;\n  --sidebar-role-accent-2: #b7c4ff;\n  --sidebar-role-soft: rgba(85, 110, 230, 0.14);\n  --sidebar-role-brand: linear-gradient(135deg, #3f51c6 0%, #849bf7 100%);\n}\n\n.sidebar-brand {\n  min-height: 88px;\n  padding: 16px 20px;\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  border-bottom: 1px solid var(--sidebar-border);\n  margin-bottom: 8px;\n  position: relative;\n}\n\n/* Premium Sidebar Top Brand Styles */\n.brand-logo-container {\n  position: relative;\n  width: 40px;\n  height: 40px;\n  border-radius: 12px;\n  background: var(--sidebar-role-brand);\n  border: 1px solid color-mix(in srgb, var(--sidebar-role-accent) 45%, var(--border));\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 6px;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);\n}\n\n.brand-logo-glow {\n  position: absolute;\n  inset: -1px;\n  border-radius: 12px;\n  background: linear-gradient(135deg, var(--accent), var(--accent2));\n  opacity: 0;\n  transition: opacity 0.3s ease;\n  z-index: -1;\n  filter: blur(4px);\n}\n\n.sidebar-brand:hover .brand-logo-container {\n  transform: translateY(-1px) scale(1.02);\n  border-color: var(--sidebar-role-accent);\n  box-shadow: 0 6px 16px color-mix(in srgb, var(--sidebar-role-accent) 22%, transparent);\n}\n\n.sidebar-brand:hover .brand-logo-glow {\n  opacity: 0.25;\n}\n\n.brand-logo-svg {\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n\n.brand-copy {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  transition: opacity 220ms ease;\n}\n\n.shop-name {\n  font-family: 'Poppins', sans-serif;\n  font-weight: 700;\n  font-size: 1.05rem;\n  letter-spacing: -0.2px;\n  color: var(--text);\n  line-height: 1.2;\n}\n\n.brand-subtitle {\n  font-family: 'Poppins', sans-serif;\n  font-weight: 500;\n  font-size: 0.72rem;\n  letter-spacing: 0.05em;\n  color: var(--text2);\n  text-transform: uppercase;\n  line-height: 1.1;\n  margin-top: 1px;\n}\n\n.sidebar-toggle-btn {\n  width: 42px;\n  height: 42px;\n  border-radius: 14px;\n  background: var(--sidebar-icon-bg);\n  border: 1px solid var(--sidebar-border);\n  display: grid;\n  place-items: center;\n  color: var(--sidebar-text);\n  cursor: pointer;\n  padding: 0;\n  transition: background 180ms ease, transform 180ms ease, color 180ms ease;\n  outline: none;\n  justify-self: start;\n}\n\n.sidebar-toggle-btn:hover {\n  background: var(--sidebar-icon-hover-bg);\n  color: var(--sidebar-text);\n  transform: translateY(-1px);\n}\n\n.sidebar-toggle-btn svg {\n  width: 22px;\n  height: 22px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 2.2;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n.brand-copy,\n.nav-label,\n.nav-group-text,\n.logout-label,\n.user-role {\n  transition:\n    opacity 180ms ease,\n    transform 180ms ease,\n    max-width 180ms ease;\n}\n\n.sidebar-toggle,\n.sidebar-fab {\n  width: 36px;\n  height: 36px;\n  border-radius: 12px;\n  border: 1px solid var(--sidebar-border);\n  background: var(--sidebar-icon-bg);\n  color: var(--sidebar-text);\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 160ms ease, transform 160ms ease, border-color 160ms ease;\n}\n\n.sidebar-toggle:hover,\n.sidebar-fab:hover {\n  background: var(--sidebar-icon-hover-bg);\n}\n\n.sidebar-toggle svg,\n.sidebar-fab svg,\n.nav-group-chevron svg {\n  width: 18px;\n  height: 18px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 2;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n.sidebar-status {\n  grid-column: 1 / -1;\n  padding: 12px 16px 4px;\n  transition: padding 220ms ease;\n}\n\n.sidebar.collapsed .sidebar-status {\n  display: none;\n}\n\n.user-role {\n  grid-column: 1 / -1;\n  color: var(--sidebar-text);\n  opacity: 0.84;\n  font-size: 0.74rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n}\n\n.sidebar-nav {\n  flex: 1;\n  overflow-y: hidden;\n  overflow-x: hidden;\n  padding: 12px 0;\n  scroll-behavior: smooth;\n}\n\n.sidebar-nav::-webkit-scrollbar {\n  width: 4px;\n}\n\n.sidebar-nav::-webkit-scrollbar-track {\n  background: transparent;\n}\n\n.sidebar-nav::-webkit-scrollbar-thumb {\n  background: var(--sidebar-scrollbar-thumb);\n  border-radius: 999px;\n}\n\n\n\n.nav-section {\n  margin: 0;\n}\n\n.nav-group-label,\n.nav-item {\n  width: 100%;\n  border: 0;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  text-align: left;\n}\n\n.nav-group-label {\n  min-height: 34px;\n  padding: 10px 16px 6px;\n  color: var(--sidebar-role-accent);\n  font-size: 0.72rem;\n  font-weight: 800;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  justify-content: space-between;\n}\n\n.nav-group-chevron {\n  display: inline-flex;\n  color: currentColor;\n  opacity: 0.75;\n  transition: transform 180ms ease;\n}\n\n.nav-group-label[aria-expanded=\"true\"] .nav-group-chevron {\n  transform: rotate(90deg);\n}\n\n.nav-section-items {\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 210ms ease;\n}\n\n.nav-section-items.open {\n  max-height: 360px;\n}\n\n.sidebar.collapsed .nav-group-label {\n  display: none;\n}\n\n.sidebar.collapsed .nav-section-items {\n  max-height: none;\n}\n\n.nav-item {\n  position: relative;\n  min-height: 40px;\n  gap: 12px;\n  padding: 6px 14px;\n  margin: 2px 14px;\n  width: calc(100% - 28px);\n  border-radius: 10px;\n  color: var(--sidebar-text);\n  transition:\n    background 180ms ease,\n    color 180ms ease,\n    transform 180ms ease;\n}\n\n.nav-item:hover {\n  background: var(--sidebar-hover);\n  color: var(--sidebar-role-accent-2);\n  transform: translateX(2px);\n}\n\n.nav-label {\n  font-size: 0.85rem;\n  font-weight: 500;\n  letter-spacing: 0.01em;\n}\n\n.nav-item .icon {\n  width: 36px;\n  height: 36px;\n  min-width: 36px;\n  border-radius: 10px;\n  background: transparent;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 180ms ease, transform 180ms ease, box-shadow 180ms ease;\n}\n\n\n.nav-item .icon svg {\n  width: 20px;\n  height: 20px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 2;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n.nav-item.active {\n  background: #556ee6;\n  color: #ffffff;\n  box-shadow: 0 4px 12px rgba(85, 110, 230, 0.25);\n  font-weight: 600;\n}\n\n.nav-item.active .icon {\n  background: transparent;\n  color: #ffffff;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .nav-item.active {\n  background: #849bf7;\n  color: #111827;\n  box-shadow: 0 4px 16px rgba(132, 155, 247, 0.15);\n  font-weight: 600;\n}\n\n:root[data-theme='dark'] .nav-item.active .icon {\n  background: transparent;\n  color: #111827;\n  box-shadow: none;\n}\n\n.sidebar.collapsed .nav-item {\n  justify-content: center;\n  padding: 0;\n  margin: 2px auto;\n  width: 42px;\n  height: 42px;\n  min-height: 42px;\n}\n\n.sidebar.collapsed .nav-item .icon {\n  margin: 0;\n}\n\n.sidebar.collapsed .nav-item .nav-label {\n  display: none;\n}\n\n.sidebar.collapsed .nav-item::after {\n  content: attr(title);\n  position: absolute;\n  left: 100%;\n  top: 50%;\n  transform: translate(12px, -50%);\n  white-space: nowrap;\n  background: rgba(15, 23, 42, 0.95);\n  color: #f8fafc;\n  padding: 6px 10px;\n  border-radius: 999px;\n  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 150ms ease, transform 150ms ease;\n  z-index: 10;\n  font-size: 0.78rem;\n}\n\n.sidebar.collapsed .nav-item:hover::after {\n  opacity: 1;\n  transform: translate(16px, -50%);\n}\n\n.sidebar-footer {\n  display: grid;\n  gap: 8px;\n  padding: 14px 12px;\n  border-top: 1px solid var(--sidebar-border);\n  background: var(--sidebar-footer-bg);\n  transition: padding 220ms ease, background 220ms ease;\n  position: relative;\n}\n\n.sidebar-footer::before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 12px;\n  right: 12px;\n  height: 1px;\n  background: var(--sidebar-border);\n}\n\n.sidebar.collapsed .sidebar-footer {\n  padding: 12px 0 16px;\n}\n\n.sidebar-user-btn {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  padding: 8px;\n  width: 100%;\n  color: var(--sidebar-text);\n  border-radius: 8px;\n  transition: background 0.2s;\n  text-align: left;\n}\n.sidebar-user-btn:hover {\n  background: var(--sidebar-hover);\n}\n.sidebar-avatar {\n  width: 36px;\n  height: 36px;\n  min-width: 36px;\n  border-radius: 50%;\n  background: var(--accent3);\n  color: var(--accent2);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 600;\n  font-size: 1.05rem;\n}\n.sidebar-user-info {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  overflow: hidden;\n  white-space: nowrap;\n}\n.sidebar-username {\n  font-weight: 600;\n  font-size: 0.95rem;\n}\n.sidebar-userrole {\n  font-size: 0.75rem;\n  color: var(--sidebar-text);\n  opacity: 0.85;\n}\n.sidebar-chevron {\n  width: 16px;\n  height: 16px;\n  opacity: 0.7;\n}\n.sidebar-dropdown-menu {\n  position: absolute;\n  top: 14px;\n  bottom: 14px;\n  left: 60px;\n  right: 12px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  box-shadow: 0 4px 16px rgba(0,0,0,0.12);\n  min-width: 0;\n  padding: 0;\n  z-index: 200;\n}\n.sidebar.collapsed .sidebar-dropdown-menu {\n  top: 8px;\n  bottom: auto;\n  left: calc(100% + 8px);\n  right: auto;\n  padding: 4px;\n  width: max-content;\n}\n.sidebar-logout-action {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  gap: 10px;\n  padding: 0 16px;\n  border: none;\n  background: transparent;\n  color: var(--red);\n  font-weight: 500;\n  cursor: pointer;\n  border-radius: 6px;\n  transition: background 0.2s ease, color 0.2s ease;\n  font-size: 0.95rem;\n}\n.sidebar-logout-action:hover {\n  background: var(--danger-soft);\n}\n.sidebar.collapsed .sidebar-logout-action {\n  padding: 8px 16px;\n}\n\n.sidebar.collapsed {\n  box-shadow: 2px 0 12px rgba(15, 23, 42, 0.05);\n}\n\n.sidebar.collapsed .sidebar-brand {\n  grid-template-columns: 1fr;\n  justify-items: center;\n  padding: 14px 8px;\n}\n\n\n\n.sidebar.collapsed .sidebar-toggle {\n  order: -1;\n}\n\n.sidebar.collapsed .brand-copy,\n.sidebar.collapsed .nav-label,\n.sidebar.collapsed .nav-group-text,\n.sidebar.collapsed .nav-group-chevron,\n.sidebar.collapsed .sidebar-user-info,\n.sidebar.collapsed .sidebar-chevron,\n.sidebar.collapsed .user-role {\n  max-width: 0;\n  opacity: 0;\n  overflow: hidden;\n  transform: translateX(-6px);\n  pointer-events: none;\n}\n\n.sidebar.collapsed .nav-group-label {\n  min-height: 8px;\n  padding: 4px 0;\n  pointer-events: none;\n}\n\n.sidebar.collapsed .nav-item {\n  justify-content: center;\n  gap: 0;\n  padding: 10px 0;\n  margin: 4px 10px;\n  width: calc(100% - 20px);\n}\n\n.sidebar.collapsed .sidebar-footer {\n  padding: 10px 8px;\n}\n\n.sidebar.collapsed .sidebar-user-btn {\n  justify-content: center;\n  padding: 8px 0;\n}\n\n.sidebar-overlay {\n  display: none;\n}\n\n.sidebar-fab {\n  display: none;\n  position: fixed;\n  top: 12px;\n  left: 12px;\n  z-index: 150;\n  background: var(--sidebar-role-accent, var(--blue));\n  border-color: transparent;\n  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.2);\n}\n\n@media (max-width: 900px) {\n  .sidebar {\n    width: min(84vw, var(--sidebar));\n    transform: translateX(-105%);\n  }\n\n  .sidebar.mobile-open {\n    transform: translateX(0);\n  }\n\n  .sidebar-fab {\n    display: inline-flex;\n  }\n\n  .sidebar-overlay {\n    display: block;\n    position: fixed;\n    inset: 0;\n    border: 0;\n    background: rgba(15, 23, 42, 0.42);\n    z-index: 110;\n    cursor: default;\n  }\n\n  .sidebar-brand {\n    min-height: 118px;\n  }\n}\n\n/* ─── Ant Design Menu overrides for dark sidebar ─── */\n\n.antd-sidebar-nav {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  scroll-behavior: smooth;\n}\n\n.antd-sidebar-nav::-webkit-scrollbar { width: 4px; }\n.antd-sidebar-nav::-webkit-scrollbar-track { background: transparent; }\n.antd-sidebar-nav::-webkit-scrollbar-thumb {\n  background: var(--sidebar-scrollbar-thumb);\n  border-radius: 999px;\n}\n\n/* Reset antd Menu background */\n.sidebar-antd-menu,\n.sidebar-antd-menu.ant-menu-inline,\n.sidebar-antd-menu.ant-menu-inline-collapsed {\n  background: transparent !important;\n  border-inline-end: none !important;\n  padding: 4px 0;\n}\n\n/* Group label (section header) */\n.sidebar-antd-menu .ant-menu-item-group-title {\n  color: var(--sidebar-role-accent, #2563eb) !important;\n  font-size: 0.72rem !important;\n  font-weight: 800 !important;\n  letter-spacing: 0.08em !important;\n  text-transform: uppercase !important;\n  padding: 10px 16px 6px !important;\n}\n\n.sidebar.collapsed .sidebar-antd-menu .ant-menu-item-group-title {\n  display: none !important;\n}\n\n/* Nav item */\n.sidebar-antd-menu .ant-menu-item {\n  margin: 2px 14px !important;\n  width: calc(100% - 28px) !important;\n  border-radius: 10px !important;\n  height: 40px !important;\n  line-height: 40px !important;\n  color: var(--sidebar-text) !important;\n  transition: background 180ms ease, color 180ms ease, transform 180ms ease !important;\n  display: flex !important;\n  align-items: center !important;\n  padding-inline: 14px !important;\n}\n\n.sidebar-antd-menu .ant-menu-item:hover {\n  background: var(--sidebar-hover) !important;\n  color: #ffffff !important;\n  transform: translateX(2px);\n}\n\n/* Active / selected item */\n.sidebar-antd-menu .ant-menu-item-selected {\n  background: var(--sidebar-role-accent) !important;\n  color: #ffffff !important;\n  box-shadow: 0 4px 12px color-mix(in srgb, var(--sidebar-role-accent) 28%, transparent) !important;\n  font-weight: 600 !important;\n}\n\n:root[data-theme='dark'] .sidebar-antd-menu .ant-menu-item-selected {\n  background: var(--sidebar-role-accent) !important;\n  color: #ffffff !important;\n  box-shadow: 0 4px 16px rgba(85, 110, 230, 0.24) !important;\n}\n\n.sidebar-antd-menu .ant-menu-item-selected::after {\n  display: none !important;\n}\n\n/* Icons */\n.sidebar-antd-menu .ant-menu-item .ant-menu-item-icon {\n  font-size: 18px !important;\n  min-width: 36px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n}\n\n/* Label text */\n.sidebar-antd-menu .ant-menu-title-content {\n  font-size: 0.85rem !important;\n  font-weight: 500 !important;\n  letter-spacing: 0.01em !important;\n  color: inherit !important;\n}\n\n/* Collapsed state */\n.sidebar.collapsed .sidebar-antd-menu .ant-menu-item {\n  margin: 2px auto !important;\n  width: 42px !important;\n  height: 42px !important;\n  padding: 0 !important;\n  justify-content: center !important;\n  border-radius: 10px !important;\n}\n\n.sidebar.collapsed .sidebar-antd-menu .ant-menu-item .ant-menu-title-content {\n  display: none !important;\n}\n\n/* Suppress antd collapsed tooltip (we use title attribute) */\n.ant-menu-inline-collapsed-tooltip { display: none !important; }";

if (typeof document !== "undefined" && !document.getElementById("combined-sidebar-styles")) {
  const style = document.createElement("style");
  style.id = "combined-sidebar-styles";
  style.textContent = sidebarStyles;
  document.head.appendChild(style);
}

const sidebarInteractionFixStyles = `
.sidebar-antd-menu .ant-menu-item:hover {
  background: rgba(85, 110, 230, 0.10) !important;
  color: var(--sidebar-role-accent) !important;
  transform: translateX(2px);
}

.sidebar-antd-menu .ant-menu-item-selected,
.sidebar-antd-menu .ant-menu-item-selected:hover,
.sidebar-antd-menu .ant-menu-item-selected.ant-menu-item-active {
  background: var(--sidebar-role-accent) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--sidebar-role-accent) 28%, transparent) !important;
  font-weight: 600 !important;
  transform: none !important;
}

:root[data-theme='dark'] .sidebar-antd-menu .ant-menu-item:hover {
  background: rgba(132, 155, 247, 0.14) !important;
  color: #ffffff !important;
}

:root[data-theme='dark'] .sidebar-antd-menu .ant-menu-item-selected,
:root[data-theme='dark'] .sidebar-antd-menu .ant-menu-item-selected:hover,
:root[data-theme='dark'] .sidebar-antd-menu .ant-menu-item-selected.ant-menu-item-active {
  background: var(--sidebar-role-accent) !important;
  color: #ffffff !important;
}
`;

if (typeof document !== "undefined" && !document.getElementById("sidebar-interaction-fix-styles")) {
  const style = document.createElement("style");
  style.id = "sidebar-interaction-fix-styles";
  style.textContent = sidebarInteractionFixStyles;
  document.head.appendChild(style);
}

const sidebarMobileFabStyles = `
.sidebar-fab .anticon,
.sidebar-fab svg {
  color: #ffffff !important;
  fill: currentColor !important;
  font-size: 15px !important;
}

.sidebar-fab {
  width: 36px !important;
  height: 36px !important;
  top: 15px !important;
  left: 14px !important;
  border-radius: 10px !important;
  color: #ffffff !important;
}
`;

if (typeof document !== "undefined" && !document.getElementById("sidebar-mobile-fab-styles")) {
  const style = document.createElement("style");
  style.id = "sidebar-mobile-fab-styles";
  style.textContent = sidebarMobileFabStyles;
  document.head.appendChild(style);
}

function isVisible(item, user) {
  return typeof item.visible === 'function' ? item.visible(user) : true;
}

function filterMenuForUser(menu, user) {
  return menu
    .filter((section) => isVisible(section, user))
    .map((section) => ({
      ...section,
      children: (section.children || []).filter((item) => isVisible(item, user))
    }))
    .filter((section) => section.children.length > 0);
}

/** Build antd Menu items array from filtered sidebarMenu */
function buildMenuItems(menu) {
  return menu.map((section) => ({
    key: section.id,
    type: 'group',
    label: section.label,
    children: section.children.map((item) => ({
      key: item.id,
      icon: ICON_MAP[item.icon] ?? null,
      label: item.label,
    })),
  }));
}

export default function Sidebar({ currentPage, setCurrentPage, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    closeMobileSidebar,
    isCollapsed,
    isExpanded,
    isMobile,
    isMobileOpen,
    toggleMobileSidebar,
  } = useSidebar();

  const roleLayout = getRoleLayout(user);

  const menu = useMemo(() => filterMenuForUser(getSidebarMenu(user), user), [user]);
  const menuItems = useMemo(() => buildMenuItems(menu), [menu]);

  const handleNavigate = useCallback(({ key }) => {
    setCurrentPage(key);
    if (isMobile) closeMobileSidebar();
    setDropdownOpen(false);
  }, [closeMobileSidebar, isMobile, setCurrentPage]);

  const handleLogout = useCallback(() => {
    closeMobileSidebar();
    onLogout();
  }, [closeMobileSidebar, onLogout]);

  return (
    <>
      {/* Mobile FAB toggle */}
      <button
        className="sidebar-fab"
        type="button"
        onClick={toggleMobileSidebar}
        aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {isMobileOpen
          ? <MenuFoldOutlined style={{ fontSize: 15, color: '#fff' }} />
          : <MenuUnfoldOutlined style={{ fontSize: 15, color: '#fff' }} />
        }
      </button>

      {isMobileOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          onClick={closeMobileSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${isMobileOpen ? 'mobile-open' : ''}`}
        data-role={roleLayout.key}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <div className="brand-logo-glow" />
            <svg className="brand-logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 4 9 4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 9 12 2 12 2Z" fill="url(#brandGrad)" />
              <path d="M12 5C12 5 7 10.5 7 14C7 16.7614 9.23858 19 12 19C14.7614 19 17 16.7614 17 14C17 10.5 12 5 12 5z" fill="rgba(255, 255, 255, 0.25)" />
              <defs>
                <linearGradient id="brandGrad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--accent)" />
                  <stop offset="1" stopColor="var(--accent2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-copy">
            <span className="shop-name">Sri Nikil</span>
            <span className="brand-subtitle">{roleLayout.label} Layout</span>
          </div>
        </div>

        {/* Ant Design Menu */}
        <nav className="sidebar-nav antd-sidebar-nav" aria-label="Primary navigation">
          <Menu
            mode="inline"
            inlineCollapsed={isCollapsed}
            selectedKeys={[currentPage]}
            onClick={handleNavigate}
            items={menuItems}
            className="sidebar-antd-menu"
          />
        </nav>

        {/* Footer — user + logout */}
        <div className="sidebar-footer">
          <button
            className="sidebar-user-btn"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <div className="sidebar-avatar">
              {user?.user ? user.user.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user?.user || 'User'}</span>
              <span className="sidebar-userrole">
                {roleLayout.accessLabel}
              </span>
            </div>
            <svg
              className="sidebar-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="sidebar-dropdown-menu">
              <button className="sidebar-logout-action" onClick={handleLogout}>
                <PoweroffOutlined style={{ fontSize: 16, color: '#ff8a8a' }} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
