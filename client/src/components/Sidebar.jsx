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
import './Sidebar.css';

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
          ? <MenuFoldOutlined style={{ fontSize: 18, color: '#fff' }} />
          : <MenuUnfoldOutlined style={{ fontSize: 18, color: '#fff' }} />
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
