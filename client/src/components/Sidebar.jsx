import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { sidebarMenu } from '../config/sidebarMenu';
import { useSidebar } from '../context/useSidebar';
import { hasAdminAccess } from '../utils/roles';
import './Sidebar.css';

function SidebarIcon({ name }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="5" rx="2" />
          <rect x="13" y="10" width="8" height="11" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
        </svg>
      );
    case 'billing':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2Z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );
    case 'products':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
          <path d="m12 12 8-4.5" />
          <path d="m12 12-8-4.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case 'stock':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
          <path d="M7 5v4" />
          <path d="M12 10v4" />
          <path d="M17 15v4" />
        </svg>
      );
    case 'pricing':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 13V7a2 2 0 0 0-2-2h-6l-8 8 7 7 8-8Z" />
          <path d="M15 9h.01" />
        </svg>
      );
    case 'priceboard':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5h14v11H5z" />
          <path d="M9 16v3" />
          <path d="M15 16v3" />
          <path d="M8 9h8" />
          <path d="M8 12h5" />
        </svg>
      );
    case 'sales':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19V9" />
          <path d="M12 19V5" />
          <path d="M19 19v-7" />
          <path d="M3 19h18" />
        </svg>
      );
    case 'customers':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 19a4 4 0 0 0-8 0" />
          <circle cx="12" cy="11" r="3" />
          <path d="M5 19a3 3 0 0 1 2-2.82" />
          <path d="M19 19a3 3 0 0 0-2.82-2.82" />
          <path d="M7.5 10a2.5 2.5 0 1 0-1.5-4.5" />
          <path d="M16.5 10A2.5 2.5 0 1 1 18 5.5" />
        </svg>
      );
    case 'reports':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      );
    case 'loginlog':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
        </svg>
      );
    case 'chevron':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path stroke="none" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
        </svg>
      );
    case 'drawer':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M4 12h16" />
        </svg>
      );
    case 'theme':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v2" />
          <path d="M12 19v2" />
          <path d="M3 12h2" />
          <path d="M19 12h2" />
          <path d="m5.6 5.6 1.4 1.4" />
          <path d="m17 17 1.4 1.4" />
          <path d="m18.4 5.6-1.4 1.4" />
          <path d="m7 17-1.4 1.4" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    default:
      return null;
  }
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

const NavItem = memo(function NavItem({ item, isActive, isCollapsed, onNavigate }) {
  return (
    <button
      className={`nav-item ${isActive ? 'active' : ''}`}
      type="button"
      onClick={() => onNavigate(item.id)}
      title={isCollapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="icon"><SidebarIcon name={item.icon} /></span>
      <span className="nav-label">{item.label}</span>
    </button>
  );
});

const SidebarSection = memo(function SidebarSection({
  currentPage,
  isCollapsed,
  onNavigate,
  section
}) {
  return (
    <div className="nav-section">
      <div className="nav-section-items open" style={{ maxHeight: 'none', opacity: 1, visibility: 'visible', paddingBottom: '4px' }}>
        {section.children.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={currentPage === item.id}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
});

export default function Sidebar({ currentPage, setCurrentPage, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    closeMobileSidebar,
    isCollapsed,
    isExpanded,
    isMobile,
    isMobileOpen,
    toggleMobileSidebar
  } = useSidebar();
  const role = user?.role || 'Staff';
  const canManageAdminPages = hasAdminAccess(role);
  const isManager = role === 'Manager';
  const sidebarRole = canManageAdminPages
    ? (isManager ? 'manager' : 'admin')
    : 'staff';

  const menu = useMemo(() => filterMenuForUser(sidebarMenu, user), [user]);
  const handleNavigate = useCallback((pageId) => {
    setCurrentPage(pageId);
    if (isMobile) {
      closeMobileSidebar();
    }
  }, [closeMobileSidebar, isMobile, setCurrentPage]);

  const handleLogout = useCallback(() => {
    closeMobileSidebar();
    onLogout();
  }, [closeMobileSidebar, onLogout]);

  return (
    <>
      <button
        className="sidebar-fab"
        type="button"
        onClick={toggleMobileSidebar}
        aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        <SidebarIcon name={isMobileOpen ? 'close' : 'drawer'} />
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
        data-role={sidebarRole}
      >
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
            <span className="brand-subtitle">Tradings</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {menu.map((section) => (
            <SidebarSection
              key={section.id}
              currentPage={currentPage}
              isCollapsed={isCollapsed}
              onNavigate={handleNavigate}
              section={section}
            />
          ))}
        </nav>

        <div className="sidebar-footer" ref={dropdownRef}>
          <button className="sidebar-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="sidebar-avatar">
              {user?.user ? user.user.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user?.user || 'User'}</span>
              <span className="sidebar-userrole">{role.toLowerCase() === 'admin' ? 'Full Access' : role}</span>
            </div>
            <svg className="sidebar-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="sidebar-dropdown-menu">
              <button className="sidebar-logout-action" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', color: '#ff8a8a', opacity: 0.9 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
