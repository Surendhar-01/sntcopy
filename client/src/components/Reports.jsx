import React, { useMemo, useState } from "react";
import {
  CalendarOutlined,
  CloudDownloadOutlined,
  DollarOutlined,
  HistoryOutlined,
  LoginOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Row,
  Space,
  Typography,
  message,
  theme as antdTheme,
} from "antd";import { hasAdminAccess, isRole, USER_ROLES } from "../utils/roles";
import { useTheme } from "../context/useTheme";
const reportsStyles = ".reports-page-wrap {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n}\n\n.reports-page-wrap .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.reports-page-wrap .ant-card-body,\n.reports-page-wrap .ant-statistic,\n.reports-page-wrap .ant-statistic-content,\n.reports-page-wrap .ant-typography {\n  color: var(--text) !important;\n}\n\n.reports-page-wrap .ant-statistic-title {\n  color: var(--text2) !important;\n}\n\n.reports-filter-card .ant-card-body {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 16px;\n  padding: 16px;\n}\n\n.reports-filter-head {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.reports-filter-head > .ant-space {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.reports-filters {\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.reports-date {\n  width: 160px;\n}\n\n.reports-card {\n  height: 100%;\n  cursor: pointer;\n}\n\n.reports-card .ant-card-body {\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  min-height: 190px;\n  padding: 18px;\n}\n\n.reports-card-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 46px;\n  height: 46px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(217, 91, 61, 0.14), rgba(111, 32, 17, 0.08));\n  border: 1px solid var(--border);\n  color: var(--accent);\n  font-size: 1.25rem;\n}\n\n.reports-card-copy {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.reports-card-title {\n  color: var(--text) !important;\n  font-size: 1rem;\n  font-weight: 800;\n}\n\n.reports-card-meta {\n  font-size: 0.86rem;\n}\n\n.reports-card .ant-btn {\n  border: none;\n  color: #ffffff !important;\n  font-weight: 700;\n  box-shadow: none;\n}\n\n.reports-download-sales {\n  background: #d95b3d !important;\n}\n\n.reports-download-sales:hover,\n.reports-download-sales:focus {\n  background: #b84328 !important;\n}\n\n.reports-download-stock {\n  background: #d95b3d !important;\n}\n\n.reports-download-stock:hover,\n.reports-download-stock:focus {\n  background: #b84328 !important;\n}\n\n.reports-download-price {\n  background: #d95b3d !important;\n}\n\n.reports-download-price:hover,\n.reports-download-price:focus {\n  background: #b84328 !important;\n}\n\n.reports-download-login {\n  background: #d95b3d !important;\n}\n\n.reports-download-login:hover,\n.reports-download-login:focus {\n  background: #b84328 !important;\n}\n\n.reports-download-customer {\n  background: #d95b3d !important;\n}\n\n.reports-download-customer:hover,\n.reports-download-customer:focus {\n  background: #b84328 !important;\n}\n\n:root[data-theme='dark'] .reports-page-wrap .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .reports-page-wrap,\n:root[data-theme='dark'] .reports-page-wrap .ant-card-body,\n:root[data-theme='dark'] .reports-page-wrap .ant-statistic,\n:root[data-theme='dark'] .reports-page-wrap .ant-statistic-content,\n:root[data-theme='dark'] .reports-page-wrap .ant-typography,\n:root[data-theme='dark'] .reports-filter-head > .ant-space,\n:root[data-theme='dark'] .reports-card-title {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .reports-page-wrap .ant-statistic-title,\n:root[data-theme='dark'] .reports-card-meta {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .reports-card-icon {\n  background: #111827;\n  border-color: #334155;\n}\n\nhtml[data-theme='dark'] body .reports-page-wrap .ant-picker,\nhtml[data-theme='dark'] body .reports-page-wrap .ant-btn-default {\n  background-color: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .reports-page-wrap .ant-picker-input input,\nhtml[data-theme='dark'] body .reports-page-wrap .ant-picker-suffix {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .reports-page-wrap .ant-picker-input input::placeholder {\n  color: #94a3b8 !important;\n}\n\nhtml[data-theme='dark'] body .reports-page-wrap .ant-btn-default:hover,\nhtml[data-theme='dark'] body .reports-page-wrap .ant-btn-default:focus {\n  background: #263244 !important;\n  border-color: #475569 !important;\n  color: #ffffff !important;\n}\n\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-panel-container {\n  background: #111827 !important;\n  border: 1px solid #334155 !important;\n}\n\nhtml[data-theme='dark'] body .ant-picker-dropdown,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-header,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-content th {\n  color: #e5e7eb !important;\n}\n\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {\n  background: #263244 !important;\n  color: #ffffff !important;\n}\n\n@media (max-width: 768px) {\n  .reports-filter-card .ant-card-body {\n    align-items: stretch;\n    flex-direction: column;\n  }\n\n  .reports-filters {\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n    gap: 10px !important;\n  }\n\n  .reports-date {\n    width: 100%;\n  }\n\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-reports-styles")) {
  const style = document.createElement("style");
  style.id = "combined-reports-styles";
  style.textContent = reportsStyles;
  document.head.appendChild(style);
}

const { Text } = Typography;

const EMPTY_BILLS = [];
const EMPTY_PRODUCTS = [];
const EMPTY_PRICE_HISTORY = [];
const EMPTY_LOGIN_LOGS = [];
const EMPTY_CUSTOMERS = [];

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

const isWithinDateRange = (value, startDate, endDate) => {
  if (!value) return false;

  const current = new Date(value);
  if (Number.isNaN(current.getTime())) return false;

  const afterStart = current >= new Date(startDate);
  const beforeEnd = current <= new Date(`${endDate}T23:59:59`);
  return afterStart && beforeEnd;
};

const getDateValue = (dateValue) => {
  if (!dateValue) return "";
  return dateValue.format("YYYY-MM-DD");
};

const isSameUserName = (left, right) =>
  String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();

export default function Reports({ db, user }) {
  const { effectiveTheme } = useTheme();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const effectiveStartDate = getDateValue(startDate) || today;
  const effectiveEndDate = getDateValue(endDate) || today;
  const canManageAdminPages = hasAdminAccess(user);
  const isAdmin = isRole(user, USER_ROLES.ADMIN);
  const isDarkTheme = effectiveTheme === "dark";

  const billsSource = db.bills || EMPTY_BILLS;
  const products = db.products || EMPTY_PRODUCTS;
  const priceHistory = db.priceHistory || EMPTY_PRICE_HISTORY;
  const loginLogs = db.loginLogs || EMPTY_LOGIN_LOGS;
  const customers = db.customers || EMPTY_CUSTOMERS;

  const reportsAntTheme = useMemo(
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
        DatePicker: {
          activeBg: isDarkTheme ? "#111827" : "#ffffff",
          colorBgContainer: isDarkTheme ? "#111827" : "#ffffff",
        },
      },
    }),
    [isDarkTheme],
  );

  const bills = useMemo(
    () =>
      billsSource.filter((bill) => {
        const isMine = isSameUserName(bill.by || bill.by_user, user?.user);
        const canSee = canManageAdminPages || isMine;
        if (!canSee) return false;

        return isWithinDateRange(
          bill.date || bill.created_at,
          effectiveStartDate,
          effectiveEndDate,
        );
      }),
    [billsSource, canManageAdminPages, effectiveEndDate, effectiveStartDate, user],
  );

  const filteredPriceHistory = useMemo(
    () =>
      priceHistory.filter((history) =>
        isWithinDateRange(
          history.date || history.created_at,
          effectiveStartDate,
          effectiveEndDate,
        ),
      ),
    [effectiveEndDate, effectiveStartDate, priceHistory],
  );

  const filteredLoginLogs = useMemo(
    () =>
      loginLogs.filter((log) =>
        isWithinDateRange(
          log.loginTime || log.login_time || log.created_at,
          effectiveStartDate,
          effectiveEndDate,
        ),
      ),
    [effectiveEndDate, effectiveStartDate, loginLogs],
  );

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        isWithinDateRange(
          customer.lastVisit || customer.last_visit || customer.created_at,
          effectiveStartDate,
          effectiveEndDate,
        ),
      ),
    [customers, effectiveEndDate, effectiveStartDate],
  );

  const dateSuffix = `_${effectiveStartDate}_to_${effectiveEndDate}`;

  const downloadCSV = (type) => {
    if (!isAdmin && ["price", "login", "customer"].includes(type)) {
      message.warning("This report is available for admin users only");
      return;
    }

    let csv = "";
    let filename = "";

    if (type === "sales") {
      csv = "Bill No,Date,Customer,Phone,Payment,Items,Subtotal,CGST,SGST,Grand Total,By\n";
      csv += bills
        .map(
          (bill) =>
            `${bill.billNo},${new Date(bill.date || bill.created_at).toLocaleString()},${bill.customer},${bill.phone || ""},${bill.payment},${(bill.items || []).length},${Number(bill.subtotal || 0).toFixed(2)},${Number(bill.cgst || 0).toFixed(2)},${Number(bill.sgst || 0).toFixed(2)},${Number(bill.grand || 0).toFixed(2)},${bill.by || bill.by_user || ""}`,
        )
        .join("\n");
      filename = canManageAdminPages
        ? `FullSalesReport${dateSuffix}_${today}.csv`
        : `MySalesReport_${user?.user}${dateSuffix}_${today}.csv`;
    } else if (type === "stock") {
      csv = "Product,Category,Unit,Price,Opening Stock,Sold,Current Stock,Status\n";
      csv += products
        .map(
          (product) =>
            `${product.name},${product.cat},${product.unit},${product.price},${Number(product.opening_stock || 0)},${product.sold || 0},${product.stock},${product.stock === 0 ? "Out of Stock" : product.stock <= 5 ? "Low Stock" : "OK"}`,
        )
        .join("\n");
      filename = `StockReport_${today}.csv`;
    } else if (type === "price") {
      csv = "Date,Product,Old Price,New Price,Changed By\n";
      csv += filteredPriceHistory
        .map(
          (history) =>
            `${new Date(history.date || history.created_at).toLocaleDateString()},${history.product},${history.old},${history.new},${history.by}`,
        )
        .join("\n");
      filename = `PriceHistory${dateSuffix}_${today}.csv`;
    } else if (type === "login") {
      csv = "#,User,Role,Login Time,Logout Time,Duration,Status\n";
      csv += filteredLoginLogs
        .map((log, index) => {
          const loginTime = log.loginTime || log.login_time;
          const logoutTime = log.logoutTime || log.logout_time;
          const duration = logoutTime ? formatDuration(loginTime, logoutTime) : "Active";
          return `${index + 1},${log.user},${log.role},${new Date(loginTime).toLocaleString()},${logoutTime ? new Date(logoutTime).toLocaleString() : "Online"},${duration},${logoutTime ? "Ended" : "Online"}`;
        })
        .join("\n");
      filename = `LoginActivity${dateSuffix}_${today}.csv`;
    } else if (type === "customer") {
      csv = "Name,Phone,Visits,Total Purchased,First Visit,Last Visit\n";
      csv += filteredCustomers
        .map(
          (customer) =>
            `${customer.name},${customer.phone || ""},${customer.visits},${Number(customer.total || 0).toFixed(2)},${customer.firstVisit ? new Date(customer.firstVisit).toLocaleDateString() : "-"},${customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "-"}`,
        )
        .join("\n");
      filename = `CustomerReport${dateSuffix}_${today}.csv`;
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    message.success("Report downloaded");
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const reportCards = [
    {
      key: "sales",
      title: canManageAdminPages ? "Sales Report (All)" : "My Sales Report",
      meta: `Bills in range: ${bills.length}`,
      icon: <ShoppingCartOutlined />,
      buttonClassName: "reports-download-sales",
      onClick: () => downloadCSV("sales"),
    },
    {
      key: "stock",
      title: "Current Stock Report",
      meta: `Total products: ${products.length}`,
      icon: <DollarOutlined />,
      buttonClassName: "reports-download-stock",
      onClick: () => downloadCSV("stock"),
    },
    ...(isAdmin
      ? [
          {
            key: "price",
            title: "Price History",
            meta: `Changes in range: ${filteredPriceHistory.length}`,
            icon: <HistoryOutlined />,
            buttonClassName: "reports-download-price",
            onClick: () => downloadCSV("price"),
          },
          {
            key: "login",
            title: "Login Activity",
            meta: `Sessions in range: ${filteredLoginLogs.length}`,
            icon: <LoginOutlined />,
            buttonClassName: "reports-download-login",
            onClick: () => downloadCSV("login"),
          },
          {
            key: "customer",
            title: "Customer Report",
            meta: `Customers in range: ${filteredCustomers.length}`,
            icon: <TeamOutlined />,
            buttonClassName: "reports-download-customer",
            onClick: () => downloadCSV("customer"),
          },
        ]
      : []),
  ];

  return (
    <ConfigProvider theme={reportsAntTheme}>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-description">
          Generate comprehensive sales and business reports.
        </p>
      </div>

      <div className="reports-page-wrap">
        <Card className="reports-filter-card no-print">
          <div className="reports-filter-head">
            <Space>
              <CloudDownloadOutlined />
              <span>Reports Download</span>
            </Space>
            <Text type="secondary">
              Choose a date range, or leave both empty to download only today's reports.
            </Text>
          </div>

          <Space className="reports-filters" size={12} wrap>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="From date"
              suffixIcon={<CalendarOutlined />}
              className="reports-date"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="To date"
              suffixIcon={<CalendarOutlined />}
              minDate={startDate || undefined}
              className="reports-date"
            />
            <Button icon={<SyncOutlined />} onClick={clearDates}>Clear Dates</Button>
          </Space>
        </Card>

        <Row gutter={[16, 16]} className="reports-cards-grid">
          {reportCards.map((report) => (
            <Col key={report.key} xs={24} sm={12} xl={8}>
              <Card
                hoverable
                className="reports-card"
                onClick={report.onClick}
              >
                <div className="reports-card-icon">{report.icon}</div>
                <div className="reports-card-copy">
                  <Text className="reports-card-title">{report.title}</Text>
                  <Text type="secondary" className="reports-card-meta">
                    {report.meta}
                  </Text>
                </div>
                <Button
                  type="primary"
                  icon={<CloudDownloadOutlined />}
                  block
                  className={report.buttonClassName}
                  onClick={(event) => {
                    event.stopPropagation();
                    report.onClick();
                  }}
                >
                  Download CSV
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </ConfigProvider>
  );
}
