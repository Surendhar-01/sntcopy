import React, { useCallback, useMemo } from "react";
import {
  Avatar,
  Button,
  Layout,
  Menu,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
} from "antd";
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
} from "@ant-design/icons";
import { getSidebarMenu } from "../config/sidebarMenu";
import { useSidebar } from "../context/useSidebar";
import { getRoleLayout } from "../config/roleLayouts";

const { Sider } = Layout;
const { Text, Title } = Typography;

const mobileSiderStyle = {
  position: "fixed",
  top: 0,
  bottom: 0,
  insetInlineStart: 0,
  zIndex: 150,
};

const ICON_MAP = {
  dashboard: <AppstoreOutlined />,
  billing: <FileTextOutlined />,
  products: <ShoppingOutlined />,
  stock: <StockOutlined />,
  pricing: <TagOutlined />,
  priceboard: <MonitorOutlined />,
  sales: <BarChartOutlined />,
  customers: <TeamOutlined />,
  reports: <FileSearchOutlined />,
  loginlog: <HistoryOutlined />,
  settings: <SettingOutlined />,
};

const sidebarStyles = `
.app-sidebar.ant-layout-sider {
  position: fixed !important;
  inset: 0 auto 0 0;
  height: 100vh;
  z-index: 120;
  background: var(--sidebar-bg) !important;
  border-right: 1px solid var(--sidebar-border);
  box-shadow: 2px 0 18px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.app-sidebar .ant-layout-sider-children {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--sidebar-bg);
}

.app-sidebar-brand {
  min-height: 88px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--sidebar-border);
  width: 100%;
}

.app-sidebar.ant-layout-sider-collapsed .app-sidebar-brand {
  justify-content: center;
  padding: 16px 0;
}

.app-sidebar-brand .ant-avatar {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #ffffff;
  flex: 0 0 auto;
}

.app-sidebar-title.ant-typography {
  color: var(--text) !important;
  font-size: 1.02rem !important;
  line-height: 1.2 !important;
  margin: 0 !important;
}

.app-sidebar-subtitle.ant-typography {
  color: var(--text2) !important;
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.app-sidebar-menu-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px 0;
}

.app-sidebar-menu.ant-menu {
  background: transparent !important;
  border-inline-end: 0 !important;
}

.app-sidebar-menu .ant-menu-item-group-title {
  color: var(--accent) !important;
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  padding: 10px 18px 6px !important;
  text-transform: uppercase;
}

.app-sidebar-menu.ant-menu-inline-collapsed .ant-menu-item-group-title {
  display: none;
}

.app-sidebar-menu .ant-menu-item {
  border-radius: 8px !important;
  color: var(--sidebar-text) !important;
  font-weight: 600;
  height: 42px !important;
  line-height: 42px !important;
  margin: 4px 12px !important;
  width: calc(100% - 24px) !important;
}

.app-sidebar-menu .ant-menu-item-icon {
  font-size: 20px !important;
  min-width: 22px !important;
}

.app-sidebar-menu.ant-menu-inline-collapsed {
  width: 74px;
}

.app-sidebar-menu.ant-menu-inline-collapsed .ant-menu-item {
  align-items: center !important;
  display: flex !important;
  height: 46px !important;
  justify-content: center !important;
  line-height: 46px !important;
  margin: 6px auto !important;
  padding-inline: 0 !important;
  width: 48px !important;
}

.app-sidebar-menu.ant-menu-inline-collapsed .ant-menu-item-icon {
  font-size: 21px !important;
  line-height: 1 !important;
  margin: 0 !important;
}

.app-sidebar-menu .ant-menu-item:hover {
  background: var(--surface-hover) !important;
  color: var(--accent) !important;
}

.app-sidebar-menu .ant-menu-item-selected,
.app-sidebar-menu .ant-menu-item-selected:hover {
  background: var(--accent) !important;
  color: #ffffff !important;
}

.app-sidebar-footer {
  border-top: 1px solid var(--sidebar-border);
  padding: 12px;
  width: 100%;
}

.app-sidebar.ant-layout-sider-collapsed .app-sidebar-footer {
  align-items: center;
  padding: 12px 0;
}

.app-sidebar-user {
  align-items: center;
  min-width: 0;
}

.app-sidebar.ant-layout-sider-collapsed .app-sidebar-user {
  justify-content: center;
  width: 100%;
}

.app-sidebar-user-name.ant-typography,
.app-sidebar-user-role.ant-typography {
  display: block;
  line-height: 1.2;
  max-width: 128px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-sidebar-user-name.ant-typography {
  color: var(--text) !important;
  font-weight: 800;
}

.app-sidebar-user-role.ant-typography {
  color: var(--text2) !important;
  font-size: 0.72rem;
}

.app-sidebar-logout.ant-btn {
  color: var(--red) !important;
}

.app-sidebar.ant-layout-sider-collapsed .app-sidebar-logout.ant-btn {
  height: 40px;
  width: 40px;
}

.app-sidebar-logout.ant-btn .anticon {
  font-size: 18px;
}

.app-sidebar-mobile-sider.ant-layout-sider {
  display: none;
}

:root[data-theme='dark'] .app-sidebar.ant-layout-sider,
:root[data-theme='dark'] .app-sidebar .ant-layout-sider-children {
  background: var(--sidebar-bg) !important;
}

:root[data-theme='dark'] .app-sidebar-menu .ant-menu-item-selected,
:root[data-theme='dark'] .app-sidebar-menu .ant-menu-item-selected:hover {
  background: var(--accent) !important;
  color: #111827 !important;
}

@media (max-width: 900px) {
  .app-sidebar-desktop.ant-layout-sider {
    display: none;
  }

  .app-sidebar-mobile-sider.ant-layout-sider {
    display: block;
    height: 100vh;
    background: var(--sidebar-bg) !important;
    border-right: 1px solid var(--sidebar-border);
    box-shadow: 2px 0 18px rgba(15, 23, 42, 0.12);
    overflow: visible;
    transition: all 0.5s ease !important;
  }

  .app-sidebar-mobile-sider .ant-layout-sider-children {
    overflow: hidden;
  }

  .app-sidebar-mobile-sider,
  .app-sidebar-mobile-sider .ant-layout-sider-children,
  .app-sidebar-mobile-sider .ant-layout-sider-zero-width-trigger,
  .app-sidebar-mobile-sider .ant-layout-sider-trigger {
    transition-duration: 1.2s !important;
  }

}
`;

function upsertSidebarStyles() {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("combined-sidebar-styles");
  const style = existing || document.createElement("style");
  style.id = "combined-sidebar-styles";
  style.textContent = sidebarStyles;
  if (!existing) {
    document.head.appendChild(style);
  }
}

upsertSidebarStyles();

function isVisible(item, user) {
  return typeof item.visible === "function" ? item.visible(user) : true;
}

function filterMenuForUser(menu, user) {
  return menu
    .filter((section) => isVisible(section, user))
    .map((section) => ({
      ...section,
      children: (section.children || []).filter((item) =>
        isVisible(item, user),
      ),
    }))
    .filter((section) => section.children.length > 0);
}

function buildMenuItems(menu) {
  return menu.map((section) => ({
    key: section.id,
    type: "group",
    label: section.label,
    children: section.children.map((item) => ({
      key: item.id,
      icon: ICON_MAP[item.icon] ?? null,
      label: item.label,
    })),
  }));
}

function SidebarBrand({ collapsed, roleLayout }) {
  return (
    <Space className="app-sidebar-brand" size={12} align="center">
      <Avatar size={40} icon={<AppstoreOutlined />} />
      {!collapsed && (
        <span>
          <Title level={5} className="app-sidebar-title">
            Sri Nikil
          </Title>
          <Text className="app-sidebar-subtitle">
            {roleLayout.label} Layout
          </Text>
        </span>
      )}
    </Space>
  );
}

function SidebarMenu({ collapsed, currentPage, menuItems, onNavigate }) {
  return (
    <div className="app-sidebar-menu-wrap">
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[currentPage]}
        onClick={onNavigate}
        items={menuItems}
        className="app-sidebar-menu"
      />
    </div>
  );
}

function SidebarFooter({ collapsed, user, roleLayout, onLogout }) {
  const userInitial = user?.user ? user.user.charAt(0).toUpperCase() : "U";

  return (
    <Space className="app-sidebar-footer" orientation="vertical" size={10}>
      <Space className="app-sidebar-user" size={10}>
        <Avatar>{userInitial}</Avatar>
        {!collapsed && (
          <span>
            <Text className="app-sidebar-user-name">
              {user?.user || "User"}
            </Text>
            <Text className="app-sidebar-user-role">
              {roleLayout.accessLabel}
            </Text>
          </span>
        )}
      </Space>

      <Popconfirm
        title="Logout?"
        description="Are you sure you want to logout?"
        okText="Yes"
        cancelText="No"
        okButtonProps={{ danger: true }}
        onConfirm={onLogout}
      >
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <Button
            block={!collapsed}
            danger
            type="text"
            icon={<PoweroffOutlined />}
            className="app-sidebar-logout"
          >
            {!collapsed && "Logout"}
          </Button>
        </Tooltip>
      </Popconfirm>
    </Space>
  );
}

export default function Sidebar({
  currentPage,
  setCurrentPage,
  user,
  onLogout,
}) {
  const {
    closeMobileSidebar,
    isCollapsed,
    isMobile,
    isMobileOpen,
    setMobileSidebarOpen,
  } = useSidebar();

  const roleLayout = getRoleLayout(user);
  const menu = useMemo(
    () => filterMenuForUser(getSidebarMenu(user), user),
    [user],
  );
  const menuItems = useMemo(() => buildMenuItems(menu), [menu]);

  const handleNavigate = useCallback(
    ({ key }) => {
      setCurrentPage(key);
      if (isMobile) closeMobileSidebar();
    },
    [closeMobileSidebar, isMobile, setCurrentPage],
  );

  const handleLogout = useCallback(() => {
    closeMobileSidebar();
    onLogout();
  }, [closeMobileSidebar, onLogout]);

  const content = (collapsed) => (
    <>
      <SidebarBrand collapsed={collapsed} roleLayout={roleLayout} />
      <SidebarMenu
        collapsed={collapsed}
        currentPage={currentPage}
        menuItems={menuItems}
        onNavigate={handleNavigate}
      />
      <SidebarFooter
        collapsed={collapsed}
        user={user}
        roleLayout={roleLayout}
        onLogout={handleLogout}
      />
    </>
  );

  return (
    <>
      <Sider
        className="app-sidebar app-sidebar-desktop"
        width={210}
        collapsedWidth={74}
        collapsed={isCollapsed}
        trigger={null}
      >
        {content(isCollapsed)}
      </Sider>

      <Sider
        className="app-sidebar app-sidebar-mobile-sider"
        width={280}
        collapsible
        collapsedWidth="0"
        style={mobileSiderStyle}
        collapsed={!isMobileOpen}
        trigger={isMobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        onCollapse={(collapsed) => setMobileSidebarOpen(!collapsed)}
      >
        {content(false)}
      </Sider>
    </>
  );
}
