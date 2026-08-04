import React, { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Segmented, Tooltip, Space } from 'antd';
import {
  BulbOutlined,
  MoonOutlined,
  DesktopOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import ClearConfirmModal from './ClearConfirmModal';
import { useTheme } from '../context/useTheme';
import { normalizeRole, USER_ROLES } from '../utils/roles';

const topbarStyles = ".topbar {\n  --topbar-role-accent: #f97316;\n  background: var(--bg2);\n  border-bottom: 1px solid var(--border);\n  padding: 8px 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  position: sticky;\n  top: 0;\n  z-index: 50;\n  box-shadow: 0 1px 4px rgba(0,0,0,.05);\n  transition: background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease;\n}\n.topbar[data-role=\"admin\"] { --topbar-role-accent: #2563eb; }\n.topbar[data-role=\"manager\"] { --topbar-role-accent: #0f766e; }\n.topbar[data-role=\"staff\"] { --topbar-role-accent: #c2410c; }\n.topbar-title { font-size: 1.4rem; font-weight: 700; letter-spacing: 1px; }\n.topbar-project-title {\n  position: absolute;\n  left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 1px;\n  font-size: 1.08rem;\n  font-weight: 600;\n  color: var(--text);\n  white-space: nowrap;\n  line-height: 1.15;\n}\n.topbar-project-title small {\n  color: var(--topbar-role-accent);\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0;\n}\n.topbar-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }\n.theme-switcher {\n  display: inline-flex;\n  align-items: center;\n  gap: 2px;\n  padding: 3px;\n  background: var(--bg3);\n  border: 1px solid var(--border);\n  border-radius: 0px;\n  transition: background-color 220ms ease, border-color 220ms ease;\n}\n\n.theme-switcher-btn {\n  width: 32px;\n  height: 26px;\n  border: 0;\n  border-radius: 0px;\n  background: transparent;\n  color: var(--text3);\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease;\n}\n\n.theme-switcher-btn svg {\n  width: 14px;\n  height: 14px;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 2;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n.theme-switcher-btn:hover {\n  color: var(--text);\n}\n\n.theme-switcher-btn.active {\n  background: #8b9ef8;\n  color: #111827;\n  box-shadow: none;\n}\n\n.shift-action-wrap { display: flex; align-items: center; gap: 8px; }\n.shift-duration { font-size: .8rem; font-weight: 700; color: var(--text2); white-space: nowrap; }\n.avatar-dropdown { position: relative; display: inline-flex; }\n.avatar-btn {\n  display: flex; align-items: center; gap: 8px;\n  background: transparent; border: none; cursor: pointer;\n  padding: 2px 6px; color: var(--text); font-weight: 500; font-size: 0.9rem;\n  border-radius: 999px; transition: background 0.2s;\n}\n.avatar-btn:hover { background: var(--bg3); }\n.avatar-circle {\n  width: 30px; height: 30px; border-radius: 50%;\n  background: #8b9ef8; color: #111827;\n  display: flex; align-items: center; justify-content: center;\n  font-weight: 600; font-size: 0.9rem;\n}\n.avatar-name { font-weight: 500; }\n.avatar-chevron { width: 16px; height: 16px; color: var(--text2); transition: transform 0.2s; }\n.avatar-menu {\n  position: absolute; top: calc(100% + 4px); right: 0;\n  background: var(--bg2); border: 1px solid var(--border); border-radius: 6px;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 140px; z-index: 100;\n  padding: 6px; display: flex; flex-direction: column;\n}\n.avatar-menu-item {\n  display: flex; align-items: center; width: 100%; border: none; background: transparent;\n  padding: 10px 12px; cursor: pointer; border-radius: 4px; font-size: 0.9rem;\n  transition: background 0.2s ease;\n}\n.avatar-menu-item:hover { background: var(--bg3); }\n\n.overall-report-btn {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: linear-gradient(90deg, #ea64d9 0%, #8b5cf6 50%, #4ea9ff 100%);\n  color: #111827;\n  border: none;\n  border-radius: 999px;\n  padding: 6px 14px;\n  font-size: 0.85rem;\n  font-weight: 500;\n  cursor: pointer;\n  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.overall-report-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);\n  filter: brightness(1.1);\n}\n\n.overall-report-btn:active {\n  transform: translateY(0);\n}\n\n.overall-report-btn:disabled {\n  cursor: not-allowed;\n  opacity: 0.75;\n  transform: none;\n  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.14);\n  filter: none;\n}\n\n.overall-report-btn .icon {\n  font-size: 1rem;\n}\n\n@media (max-width: 720px) {\n  .topbar {\n    padding: 10px 14px;\n    gap: 12px;\n  }\n\n  .topbar-right {\n    gap: 8px;\n    flex-wrap: wrap;\n    justify-content: flex-end;\n  }\n\n  .overall-report-btn {\n    margin-right: 0;\n    padding: 8px 12px;\n  }\n\n  .avatar-btn {\n    padding: 2px 6px;\n  }\n}\n\n@media (max-width: 900px) {\n  .topbar-title {\n    margin-left: 48px;\n  }\n  .topbar-project-title {\n    display: none;\n  }\n}\n\n@media (max-width: 600px) {\n  .topbar {\n    display: grid;\n    grid-template-columns: 1fr auto;\n    grid-template-rows: auto auto;\n    gap: 8px 12px;\n    padding: 8px 12px;\n  }\n\n  .topbar-title {\n    grid-column: 1;\n    grid-row: 1;\n    margin-left: 48px;\n    font-size: 1.15rem;\n    align-self: center;\n    line-height: 1.4;\n    padding-top: 2px;\n    padding-bottom: 2px;\n  }\n\n  .topbar-right {\n    display: contents;\n  }\n\n  .theme-switcher {\n    grid-column: 2;\n    grid-row: 1;\n    align-self: center;\n  }\n\n  .shift-action-wrap {\n    grid-column: 1;\n    grid-row: 2;\n    justify-self: start;\n    align-self: center;\n  }\n\n  .avatar-dropdown {\n    grid-column: 2;\n    grid-row: 2;\n    justify-self: end;\n    align-self: center;\n    margin-top: 0;\n  }\n}\n\n/* ─── Ant Design Topbar overrides ─── */\n\n/* Theme Segmented */\n.antd-theme-segmented.ant-segmented {\n  background: var(--bg3) !important;\n  border: 1px solid var(--border) !important;\n  border-radius: 6px !important;\n  padding: 3px !important;\n}\n\n.antd-theme-segmented .ant-segmented-item {\n  border-radius: 4px !important;\n  color: var(--text3) !important;\n  transition: all 180ms ease !important;\n  min-width: 32px;\n}\n\n.antd-theme-segmented .ant-segmented-item:hover {\n  color: var(--text) !important;\n}\n\n.antd-theme-segmented .ant-segmented-item-selected {\n  background: #8b9ef8 !important;\n  color: #111827 !important;\n  box-shadow: none !important;\n}\n\n.antd-theme-segmented .ant-segmented-item-label {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0 8px;\n  font-size: 14px;\n}\n\n.antd-theme-segmented .ant-segmented-thumb {\n  background: #8b9ef8 !important;\n  border-radius: 4px !important;\n}\n\n/* Shift button */\n.antd-shift-btn.ant-btn {\n  background: linear-gradient(90deg, #ea64d9 0%, #8b5cf6 50%, #4ea9ff 100%) !important;\n  border: none !important;\n  color: #111827 !important;\n  font-weight: 500 !important;\n  font-size: 0.85rem !important;\n  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4) !important;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;\n}\n\n.antd-shift-btn.ant-btn:hover:not(:disabled) {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3) !important;\n  filter: brightness(1.1);\n}\n\n.antd-shift-btn.ant-btn:disabled {\n  opacity: 0.75 !important;\n  cursor: not-allowed !important;\n  transform: none !important;\n  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.14) !important;\n  filter: none !important;\n}\n\n/* Avatar button */\n.antd-avatar-btn.ant-btn {\n  background: transparent !important;\n  border: none !important;\n  color: var(--text) !important;\n  font-weight: 500 !important;\n  font-size: 0.9rem !important;\n  border-radius: 999px !important;\n  padding: 2px 8px !important;\n  transition: background 0.2s !important;\n}\n\n.antd-avatar-btn.ant-btn:hover {\n  background: var(--bg3) !important;\n}\n\n/* Avatar circle */\n.antd-topbar-avatar.ant-avatar {\n  background: var(--topbar-role-accent) !important;\n  color: #ffffff !important;\n  font-weight: 600 !important;\n  font-size: 0.9rem !important;\n}\n\n/* Dropdown menu */\n.antd-topbar-dropdown .ant-dropdown-menu {\n  background: var(--bg2) !important;\n  border: 1px solid var(--border) !important;\n  border-radius: 6px !important;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;\n  padding: 6px !important;\n  min-width: 140px !important;\n}\n\n.antd-topbar-dropdown .ant-dropdown-menu-item {\n  border-radius: 4px !important;\n  font-size: 0.9rem !important;\n  transition: background 0.2s ease !important;\n}\n\n.antd-topbar-dropdown .ant-dropdown-menu-item:hover {\n  background: var(--bg3) !important;\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-topbar-styles")) {
  const style = document.createElement("style");
  style.id = "combined-topbar-styles";
  style.textContent = topbarStyles;
  document.head.appendChild(style);
}

const mobileTopbarFixStyles = `
@media (max-width: 600px) {
  .topbar {
    display: grid !important;
    grid-template-columns: minmax(104px, 1fr) auto auto !important;
    grid-template-areas:
      "shift theme user" !important;
    align-items: center !important;
    gap: 7px !important;
    padding: 12px 12px 10px 62px !important;
    min-height: 66px;
  }

  .topbar-project-title {
    display: none !important;
  }

  .topbar-right {
    display: contents !important;
  }

  .topbar .antd-theme-segmented {
    grid-area: theme !important;
    justify-self: end !important;
    height: 36px;
    min-width: 96px;
    margin-left: 0;
    max-width: 100%;
  }

  .topbar .antd-theme-segmented .ant-segmented-group,
  .topbar .antd-theme-segmented .ant-segmented-item,
  .topbar .antd-theme-segmented .ant-segmented-item-label {
    min-height: 28px;
  }

  .topbar .antd-theme-segmented .ant-segmented-item {
    min-width: 31px;
  }

  .topbar .antd-theme-segmented .ant-segmented-item-label {
    padding: 0 7px;
    font-size: 13px;
  }

  .topbar .topbar-user-menu {
    grid-area: user !important;
    justify-self: end !important;
    align-self: center !important;
  }

  .topbar .shift-action-wrap {
    grid-area: shift !important;
    width: 100%;
    min-width: 0;
    display: flex !important;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    padding-left: 0;
  }

  .topbar .shift-duration {
    flex: 0 0 auto;
    min-width: 48px;
    font-size: 0.68rem;
    line-height: 1;
    text-align: right;
  }

  .topbar .antd-shift-btn.ant-btn {
    flex: 0 0 62px;
    width: auto;
    min-width: 0;
    height: 38px;
    border-radius: 14px !important;
    padding-inline: 6px !important;
    font-size: 0.68rem !important;
    line-height: 1.05 !important;
  }

  .topbar .antd-avatar-btn.ant-btn {
    width: 36px;
    height: 36px;
    padding: 0 !important;
  }

  .topbar .antd-avatar-btn .ant-space {
    gap: 0 !important;
  }

  .topbar .antd-topbar-avatar.ant-avatar {
    width: 32px !important;
    height: 32px !important;
    line-height: 32px !important;
    font-size: 0.82rem !important;
  }

  .topbar .avatar-name {
    display: none;
  }

}

@media (max-width: 380px) {
  .topbar {
    grid-template-columns: minmax(98px, 1fr) auto auto !important;
    gap: 6px !important;
    padding: 11px 10px 9px 58px !important;
  }

  .antd-theme-segmented .ant-segmented-item {
    min-width: 26px;
  }

  .antd-theme-segmented .ant-segmented-item-label {
    padding: 0 5px;
  }

  .topbar .avatar-name {
    max-width: 72px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width: 340px) {
  .topbar {
    grid-template-columns: minmax(94px, 1fr) auto auto !important;
    padding: 10px 8px 8px 56px !important;
    gap: 5px !important;
  }

  .topbar .shift-action-wrap {
    gap: 4px;
    padding-left: 0;
  }

  .topbar .shift-duration {
    min-width: 44px;
    font-size: 0.62rem;
  }

  .topbar .antd-theme-segmented {
    height: 36px;
    min-width: 88px;
  }

  .topbar .antd-theme-segmented .ant-segmented-group,
  .topbar .antd-theme-segmented .ant-segmented-item,
  .topbar .antd-theme-segmented .ant-segmented-item-label {
    min-height: 28px;
  }

  .topbar .antd-theme-segmented .ant-segmented-item {
    min-width: 27px;
  }

  .topbar .antd-theme-segmented .ant-segmented-item-label {
    padding: 0 5px;
  }

  .topbar .antd-avatar-btn.ant-btn {
    width: 36px;
    height: 36px;
  }

  .topbar .antd-topbar-avatar.ant-avatar {
    width: 32px !important;
    height: 32px !important;
    line-height: 32px !important;
  }

  .topbar .avatar-name {
    max-width: 58px;
  }

  .topbar .antd-shift-btn.ant-btn {
    flex-basis: 56px;
    min-width: 0;
    height: 34px;
    border-radius: 12px !important;
    padding-inline: 5px !important;
    font-size: 0.62rem !important;
    line-height: 1 !important;
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("mobile-topbar-fix-styles")) {
  const style = document.createElement("style");
  style.id = "mobile-topbar-fix-styles";
  style.textContent = mobileTopbarFixStyles;
  document.head.appendChild(style);
}

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

      if (lowerRole === USER_ROLES.ADMIN) {
        const nextTime = new Date().toISOString();
        const nextUser = { ...closedUser, loginTime: nextTime };
        setUser(nextUser);
        localStorage.setItem('sri_nikil_user', JSON.stringify(nextUser));
        setShiftActive(true);
      }

      if (response?.promptNextShift || lowerRole === USER_ROLES.STAFF) {
        startNextShift();
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
              className="antd-avatar-btn topbar-user-menu"
            >
              <Space size={6}>
                <Avatar
                  size={30}
                  className="antd-topbar-avatar"
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
