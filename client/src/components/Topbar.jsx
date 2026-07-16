import React, { useEffect, useState, useRef } from 'react';
import ClearConfirmModal from './ClearConfirmModal';
import { useTheme } from '../context/useTheme';
import './Topbar.css';

const THEME_BUTTONS = [
  {
    id: 'light',
    label: 'Light theme',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    )
  },
  {
    id: 'dark',
    label: 'Dark theme',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A8.5 8.5 0 1 1 11.21 3 6.5 6.5 0 0 0 21 12.79Z" />
      </svg>
    )
  },
  {
    id: 'system',
    label: 'System default theme',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8" />
        <path d="M12 16v4" />
      </svg>
    )
  }
];

function isClearedSessionError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return (
    message.includes('validation failed') ||
    message.includes('unable to end shift') ||
    message.includes('not found') ||
    message.includes('foreign key') ||
    message.includes('constraint')
  );
}

export default function Topbar({ user, erp, session, setUser, setSession, onLogout }) {
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
  const { effectiveTheme, setTheme, theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isEndingShift, setIsEndingShift] = useState(false);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [canStartNextShift, setCanStartNextShift] = useState(false);
  const [showNextShiftPrompt, setShowNextShiftPrompt] = useState(false);
  const [shiftActive, setShiftActive] = useState(() => Boolean(user?.loginTime));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!shiftActive || !user?.loginTime) return;
    const lowerRole = user?.role?.toLowerCase();
    if (lowerRole === 'admin') return;

    const loginTimestamp = new Date(user.loginTime).getTime();
    if (Number.isNaN(loginTimestamp)) return;

    const elapsedMs = currentTime - loginTimestamp;
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    if (elapsedMs >= twelveHoursMs) {
      setShiftActive(false);
      if (onLogout) {
        onLogout();
      }
      alert('Your 12-hour shift has expired. You have been logged out.');
    }
  }, [currentTime, shiftActive, user?.loginTime, user?.role, onLogout]);

  const formatShiftDuration = () => {
    if (!shiftActive) {
      return '00:00:00';
    }

    const loginTimeValue = user?.loginTime;
    if (!loginTimeValue) {
      return '00:00:00';
    }

    const loginTimestamp = new Date(loginTimeValue).getTime();
    if (Number.isNaN(loginTimestamp)) {
      return '00:00:00';
    }

    const elapsedSeconds = Math.max(0, Math.floor((currentTime - loginTimestamp) / 1000));
    const lowerRole = user?.role?.toLowerCase();

    if (lowerRole === 'admin') {
      const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(elapsedSeconds % 60).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    } else {
      // Countdown from 12 hours (43200 seconds)
      const totalShiftSeconds = 12 * 3600;
      const remainingSeconds = Math.max(0, totalShiftSeconds - elapsedSeconds);
      const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(remainingSeconds % 60).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  };

  const startNextShift = async () => {
    if (!erp || !user) {
      return;
    }

    setIsStartingShift(true);
    try {
      const response = await erp.startShift({
        user: user.user,
        role: user.role,
        shiftStart: new Date().toISOString()
      });

      const nextLoginTime = response?.shiftStart || new Date().toISOString();
      const nextSessionId = response?.sessionId || null;
      const nextUser = {
        ...user,
        loginTime: nextLoginTime
      };

      setUser(nextUser);
      localStorage.setItem('sri_nikil_user', JSON.stringify(nextUser));
      setSession(nextSessionId ? {
        id: nextSessionId,
        user: user.user,
        role: user.role,
        loginTime: nextLoginTime,
        logoutTime: null
      } : null);
      setShiftActive(true);
      setCanStartNextShift(false);
      setShowNextShiftPrompt(false);
      alert(response?.message || 'Next shift started successfully');
    } catch (error) {
      alert(error.message || 'Failed to start next shift');
    } finally {
      setIsStartingShift(false);
    }
  };

  const endShift = async () => {
    if (!erp || !user) {
      return;
    }

    setIsEndingShift(true);
    setShiftActive(false);
    try {
      const response = await erp.endShift({
        user: user.user,
        role: user.role,
        sessionId: session?.id,
        shiftStart: user.loginTime
      });

      const closedUser = {
        ...user,
        loginTime: null
      };

      setUser(closedUser);
      localStorage.setItem('sri_nikil_user', JSON.stringify(closedUser));
      setSession(null);
      setCanStartNextShift(Boolean(response?.promptNextShift));
      alert(response?.message || 'Shift closed and report sent successfully');

      if (response?.promptNextShift) {
        setShowNextShiftPrompt(true);
      } else {
        const lowerRole = user?.role?.toLowerCase();
        if (lowerRole === 'manager') {
          if (onLogout) {
            onLogout();
          }
        }
      }
    } catch (error) {
      if (isClearedSessionError(error)) {
        const closedUser = {
          ...user,
          loginTime: null
        };
        const lowerRole = user?.role?.toLowerCase();

        setUser(closedUser);
        localStorage.setItem('sri_nikil_user', JSON.stringify(closedUser));
        setSession(null);
        setCanStartNextShift(lowerRole === 'staff');

        if (lowerRole === 'staff') {
          setShowNextShiftPrompt(true);
          alert('Old shift history was cleared. Shift closed locally; you can start the next shift.');
        } else if (lowerRole === 'manager' && onLogout) {
          onLogout();
        } else {
          alert('Old shift history was cleared. Shift closed locally.');
        }
        return;
      }

      alert(error.message || 'Failed to close shift');
      setShiftActive(true);
    } finally {
      setIsEndingShift(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (canStartNextShift) {
      await startNextShift();
      return;
    }

    await endShift();
  };

  const primaryButtonLabel = canStartNextShift ? 'Next Shift' : 'End Shift';
  const isBusy = isEndingShift || isStartingShift;

  const showShiftWrap = ['admin', 'manager', 'staff'].includes(user?.role?.toLowerCase());

  return (
    <>
      <div className="topbar">
        {showShiftWrap && (
          <div className="shift-action-wrap">
            <span className="shift-duration">{formatShiftDuration()}</span>
            <button className="overall-report-btn" onClick={handlePrimaryAction} disabled={isBusy}>
              <span>
                {isEndingShift ? 'Closing...' : isStartingShift ? 'Starting...' : primaryButtonLabel}
              </span>
              <span className="icon" style={{ display: 'flex', alignItems: 'center' }}>
                {canStartNextShift ? '\u{23ED}' : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                    <path d="M20 3a2 2 0 0 0-1.437 1.437L17 10l-1.563-5.563A2 2 0 0 0 14 3l3 1.5L20 3z" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        )}
        <div className="topbar-project-title">
          Sri Nikil Trading Dashboard
        </div>

        <div className="topbar-right">
          <div className="theme-switcher" role="group" aria-label="Theme switcher">
            {THEME_BUTTONS.map((item) => {
              const isActive = theme === item.id;

              return (
                <button
                  key={item.id}
                  className={`theme-switcher-btn ${isActive ? 'active' : ''}`}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={isActive}
                  data-effective={item.id === 'system' ? effectiveTheme : item.id}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>



          <div className="avatar-dropdown" ref={dropdownRef}>
            <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="avatar-circle">
                {user?.user ? user.user.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="avatar-name">{user?.user || 'User'}</span>
              <svg className="avatar-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {dropdownOpen && (
              <div className="avatar-menu">
                <button className="avatar-menu-item" onClick={() => { setDropdownOpen(false); if (onLogout) onLogout(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', color: 'var(--red)', opacity: 0.8 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <ClearConfirmModal
        open={showNextShiftPrompt}
        title="Start Next Shift"
        message="Do you want to start the next shift?"
        confirmLabel={isStartingShift ? 'Starting...' : 'Start Shift'}
        loading={isStartingShift}
        onConfirm={startNextShift}
        onClose={() => {
          if (!isStartingShift) {
            setShowNextShiftPrompt(false);
            if (onLogout) {
              onLogout();
            }
          }
        }}
      />
    </>
  );
}
