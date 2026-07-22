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
import { getVisibleLoginActivityRoles } from "../../utils/roles";
import { useTheme } from "../../context/useTheme";
import "./LoginActivity.css";

const { Text } = Typography;

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
  if (role === "Admin") return "purple";
  if (role === "Manager") return "green";
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

  const isAdmin = user?.role === "Admin";
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
        colorPrimary: "#f97316",
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

  const activitySummary = useMemo(() => {
    const online = loginLogs.filter((log) => !(log.logoutTime || log.logout_time)).length;
    const ended = loginLogs.length - online;

    return {
      total: loginLogs.length,
      online,
      ended,
    };
  }, [loginLogs]);

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
      render: (role) => <Tag color={getRoleColor(role)}>{role || "Staff"}</Tag>,
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
            <Space className="login-stats-pill" size={10} wrap>
              <Text type="secondary">Total:</Text>
              <Text className="login-stats-value">{activitySummary.total}</Text>
              <span className="login-stats-divider" />
              <Text type="secondary">Online:</Text>
              <Text className="login-stats-value">{activitySummary.online}</Text>
              <span className="login-stats-divider" />
              <Text type="secondary">Ended:</Text>
              <Text className="login-stats-value">{activitySummary.ended}</Text>
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
            </Space>
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
