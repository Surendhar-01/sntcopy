import React, { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Segmented, Tooltip, Space } from 'antd';
import {
  BulbOutlined,
  MoonOutlined,
  DesktopOutlined,
  UserOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import ClearConfirmModal from './ClearConfirmModal';
import { useTheme } from '../context/useTheme';
import { normalizeRole, USER_ROLES } from '../utils/roles';
import './Topbar.css';

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

function getEndShiftMessage(response) {
  if (response?.emailStatus === 'sent' && response?.attachmentCount > 0) {
    return `Shift closed and report sent successfully. Excel attached: ${response.attachmentName || 'Shift report'}`;
  }

  if (response?.emailStatus === 'failed' && response?.emailError) {
    return `Shift closed, but mail failed: ${response.emailError}`;
  }

  if (response?.emailStatus === 'skipped' && response?.emailError) {
    return `Shift closed, but mail was not sent: ${response.emailError}`;
  }

  return response?.message || 'Shift closed and report sent successfully';
}

export default function Topbar({ user, roleLayout, erp, session, setUser, setSession, onLogout }) {
  const { setTheme, theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isEndingShift, setIsEndingShift] = useState(false);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [canStartNextShift, setCanStartNextShift] = useState(false);
  const [showNextShiftPrompt, setShowNextShiftPrompt] = useState(false);
  const [shiftActive, setShiftActive] = useState(() => Boolean(user?.loginTime));

  useEffect(() => {
    const id = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!shiftActive || !user?.loginTime) return;
    const lowerRole = normalizeRole(user?.role);
    if (lowerRole === USER_ROLES.ADMIN) return;

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
    if (!shiftActive) return '00:00:00';
    const loginTimeValue = user?.loginTime;
    if (!loginTimeValue) return '00:00:00';

    const loginTimestamp = new Date(loginTimeValue).getTime();
    if (Number.isNaN(loginTimestamp)) return '00:00:00';

    const elapsedSeconds = Math.max(0, Math.floor((currentTime - loginTimestamp) / 1000));
    const lowerRole = normalizeRole(user?.role);

    if (lowerRole === USER_ROLES.ADMIN) {
      const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(elapsedSeconds % 60).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    } else {
      const totalShiftSeconds = 12 * 3600;
      const remainingSeconds = Math.max(0, totalShiftSeconds - elapsedSeconds);
      const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(remainingSeconds % 60).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  };

  const startNextShift = async () => {
    if (!erp || !user) return;
    setIsStartingShift(true);
    try {
      const response = await erp.startShift({
        user: user.user,
        role: user.role,
        shiftStart: new Date().toISOString()
      });
      const nextLoginTime = response?.shiftStart || new Date().toISOString();
      const nextSessionId = response?.sessionId || null;
      const nextUser = { ...user, loginTime: nextLoginTime };
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
    if (!erp || !user) return;
    setIsEndingShift(true);
    setShiftActive(false);
    try {
      const response = await erp.endShift({
        user: user.user,
        role: user.role,
        sessionId: session?.id,
        shiftStart: user.loginTime
      });
      const closedUser = { ...user, loginTime: null };
      setUser(closedUser);
      localStorage.setItem('sri_nikil_user', JSON.stringify(closedUser));
      setSession(null);
      setCanStartNextShift(Boolean(response?.promptNextShift));
      alert(getEndShiftMessage(response));
      
      const lowerRole = normalizeRole(user?.role);

      // Refresh the local App state so Today Bills and Sales immediately become 0
      // User wanted this to only happen for Admins (avoid "admin maari dashboard changes")
      if (lowerRole === USER_ROLES.ADMIN) {
        localStorage.setItem('snt_last_shift_end', new Date().toISOString());
        if (typeof erp?.refreshData === 'function') {
          erp.refreshData({ showLoading: true }).catch(console.error);
        }
      }

      if (response?.promptNextShift || lowerRole === USER_ROLES.STAFF) {
        setShowNextShiftPrompt(true);
      } else {
        if (lowerRole === USER_ROLES.MANAGER && onLogout) onLogout();
      }
    } catch (error) {
      if (isClearedSessionError(error)) {
        const closedUser = { ...user, loginTime: null };
        const lowerRole = normalizeRole(user?.role);
        setUser(closedUser);
        localStorage.setItem('sri_nikil_user', JSON.stringify(closedUser));
        setSession(null);
        setCanStartNextShift(lowerRole === USER_ROLES.STAFF);
        if (lowerRole === USER_ROLES.STAFF) {
          setShowNextShiftPrompt(true);
          alert('Old shift history was cleared. Shift closed locally; you can start the next shift.');
        } else if (lowerRole === USER_ROLES.MANAGER && onLogout) {
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
    } else {
      await endShift();
    }
  };

  const primaryButtonLabel = canStartNextShift ? 'Next Shift' : 'End Shift';
  const isBusy = isEndingShift || isStartingShift;
  const showShiftWrap = Object.values(USER_ROLES).includes(normalizeRole(user?.role));

  /* ── Theme Segmented options ── */
  const themeOptions = [
    {
      value: 'light',
      label: (
        <Tooltip title="Light theme">
          <BulbOutlined />
        </Tooltip>
      ),
    },
    {
      value: 'dark',
      label: (
        <Tooltip title="Dark theme">
          <MoonOutlined />
        </Tooltip>
      ),
    },
    {
      value: 'system',
      label: (
        <Tooltip title="System default">
          <DesktopOutlined />
        </Tooltip>
      ),
    },
  ];

  /* ── Avatar dropdown items ── */
  const avatarMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ff8a8a' }} />,
      label: <span style={{ color: 'var(--red, #ef4444)' }}>Logout</span>,
      onClick: () => { if (onLogout) onLogout(); },
    },
  ];

  const avatarInitial = user?.user ? user.user.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <div className="topbar" data-role={roleLayout?.key || USER_ROLES.STAFF}>
        {/* Shift controls */}
        {showShiftWrap && (
          <div className="shift-action-wrap">
            <span className="shift-duration">{formatShiftDuration()}</span>
            <Button
              className="antd-shift-btn"
              shape="round"
              disabled={isBusy}
              onClick={handlePrimaryAction}
              icon={canStartNextShift ? <PlayCircleOutlined /> : <ThunderboltOutlined />}
              loading={isBusy}
            >
              {isEndingShift ? 'Closing...' : isStartingShift ? 'Starting...' : primaryButtonLabel}
            </Button>
          </div>
        )}

        {/* Center title */}
        <div className="topbar-project-title">
          <span>{roleLayout?.title || 'Sri Nikil Trading Dashboard'}</span>
          <small>{roleLayout?.subtitle || 'Business workspace'}</small>
        </div>

        {/* Right section */}
        <div className="topbar-right">
          {/* Theme switcher */}
          <Segmented
            value={theme}
            onChange={setTheme}
            options={themeOptions}
            className="antd-theme-segmented"
          />

          {/* User avatar + dropdown */}
          <Dropdown
            menu={{ items: avatarMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            classNames={{ root: 'antd-topbar-dropdown' }}
          >
            <Button
              type="text"
              className="antd-avatar-btn"
            >
              <Space size={6}>
                <Avatar
                  size={30}
                  className="antd-topbar-avatar"
                  icon={<UserOutlined />}
                >
                  {avatarInitial}
                </Avatar>
                <span className="avatar-name">{user?.user || 'User'}</span>
              </Space>
            </Button>
          </Dropdown>
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
            if (onLogout) onLogout();
          }
        }}
      />
    </>
  );
}
