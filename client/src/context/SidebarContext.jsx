import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SidebarContext as SidebarContextValue } from './useSidebar';

const MOBILE_MEDIA_QUERY = '(max-width: 900px)';

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MEDIA_QUERY).matches : false
  ));

  const isExpanded = isMobile ? isMobileOpen : !isCollapsed;
  const isCollapsedForView = !isMobile && isCollapsed;

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const updateMobileState = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    updateMobileState();
    mediaQuery.addEventListener('change', updateMobileState);
    return () => mediaQuery.removeEventListener('change', updateMobileState);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-current',
      isMobile ? '0px' : (isExpanded ? 'var(--sidebar)' : 'var(--sidebar-collapsed)')
    );
  }, [isExpanded, isMobile]);

  const toggleMobileSidebar = useCallback(() => {
    if (!isMobile) {
      return;
    }

    setIsMobileOpen((current) => !current);
  }, [isMobile]);

  const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), []);
  const setMobileSidebarOpen = useCallback((open) => setIsMobileOpen(Boolean(open)), []);
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((current) => !current);
      return;
    }

    setIsCollapsed((current) => !current);
  }, [isMobile]);

  const value = useMemo(() => ({
    closeMobileSidebar,
    isCollapsed: isCollapsedForView,
    isExpanded,
    isMobile,
    isMobileOpen,
    setMobileSidebarOpen,
    toggleMobileSidebar,
    toggleSidebar,
    togglePin: toggleSidebar
  }), [
    closeMobileSidebar,
    isCollapsedForView,
    isExpanded,
    isMobile,
    isMobileOpen,
    setMobileSidebarOpen,
    toggleMobileSidebar,
    toggleSidebar
  ]);

  return (
    <SidebarContextValue.Provider value={value}>
      {children}
    </SidebarContextValue.Provider>
  );
}
