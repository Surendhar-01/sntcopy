import React, { useEffect, useMemo, useState } from "react";
import {
  CloudDownloadOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  LockOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import { useTheme } from "../context/useTheme";
import { getRoleLabel, isRole, USER_ROLES, USER_ROLE_OPTIONS } from "../utils/roles";
const { Text } = Typography;
const settingsStyles = ".settings-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n  width: 100%;\n}\n\n.settings-grid {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);\n  gap: 18px;\n  align-items: stretch;\n}\n\n.settings-card {\n  height: 100%;\n  min-width: 0;\n}\n\n.settings-card .ant-card-body {\n  height: calc(100% - 53px);\n}\n\n.settings-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.settings-page .ant-card-body,\n.settings-page .ant-card-head,\n.settings-page .ant-typography {\n  color: var(--text) !important;\n}\n\n.settings-page .ant-card-head {\n  min-height: 52px;\n  padding: 0 20px;\n  border-bottom-color: var(--border);\n}\n\n.settings-page .ant-card-head-title {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.settings-page .ant-card-extra {\n  min-width: 0;\n}\n\n.settings-page .ant-form-item {\n  margin-bottom: 15px;\n}\n\n.settings-page .ant-form-item-label > label,\n.settings-modal .ant-form-item-label > label {\n  color: var(--text) !important;\n  font-weight: 700;\n}\n\n.settings-staff-card {\n  overflow: hidden;\n}\n\n.settings-staff-card .ant-card-body {\n  display: flex;\n  flex-direction: column;\n  padding: 0;\n}\n\n.settings-staff-card .ant-table-wrapper,\n.settings-staff-card .ant-spin-nested-loading,\n.settings-staff-card .ant-spin-container {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  min-height: 0;\n}\n\n.settings-staff-card .ant-table-container {\n  min-height: 407px;\n}\n\n.settings-staff-card .ant-table {\n  background: transparent;\n  color: var(--text);\n  flex: 1;\n  table-layout: fixed;\n}\n\n.settings-staff-card .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 800;\n  padding: 13px 22px;\n  vertical-align: middle;\n}\n\n.settings-staff-card .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.settings-staff-card .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 58px;\n  padding: 10px 22px;\n  vertical-align: middle;\n}\n\n.settings-staff-card .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.settings-staff-card .ant-tag {\n  margin-inline-end: 0;\n}\n\n.settings-staff-card .ant-pagination {\n  margin: 14px 20px 16px !important;\n}\n\n.settings-user-name {\n  color: var(--text) !important;\n  display: block;\n  font-weight: 800;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.settings-db-card,\n.settings-gst-card {\n  min-height: 152px;\n}\n\n.settings-db-card .ant-space-compact,\n.settings-gst-card .ant-space-compact {\n  max-width: 520px;\n}\n\n.settings-helper-text,\n.settings-reset-copy {\n  display: block;\n}\n\n.settings-helper-text {\n  margin-top: 14px;\n}\n\n.settings-gst-input {\n  width: 180px;\n}\n\n.settings-modal .ant-modal-content {\n  padding: 0 !important;\n  overflow: hidden;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n\n.settings-modal .ant-modal-header {\n  margin: 0;\n  padding: 20px 24px 12px;\n  border-bottom: 1px solid var(--border);\n}\n\n.settings-modal .ant-modal-body {\n  padding: 20px 24px 4px;\n}\n\n.settings-modal .ant-modal-footer {\n  margin: 0;\n  padding: 16px 24px 20px;\n  border-top: 1px solid var(--border);\n}\n\n.settings-modal .ant-modal-title,\n.settings-modal .ant-typography {\n  color: var(--text) !important;\n}\n\n.settings-reset-copy {\n  margin-bottom: 16px;\n}\n\n:root[data-theme='dark'] .settings-page .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .settings-page,\n:root[data-theme='dark'] .settings-page .ant-card-body,\n:root[data-theme='dark'] .settings-page .ant-card-head,\n:root[data-theme='dark'] .settings-page .ant-card-head-title,\n:root[data-theme='dark'] .settings-page .ant-typography,\n:root[data-theme='dark'] .settings-user-name {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-table,\n:root[data-theme='dark'] .settings-staff-card .ant-table-container,\n:root[data-theme='dark'] .settings-staff-card .ant-table-content,\n:root[data-theme='dark'] .settings-staff-card .ant-table-cell-scrollbar {\n  background: #1b2433 !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-table-tbody > tr > td {\n  background: #1b2433 !important;\n  border-bottom-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-table-tbody > tr.ant-table-row:hover > td,\n:root[data-theme='dark'] .settings-staff-card .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-item,\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-prev button,\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-next button {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-item a,\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-prev button,\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-next button {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-item-active {\n  border-color: var(--accent) !important;\n}\n\n:root[data-theme='dark'] .settings-staff-card .ant-pagination-item-active a {\n  color: #ffffff !important;\n}\n\nhtml[data-theme='dark'] body .settings-modal,\nhtml[data-theme='dark'] body .settings-modal .ant-modal-content {\n  background: transparent !important;\n}\n\nhtml[data-theme='dark'] body .settings-modal .ant-modal-content,\nhtml[data-theme='dark'] body .settings-modal .ant-modal-header,\nhtml[data-theme='dark'] body .settings-modal .ant-modal-body,\nhtml[data-theme='dark'] body .settings-modal .ant-modal-footer {\n  background-color: #1b2433 !important;\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .settings-modal .ant-modal-title,\nhtml[data-theme='dark'] body .settings-modal .ant-form-item-label > label,\nhtml[data-theme='dark'] body .settings-modal .ant-typography {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .settings-modal .ant-modal-close,\nhtml[data-theme='dark'] body .settings-modal .ant-modal-close-x {\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .settings-modal .ant-modal-close:hover {\n  background: #263244 !important;\n}\n\nhtml[data-theme='dark'] body .settings-page .ant-input,\nhtml[data-theme='dark'] body .settings-page .ant-input-number,\nhtml[data-theme='dark'] body .settings-page .ant-input-number-input,\nhtml[data-theme='dark'] body .settings-page .ant-select-selector,\nhtml[data-theme='dark'] body .settings-modal .ant-input,\nhtml[data-theme='dark'] body .settings-modal .ant-input-password,\nhtml[data-theme='dark'] body .settings-modal .ant-select-selector {\n  background-color: #111827 !important;\n  color: #f8fafc !important;\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .settings-page .ant-input::placeholder,\nhtml[data-theme='dark'] body .settings-modal .ant-input::placeholder {\n  color: #94a3b8 !important;\n}\n\nhtml[data-theme='dark'] body .settings-page .ant-input:hover,\nhtml[data-theme='dark'] body .settings-page .ant-input-number:hover,\nhtml[data-theme='dark'] body .settings-modal .ant-input:hover,\nhtml[data-theme='dark'] body .settings-modal .ant-input-password:hover,\nhtml[data-theme='dark'] body .settings-modal .ant-select-selector:hover {\n  border-color: #475569 !important;\n}\n\nhtml[data-theme='dark'] body .settings-page .ant-input:focus,\nhtml[data-theme='dark'] body .settings-page .ant-input-number-focused,\nhtml[data-theme='dark'] body .settings-modal .ant-input:focus,\nhtml[data-theme='dark'] body .settings-modal .ant-input-password-focused,\nhtml[data-theme='dark'] body .settings-modal .ant-select-focused .ant-select-selector {\n  border-color: var(--accent) !important;\n  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.16) !important;\n}\n\nhtml[data-theme='dark'] body .settings-page .ant-input-number-group-addon {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .settings-modal .ant-input-password-icon,\nhtml[data-theme='dark'] body .settings-modal .ant-select-arrow {\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .ant-select-dropdown {\n  background: #111827 !important;\n  border: 1px solid #334155;\n}\n\nhtml[data-theme='dark'] body .ant-select-item {\n  color: #e5e7eb !important;\n}\n\nhtml[data-theme='dark'] body .ant-select-item-option-selected,\nhtml[data-theme='dark'] body .ant-select-item-option-active {\n  background: #263244 !important;\n}\n\nhtml[data-theme='dark'] body .ant-popover .ant-popconfirm,\nhtml[data-theme='dark'] body .ant-popover .ant-popover-inner {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n}\n\nhtml[data-theme='dark'] body .ant-popover .ant-popover-title,\nhtml[data-theme='dark'] body .ant-popover .ant-popconfirm-description {\n  color: #e5e7eb !important;\n}\n\n@media (max-width: 1100px) {\n  .settings-grid {\n    grid-template-columns: 1fr;\n  }\n}\n\n@media (max-width: 640px) {\n  .settings-page .ant-card-head {\n    padding: 0 14px;\n  }\n\n  .settings-page .ant-card-extra .ant-space {\n    align-items: flex-end;\n    flex-direction: column;\n    gap: 8px !important;\n  }\n\n  .settings-staff-card .ant-table-thead > tr > th,\n  .settings-staff-card .ant-table-tbody > tr > td {\n    padding: 12px 14px;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-settings-styles")) {
  const style = document.createElement("style");
  style.id = "combined-settings-styles";
  style.textContent = settingsStyles;
  document.head.appendChild(style);
}

const EMPTY_ACCOUNTS = [];
const DEFAULT_SETTINGS = {
  shop: "",
  addr: "",
  gstin: "",
  phone: "",
  gst: 0,
};
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const getRoleColor = (role) => {
  if (isRole(role, USER_ROLES.ADMIN)) return "purple";
  if (isRole(role, USER_ROLES.MANAGER)) return "green";
  return "blue";
};

export default function Settings({ db, erp }) {
  const [staffForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const { effectiveTheme } = useTheme();
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingGst, setIsSavingGst] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [deletingUser, setDeletingUser] = useState("");
  const [shopSettings, setShopSettings] = useState(
    () => db.settings || DEFAULT_SETTINGS,
  );
  const [gstValue, setGstValue] = useState(() => Number(db.settings?.gst ?? 0));

  const accounts = Array.isArray(db.accounts) ? db.accounts : EMPTY_ACCOUNTS;
  const isDarkTheme = effectiveTheme === "dark";

  const settingsAntTheme = useMemo(
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
        Input: {
          activeBg: isDarkTheme ? "#111827" : "#ffffff",
          colorBgContainer: isDarkTheme ? "#111827" : "#ffffff",
        },
        InputNumber: {
          activeBg: isDarkTheme ? "#111827" : "#ffffff",
          colorBgContainer: isDarkTheme ? "#111827" : "#ffffff",
        },
        Modal: {
          contentBg: isDarkTheme ? "#1b2433" : "#ffffff",
          footerBg: isDarkTheme ? "#1b2433" : "#ffffff",
          headerBg: isDarkTheme ? "#1b2433" : "#ffffff",
        },
        Select: {
          colorBgContainer: isDarkTheme ? "#111827" : "#ffffff",
        },
        Table: {
          headerBg: isDarkTheme ? "#111827" : "#f4f6f9",
          rowHoverBg: isDarkTheme ? "#263244" : "#fafafa",
        },
      },
    }),
    [isDarkTheme],
  );

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

  useEffect(() => {
    if (erp) {
      if (erp.fetchSettings) erp.fetchSettings().catch(() => {});
      if (erp.fetchAccounts) erp.fetchAccounts().catch(() => {});
    }
  }, [erp]);

  useEffect(() => {
    setShopSettings(db.settings || DEFAULT_SETTINGS);
    setGstValue(Number(db.settings?.gst ?? 0));
  }, [db.settings]);

  const saveSettings = async (nextSettings, successMessage) => {
    await erp.updateSettings(nextSettings);
    setShopSettings(nextSettings);
    setGstValue(Number(nextSettings?.gst ?? 0));
    message.success(successMessage);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await saveSettings(
        {
          ...db.settings,
          ...shopSettings,
          gst: Number(gstValue) || 0,
        },
        "Settings updated successfully",
      );
    } catch (error) {
      message.error(error.message || "Failed to update settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUpdateGst = async () => {
    const parsedGst = Number(gstValue);

    if (Number.isNaN(parsedGst) || parsedGst < 0) {
      message.error("Enter a valid GST percentage");
      return;
    }

    setIsSavingGst(true);
    try {
      await saveSettings(
        {
          ...db.settings,
          ...shopSettings,
          gst: parsedGst,
        },
        "GST updated successfully",
      );
    } catch (error) {
      message.error(error.message || "Failed to update GST");
    } finally {
      setIsSavingGst(false);
    }
  };

  const updateShopField = (key, value) => {
    setShopSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openStaffModal = () => {
    staffForm.setFieldsValue({ user: "", pass: "", role: getRoleLabel(USER_ROLES.STAFF) });
    setShowStaffModal(true);
  };

  const addStaff = async () => {
    try {
      const values = await staffForm.validateFields();
      const username = values.user.trim();

      if (
        accounts.some(
          (account) => account.user.toLowerCase() === username.toLowerCase(),
        )
      ) {
        message.error("Username already exists");
        return;
      }

      setIsAddingStaff(true);
      await erp.addStaff({ ...values, user: username });
      message.success("Account added");
      setShowStaffModal(false);
      staffForm.resetFields();
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error.message || "Failed to add staff");
      }
    } finally {
      setIsAddingStaff(false);
    }
  };

  const deleteStaff = async (username) => {
    if (username === "admin") return;

    if (accounts.length <= 1) {
      message.error("At least one account is required");
      return;
    }

    setDeletingUser(username);
    try {
      await erp.deleteStaff(username);
      message.success("Account deleted");
    } catch (error) {
      message.error(error.message || "Failed to delete staff");
    } finally {
      setDeletingUser("");
    }
  };

  const resetStaffPassword = (username) => {
    setResetTarget(username);
    resetForm.resetFields();
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    if (isResetting) return;
    setShowResetModal(false);
    setResetTarget("");
    resetForm.resetFields();
  };

  const handleConfirmResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      setIsResetting(true);
      await erp.updateStaffPassword(resetTarget, values.password.trim());
      message.success(`Password updated for ${resetTarget}`);
      closeResetModal();
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error.message || "Failed to update password");
      }
    } finally {
      setIsResetting(false);
    }
  };

  const downloadBackupFile = (backupData) => {
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `snt_backup_${new Date().toISOString().split("T")[0]}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const backupDB = async () => {
    setIsBackingUp(true);
    try {
      if (erp?.refreshData) {
        await erp.refreshData();
      }

      const response = await fetch(`${API_BASE_URL}/api/db`);
      if (!response.ok) {
        throw new Error(`Backup failed: ${response.status}`);
      }

      const freshDb = await response.json();
      downloadBackupFile({
        ...freshDb,
        products: Array.isArray(freshDb.products) ? freshDb.products : [],
      });
      message.success(`Backup downloaded with ${freshDb.products?.length || 0} products`);
    } catch (error) {
      downloadBackupFile({
        ...db,
        products: Array.isArray(db.products) ? db.products : [],
      });
      message.warning(error.message || "Downloaded local backup");
    } finally {
      setIsBackingUp(false);
    }
  };

  const restoreDB = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const data = JSON.parse(loadEvent.target.result);
          erp.restoreDatabase(data);
          message.success("Database restored successfully");
          window.location.reload();
        } catch {
          message.error("Invalid backup file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const accountColumns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 220,
      render: (username) => <Text className="settings-user-name">{username}</Text>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 150,
      render: (role) => <Tag color={getRoleColor(role)}>{role || getRoleLabel(USER_ROLES.STAFF)}</Tag>,
    },
    {
      title: "Password",
      key: "password",
      width: 190,
      render: (_, account) =>
        account.user === "admin" ? (
          <Text type="secondary">Protected</Text>
        ) : (
          <Button
            icon={<LockOutlined />}
            onClick={() => resetStaffPassword(account.user)}
          >
            Reset
          </Button>
        ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 110,
      render: (_, account) =>
        account.user === "admin" ? (
          <Text type="secondary">-</Text>
        ) : (
          <Popconfirm
            title="Delete account?"
            description={`${account.user} will lose login access.`}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteStaff(account.user)}
          >
            <Tooltip title="Delete account">
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                loading={deletingUser === account.user}
              />
            </Tooltip>
          </Popconfirm>
        ),
    },
  ];

  return (
    <ConfigProvider theme={settingsAntTheme}>
      <div className="page-header">
        <h1 className="page-title">Settings & Staff</h1>
        <p className="page-description">
          Manage staff credentials and store details.
        </p>
      </div>

      <div className="settings-page">
        <div className="settings-grid">
          <Card
            className="settings-card settings-shop-card"
            title={
              <Space>
                <ShopOutlined />
                <span>Shop Details</span>
              </Space>
            }
          >
            <Form layout="vertical" requiredMark={false}>
              <Form.Item label="Shop Name">
                <Input
                  value={shopSettings.shop || ""}
                  onChange={(event) =>
                    updateShopField("shop", event.target.value)
                  }
                />
              </Form.Item>
              <Form.Item label="Address">
                <Input.TextArea
                  rows={3}
                  value={shopSettings.addr || ""}
                  onChange={(event) =>
                    updateShopField("addr", event.target.value)
                  }
                />
              </Form.Item>
              <Form.Item label="GSTIN">
                <Input
                  value={shopSettings.gstin || ""}
                  onChange={(event) =>
                    updateShopField("gstin", event.target.value)
                  }
                />
              </Form.Item>
              <Form.Item label="Phone">
                <Input
                  value={shopSettings.phone || ""}
                  onChange={(event) =>
                    updateShopField("phone", event.target.value)
                  }
                />
              </Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isSavingSettings}
                onClick={handleSaveSettings}
              >
                Update
              </Button>
            </Form>
          </Card>

          <Card
            className="settings-card settings-staff-card"
            title={
              <Space>
                <TeamOutlined />
                <span>User Accounts</span>
              </Space>
            }
            extra={
              <Space size={12}>
                <Text type="secondary">
                  {accounts.length} account{accounts.length === 1 ? "" : "s"}
                </Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openStaffModal}
                >
                  Add Account
                </Button>
              </Space>
            }
          >
            <Table
              rowKey="user"
              columns={accountColumns}
              dataSource={accounts}
              pagination={{ pageSize: 6, showSizeChanger: false }}
              scroll={{ x: 670 }}
              tableLayout="fixed"
            />
          </Card>

          <Card
            className="settings-card settings-db-card"
            title={
              <Space>
                <DatabaseOutlined />
                <span>Database Tools</span>
              </Space>
            }
          >
            <Space.Compact block>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                onClick={backupDB}
                loading={isBackingUp}
              >
                Download Backup
              </Button>
              <Button icon={<UploadOutlined />} onClick={restoreDB}>
                Restore Database
              </Button>
            </Space.Compact>
            <Text type="secondary" className="settings-helper-text">
              Restore will overwrite all current data.
            </Text>
          </Card>

          <Card
            className="settings-card settings-gst-card"
            title={
              <Space>
                <SettingOutlined />
                <span>GST Context</span>
              </Space>
            }
          >
            <Space.Compact block>
              <InputNumber
                min={0}
                step={0.1}
                value={gstValue}
                addonAfter="%"
                className="settings-gst-input"
                onChange={(value) => setGstValue(Number(value ?? 0))}
              />
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isSavingGst}
                onClick={handleUpdateGst}
              >
                Update GST
              </Button>
            </Space.Compact>
          </Card>
        </div>

        <Modal
          title="Add Account"
          open={showStaffModal}
          onCancel={() => setShowStaffModal(false)}
          onOk={addStaff}
          okText="Save Account"
          cancelText="Cancel"
          confirmLoading={isAddingStaff}
          centered
          destroyOnHidden
          className="settings-modal"
          styles={modalStyles}
        >
          <Form
            form={staffForm}
            layout="vertical"
            requiredMark={false}
            initialValues={{ role: getRoleLabel(USER_ROLES.STAFF) }}
          >
            <Form.Item
              label="Username"
              name="user"
              rules={[{ required: true, message: "Enter username" }]}
            >
              <Input autoComplete="off" placeholder="Enter username" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="pass"
              rules={[{ required: true, message: "Enter password" }]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder="Enter password"
              />
            </Form.Item>
            <Form.Item label="Role" name="role">
              <Select
                options={USER_ROLE_OPTIONS}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Reset Password"
          open={showResetModal}
          onCancel={closeResetModal}
          onOk={handleConfirmResetPassword}
          okText="Update Password"
          cancelText="Cancel"
          confirmLoading={isResetting}
          centered
          destroyOnHidden
          className="settings-modal"
          styles={modalStyles}
        >
          <Text type="secondary" className="settings-reset-copy">
            Set a new password for <Text strong>{resetTarget}</Text>.
          </Text>
          <Form form={resetForm} layout="vertical" requiredMark={false}>
            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password
                placeholder="Enter new password"
                autoFocus
                onPressEnter={handleConfirmResetPassword}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
