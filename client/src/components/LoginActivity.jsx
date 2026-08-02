import React, { useEffect, useMemo, useState } from "react";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  LoginOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import { getRoleLabel, getVisibleLoginActivityRoles, isRole, USER_ROLES } from "../utils/roles";
import { useTheme } from "../context/useTheme";
const { Text } = Typography;
const loginActivityStyles = ".login-activity-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n  width: 100%;\n}\n\n.login-activity-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.login-activity-page .ant-card-body,\n.login-activity-page .ant-card-head,\n.login-activity-page .ant-typography {\n  color: var(--text) !important;\n}\n\n.login-activity-page .ant-card-head {\n  min-height: 52px;\n  padding: 0 20px;\n  border-bottom-color: var(--border);\n}\n\n.login-activity-page .ant-card-head-title {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.login-activity-table-card {\n  overflow: hidden;\n}\n\n.login-activity-table-card .ant-card-body {\n  padding: 0;\n}\n\n.login-stats-pill {\n  min-height: 32px;\n  padding: 5px 8px 5px 14px;\n  border: 1px solid var(--border);\n  border-radius: 999px;\n  background: var(--bg);\n  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);\n}\n\n.login-stats-value {\n  color: var(--accent) !important;\n  font-weight: 800;\n}\n\n.login-stats-divider {\n  width: 1px;\n  height: 16px;\n  background: var(--border);\n}\n\n.login-clear-btn {\n  height: 26px;\n  padding-inline: 10px;\n}\n\n.login-activity-table-card .ant-table {\n  background: transparent;\n  color: var(--text);\n  table-layout: fixed;\n}\n\n.login-activity-table-card .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 800;\n  padding: 13px 22px;\n  vertical-align: middle;\n}\n\n.login-activity-table-card .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.login-activity-table-card .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 58px;\n  padding: 10px 22px;\n  vertical-align: middle;\n}\n\n.login-activity-table-card .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.login-user-cell {\n  max-width: 100%;\n  width: 100%;\n}\n\n.login-user-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  flex: 0 0 32px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(249, 115, 22, 0.14));\n  border: 1px solid var(--border);\n  color: var(--text);\n  font-size: 0.78rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n\n.login-user-name,\n.login-duration {\n  color: var(--text) !important;\n  display: block;\n  font-weight: 800;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.login-activity-table-card .ant-tag {\n  margin-inline-end: 0;\n}\n\n.login-activity-table-card .ant-pagination {\n  margin: 14px 20px 16px !important;\n}\n\n.login-empty-icon {\n  color: var(--text3);\n  font-size: 2rem;\n}\n\n.login-activity-modal .ant-modal-content {\n  padding: 0 !important;\n  overflow: hidden;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n\n.login-activity-modal .ant-modal-header {\n  margin: 0;\n  padding: 20px 24px 12px;\n  border-bottom: 1px solid var(--border);\n}\n\n.login-activity-modal .ant-modal-body {\n  padding: 20px 24px 4px;\n}\n\n.login-activity-modal .ant-modal-footer {\n  margin: 0;\n  padding: 16px 24px 20px;\n  border-top: 1px solid var(--border);\n}\n\n.login-activity-modal .ant-modal-title {\n  color: var(--text) !important;\n}\n\n:root[data-theme='dark'] .login-activity-page .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .login-activity-page,\n:root[data-theme='dark'] .login-activity-page .ant-card-body,\n:root[data-theme='dark'] .login-activity-page .ant-card-head,\n:root[data-theme='dark'] .login-activity-page .ant-card-head-title,\n:root[data-theme='dark'] .login-activity-page .ant-typography,\n:root[data-theme='dark'] .login-activity-page .login-user-name,\n:root[data-theme='dark'] .login-activity-page .login-duration {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .login-stats-pill {\n  background: #111827;\n  border-color: #334155;\n}\n\n:root[data-theme='dark'] .login-stats-divider {\n  background: #334155;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-table,\n:root[data-theme='dark'] .login-activity-table-card .ant-table-container,\n:root[data-theme='dark'] .login-activity-table-card .ant-table-content,\n:root[data-theme='dark'] .login-activity-table-card .ant-table-cell-scrollbar {\n  background: #1b2433 !important;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-table-tbody > tr > td {\n  background: #1b2433 !important;\n  border-bottom-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-table-tbody > tr.ant-table-row:hover > td,\n:root[data-theme='dark'] .login-activity-table-card .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-item,\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-next button {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-item a,\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-next button {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-item-active {\n  border-color: var(--accent) !important;\n}\n\n:root[data-theme='dark'] .login-activity-table-card .ant-pagination-item-active a {\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .login-activity-page .ant-tag {\n  background: #111827;\n  border-color: #334155;\n  color: #e5e7eb;\n}\n\n:root[data-theme='dark'] .login-activity-page .ant-tag-green {\n  background: rgba(34, 197, 94, 0.14);\n  border-color: rgba(74, 222, 128, 0.34);\n  color: #bbf7d0;\n}\n\n:root[data-theme='dark'] .login-activity-page .ant-tag-blue {\n  background: rgba(37, 99, 235, 0.18);\n  border-color: rgba(96, 165, 250, 0.36);\n  color: #bfdbfe;\n}\n\n:root[data-theme='dark'] .login-activity-page .ant-tag-purple {\n  background: rgba(124, 58, 237, 0.18);\n  border-color: rgba(167, 139, 250, 0.36);\n  color: #ddd6fe;\n}\n\nhtml[data-theme='dark'] body .login-activity-modal,\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-content {\n  background: transparent !important;\n}\n\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-content,\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-header,\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-body,\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-footer {\n  background-color: #1b2433 !important;\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-title,\nhtml[data-theme='dark'] body .login-activity-modal .ant-typography {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-close,\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-close-x {\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .login-activity-modal .ant-modal-close:hover {\n  background: #263244 !important;\n}\n\nhtml[data-theme='dark'] body .login-activity-modal .ant-btn-default {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .login-activity-modal .ant-btn-default:hover,\nhtml[data-theme='dark'] body .login-activity-modal .ant-btn-default:focus {\n  background: #263244 !important;\n  border-color: #475569 !important;\n  color: #ffffff !important;\n}\n\nhtml[data-theme='dark'] body .ant-popover .ant-popconfirm,\nhtml[data-theme='dark'] body .ant-popover .ant-popover-inner {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n}\n\nhtml[data-theme='dark'] body .ant-popover .ant-popover-title,\nhtml[data-theme='dark'] body .ant-popover .ant-popconfirm-description {\n  color: #e5e7eb !important;\n}\n\n@media (max-width: 768px) {\n  .login-activity-table-card .ant-table-thead > tr > th,\n  .login-activity-table-card .ant-table-tbody > tr > td {\n    padding: 12px 14px;\n  }\n\n  .login-activity-table-card .ant-card-head {\n    align-items: stretch;\n    flex-direction: column;\n    gap: 10px;\n    padding-block: 12px;\n  }\n\n  .login-activity-table-card .ant-card-extra {\n    margin-left: 0;\n  }\n\n  .login-stats-pill {\n    width: 100%;\n    justify-content: center;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-loginactivity-styles")) {
  const style = document.createElement("style");
  style.id = "combined-loginactivity-styles";
  style.textContent = loginActivityStyles;
  document.head.appendChild(style);
}

const EMPTY_LOGIN_LOGS = [];

const formatDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const getRoleColor = (role) => {
  if (isRole(role, USER_ROLES.ADMIN)) return "purple";
  if (isRole(role, USER_ROLES.MANAGER)) return "green";
  return "blue";
};

export default function LoginActivity({ db, erp, user }) {
  const { effectiveTheme } = useTheme();
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const isDarkTheme = effectiveTheme === "dark";
  const visibleRoles = useMemo(() => getVisibleLoginActivityRoles(user), [user]);
  const normalizedVisibleRoles = useMemo(
    () => visibleRoles.map((role) => String(role).toLowerCase()),
    [visibleRoles],
  );
  const sourceLogs = Array.isArray(db?.loginLogs) ? db.loginLogs : EMPTY_LOGIN_LOGS;
  const loginLogs = useMemo(
    () =>
      sourceLogs.filter((log) =>
        normalizedVisibleRoles.includes(String(log.role || "").trim().toLowerCase()),
      ),
    [normalizedVisibleRoles, sourceLogs],
  );

  const isAdmin = isRole(user, USER_ROLES.ADMIN);
  const clearLabel = isAdmin ? "Clear All" : "Clear Staff Logs";
  const clearMessage = isAdmin
    ? "Clear all visible login activity records permanently?"
    : "Clear all visible staff login activity records permanently?";
  const emptyTitle = isAdmin ? "No team activity yet" : "No staff activity yet";
  const emptyDescription = isAdmin
    ? "No staff or manager login records are available."
    : "No staff login records are available.";

  const loginActivityTheme = useMemo(
    () => ({
      algorithm: isDarkTheme
        ? antdTheme.darkAlgorithm
        : antdTheme.defaultAlgorithm,
      token: {
        borderRadius: 6,
        colorPrimary: "#d95b3d",
        colorBgBase: isDarkTheme ? "#111827" : "#ffffff",
        colorBgContainer: isDarkTheme ? "#1b2433" : "#ffffff",
        colorBgElevated: isDarkTheme ? "#111827" : "#ffffff",
        colorBorder: isDarkTheme ? "#334155" : "#e2e5ea",
        colorText: isDarkTheme ? "#f8fafc" : "#1a1f2e",
        colorTextSecondary: isDarkTheme ? "#cbd5e1" : "#5a6278",
      },
      components: {
        Button: {
          defaultBg: isDarkTheme ? "#111827" : "#ffffff",
          defaultBorderColor: isDarkTheme ? "#334155" : "#d9d9d9",
          defaultColor: isDarkTheme ? "#f8fafc" : "#1a1f2e",
        },
        Card: {
          colorBgContainer: isDarkTheme ? "#1b2433" : "#ffffff",
        },
        Modal: {
          contentBg: isDarkTheme ? "#1b2433" : "#ffffff",
          footerBg: isDarkTheme ? "#1b2433" : "#ffffff",
          headerBg: isDarkTheme ? "#1b2433" : "#ffffff",
        },
        Table: {
          headerBg: isDarkTheme ? "#111827" : "#f4f6f9",
          rowHoverBg: isDarkTheme ? "#263244" : "#fafafa",
        },
      },
    }),
    [isDarkTheme],
  );

  useEffect(() => {
    if (erp?.fetchLoginLogs) {
      erp.fetchLoginLogs(true).catch(() => {});
    }
  }, [erp]);

  const handleDeleteLog = async (id) => {
    if (!id || deletingId === id) {
      return;
    }
    setDeletingId(id);

    try {
      await erp.deleteLoginLog(id);
      message.success("Login log deleted");
    } catch (error) {
      message.error(error.message || "Failed to delete login log");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearLogs = async () => {
    if (!loginLogs.length || isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await erp.clearLoginLogs({ roles: visibleRoles });
      message.success("Login activity cleared");
      setShowClearConfirm(false);
    } catch (error) {
      message.error(error.message || "Failed to clear login activity");
    } finally {
      setIsClearing(false);
    }
  };

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: "20%",
      render: (name) => (
        <Space size={10} className="login-user-cell">
          <div className="login-user-avatar">
            {String(name || "U").slice(0, 2).toUpperCase()}
          </div>
          <Text className="login-user-name">{name || "User"}</Text>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      width: "13%",
      render: (role) => <Tag color={getRoleColor(role)}>{role || getRoleLabel(USER_ROLES.STAFF)}</Tag>,
    },
    {
      title: "Login",
      key: "login",
      width: "20%",
      render: (_, log) => (
        <Text type="secondary">{formatDateTime(log.loginTime || log.login_time)}</Text>
      ),
    },
    {
      title: "Logout",
      key: "logout",
      width: "20%",
      render: (_, log) => (
        <Text type="secondary">{formatDateTime(log.logoutTime || log.logout_time)}</Text>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      width: "13%",
      render: (_, log) => {
        const loginTime = log.loginTime || log.login_time;
        const logoutTime = log.logoutTime || log.logout_time;
        return (
          <Text className="login-duration">
            {logoutTime ? formatDuration(loginTime, logoutTime) : "-"}
          </Text>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      width: "9%",
      render: (_, log) => {
        const isOnline = !(log.logoutTime || log.logout_time);
        return <Tag color={isOnline ? "green" : "default"}>{isOnline ? "Online" : "Ended"}</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: "5%",
      render: (_, log) => (
        <Popconfirm
          title="Delete login log?"
          description="This login activity record will be removed."
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDeleteLog(log.id)}
        >
          <Tooltip title="Delete log">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              loading={deletingId === log.id}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  const modalStyles = {
    content: {
      background: isDarkTheme ? "#1b2433" : "#ffffff",
      border: `1px solid ${isDarkTheme ? "#334155" : "#e2e5ea"}`,
      padding: 0,
    },
    header: {
      background: isDarkTheme ? "#1b2433" : "#ffffff",
      borderBottom: `1px solid ${isDarkTheme ? "#334155" : "#e2e5ea"}`,
    },
    body: {
      background: isDarkTheme ? "#1b2433" : "#ffffff",
    },
    footer: {
      background: isDarkTheme ? "#1b2433" : "#ffffff",
      borderTop: `1px solid ${isDarkTheme ? "#334155" : "#e2e5ea"}`,
    },
  };

  return (
    <ConfigProvider theme={loginActivityTheme}>
      <div className="page-header">
        <h1 className="page-title">Login Activity</h1>
        <p className="page-description">
          Monitor staff access, session duration, and recent login events.
        </p>
      </div>

      <div className="login-activity-page">
        <Card
          className="login-activity-table-card"
          title={
            <Space>
              <LoginOutlined />
              <span>Recent Logins</span>
            </Space>
          }
          extra={
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setShowClearConfirm(true)}
              disabled={!loginLogs.length || isClearing}
              loading={isClearing}
              className="login-clear-btn"
            >
              {clearLabel}
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={loginLogs}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 1100 }}
            tableLayout="fixed"
            locale={{
              emptyText: (
                <Empty
                  image={<SafetyOutlined className="login-empty-icon" />}
                  description={
                    <Space direction="vertical" size={4}>
                      <Text strong>{emptyTitle}</Text>
                      <Text type="secondary">{emptyDescription}</Text>
                    </Space>
                  }
                />
              ),
            }}
          />
        </Card>

        <Modal
          title="Clear Login Activity"
          open={showClearConfirm}
          onCancel={() => setShowClearConfirm(false)}
          onOk={handleClearLogs}
          okText={clearLabel}
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          confirmLoading={isClearing}
          centered
          className="login-activity-modal"
          styles={modalStyles}
        >
          <Text type="secondary">{clearMessage}</Text>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
