import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SidebarContext as SidebarContextValue } from './useSidebar';

const SIDEBAR_PIN_KEY = 'sri_nikil_sidebar_pinned';
const MOBILE_MEDIA_QUERY = '(max-width: 900px)';

function readStoredSidebarPinned() {
  try {
    return localStorage.getItem(SIDEBAR_PIN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function SidebarProvider({ children }) {
  const [isPinned, setIsPinned] = useState(readStoredSidebarPinned);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MEDIA_QUERY).matches : false
  ));

  const isExpanded = isMobile ? isMobileOpen : isPinned || isHovering;
  const isCollapsed = !isMobile && !isExpanded;

  useEffect(() => {
    localStorage.setItem(SIDEBAR_PIN_KEY, String(isPinned));
  }, [isPinned]);

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
  const togglePin = useCallback(() => setIsPinned((current) => !current), []);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !isPinned) {
      setIsHovering(true);
    }
  }, [isMobile, isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isPinned) {
      setIsHovering(false);
    }
  }, [isMobile, isPinned]);

  const value = useMemo(() => ({
    closeMobileSidebar,
    handleMouseEnter,
    handleMouseLeave,
    isCollapsed,
    isExpanded,
    isHovering,
    isMobile,
    isMobileOpen,
    isPinned,
    toggleMobileSidebar,
    togglePin
  }), [
    closeMobileSidebar,
    handleMouseEnter,
    handleMouseLeave,
    isCollapsed,
    isExpanded,
    isHovering,
    isMobile,
    isMobileOpen,
    isPinned,
    toggleMobileSidebar,
    togglePin
  ]);

  return (
    <SidebarContextValue.Provider value={value}>
      {children}
    </SidebarContextValue.Provider>
  );
}
