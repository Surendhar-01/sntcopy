import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarOutlined,
  SyncOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Empty,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  theme as antdTheme,
} from "antd";import { useTheme } from "../context/useTheme";
const customersStyles = ".customers-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n  width: 100%;\n}\n\n.customers-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.customers-page .ant-card-body,\n.customers-page .ant-card-head,\n.customers-page .ant-typography {\n  color: var(--text) !important;\n}\n\n.customers-page .ant-card-head {\n  min-height: 52px;\n  padding: 0 20px;\n  border-bottom-color: var(--border);\n}\n\n.customers-page .ant-card-head-title {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.customers-toolbar-card .ant-card-body {\n  padding: 16px;\n}\n\n.customers-filters {\n  width: 100%;\n  align-items: center;\n  column-gap: 12px;\n  row-gap: 12px;\n}\n\n.customers-search {\n  width: 310px;\n}\n\n.customers-date {\n  width: 160px;\n}\n\n.customers-sort {\n  width: 190px;\n}\n\n.customers-filters .ant-btn {\n  min-width: 72px;\n}\n\n.customers-result-count {\n  display: block;\n  margin-top: 12px;\n  font-size: 0.82rem;\n}\n\n.customers-table-card {\n  overflow: hidden;\n}\n\n.customers-table-card .ant-card-body {\n  padding: 0;\n}\n\n.customers-stats-pill {\n  min-height: 32px;\n  padding: 5px 14px;\n  border: 1px solid var(--border);\n  border-radius: 999px;\n  background: var(--bg);\n  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);\n}\n\n.customers-stats-value {\n  color: var(--accent) !important;\n  font-weight: 800;\n}\n\n.customers-stats-divider {\n  width: 1px;\n  height: 16px;\n  background: var(--border);\n}\n\n.customers-table-card .ant-table {\n  background: transparent;\n  color: var(--text);\n  table-layout: fixed;\n}\n\n.customers-table-card .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 800;\n  padding: 13px 22px;\n  vertical-align: middle;\n}\n\n.customers-table-card .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.customers-table-card .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 58px;\n  padding: 10px 22px;\n  vertical-align: middle;\n}\n\n.customers-table-card .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.customers-name-cell {\n  max-width: 100%;\n  width: 100%;\n}\n\n.customers-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  flex: 0 0 32px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(249, 115, 22, 0.14));\n  border: 1px solid var(--border);\n  color: var(--text);\n  font-size: 0.78rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n\n.customers-name,\n.customers-number,\n.customers-money {\n  color: var(--text) !important;\n  display: block;\n  font-weight: 800;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.customers-money {\n  color: var(--green) !important;\n}\n\n.customers-table-card .ant-tag {\n  margin-inline-end: 0;\n}\n\n.customers-table-card .ant-pagination {\n  margin: 14px 20px 16px !important;\n}\n\n:root[data-theme='dark'] .customers-page .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .customers-page,\n:root[data-theme='dark'] .customers-page .ant-card-body,\n:root[data-theme='dark'] .customers-page .ant-card-head,\n:root[data-theme='dark'] .customers-page .ant-card-head-title,\n:root[data-theme='dark'] .customers-page .ant-typography,\n:root[data-theme='dark'] .customers-page .customers-name,\n:root[data-theme='dark'] .customers-page .customers-number {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .customers-page .customers-result-count {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .customers-stats-pill {\n  background: #111827;\n  border-color: #334155;\n}\n\n:root[data-theme='dark'] .customers-stats-divider {\n  background: #334155;\n}\n\nhtml[data-theme='dark'] body .customers-page .ant-input,\nhtml[data-theme='dark'] body .customers-page .ant-input-affix-wrapper,\nhtml[data-theme='dark'] body .customers-page .ant-picker,\nhtml[data-theme='dark'] body .customers-page .ant-select .ant-select-selector,\nhtml[data-theme='dark'] body .customers-page .ant-btn-default {\n  background-color: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .customers-page .ant-input-affix-wrapper input {\n  background: transparent !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .customers-page .ant-input::placeholder,\nhtml[data-theme='dark'] body .customers-page .ant-input-affix-wrapper input::placeholder,\nhtml[data-theme='dark'] body .customers-page .ant-picker-input input::placeholder {\n  color: #94a3b8 !important;\n}\n\nhtml[data-theme='dark'] body .customers-page .ant-input-prefix,\nhtml[data-theme='dark'] body .customers-page .ant-picker-input input,\nhtml[data-theme='dark'] body .customers-page .ant-picker-suffix,\nhtml[data-theme='dark'] body .customers-page .ant-select-selection-item,\nhtml[data-theme='dark'] body .customers-page .ant-select-arrow {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .customers-page .ant-btn-default:hover,\nhtml[data-theme='dark'] body .customers-page .ant-btn-default:focus {\n  background: #263244 !important;\n  border-color: #475569 !important;\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-table,\n:root[data-theme='dark'] .customers-table-card .ant-table-container,\n:root[data-theme='dark'] .customers-table-card .ant-table-content,\n:root[data-theme='dark'] .customers-table-card .ant-table-cell-scrollbar {\n  background: #1b2433 !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-table-tbody > tr > td {\n  background: #1b2433 !important;\n  border-bottom-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-table-tbody > tr.ant-table-row:hover > td,\n:root[data-theme='dark'] .customers-table-card .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-pagination-item,\n:root[data-theme='dark'] .customers-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .customers-table-card .ant-pagination-next button {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-pagination-item a,\n:root[data-theme='dark'] .customers-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .customers-table-card .ant-pagination-next button {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-pagination-item-active {\n  border-color: var(--accent) !important;\n}\n\n:root[data-theme='dark'] .customers-table-card .ant-pagination-item-active a {\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .customers-page .ant-tag {\n  background: #111827;\n  border-color: #334155;\n  color: #e5e7eb;\n}\n\n:root[data-theme='dark'] .customers-page .ant-tag-green {\n  background: rgba(34, 197, 94, 0.14);\n  border-color: rgba(74, 222, 128, 0.34);\n  color: #bbf7d0;\n}\n\n:root[data-theme='dark'] .customers-page .ant-tag-blue {\n  background: rgba(37, 99, 235, 0.18);\n  border-color: rgba(96, 165, 250, 0.36);\n  color: #bfdbfe;\n}\n\nhtml[data-theme='dark'] body .ant-select-dropdown,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-panel-container {\n  background: #111827 !important;\n  border: 1px solid #334155 !important;\n}\n\nhtml[data-theme='dark'] body .ant-select-dropdown .ant-select-item,\nhtml[data-theme='dark'] body .ant-picker-dropdown,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-header,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-content th {\n  color: #e5e7eb !important;\n}\n\nhtml[data-theme='dark'] body .ant-select-dropdown .ant-select-item-option-active,\nhtml[data-theme='dark'] body .ant-select-dropdown .ant-select-item-option-selected,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {\n  background: #263244 !important;\n  color: #ffffff !important;\n}\n\n@media (max-width: 768px) {\n  .customers-search,\n  .customers-date,\n  .customers-sort {\n    width: 100%;\n  }\n\n  .customers-filters {\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n    gap: 10px !important;\n  }\n\n  .customers-table-card .ant-table-thead > tr > th,\n  .customers-table-card .ant-table-tbody > tr > td {\n    padding: 12px 14px;\n  }\n\n  .customers-table-card .ant-card-head {\n    align-items: stretch;\n    flex-direction: column;\n    gap: 10px;\n    padding-block: 12px;\n  }\n\n  .customers-table-card .ant-card-extra {\n    margin-left: 0;\n  }\n\n  .customers-stats-pill {\n    width: 100%;\n    justify-content: center;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-customers-styles")) {
  const style = document.createElement("style");
  style.id = "combined-customers-styles";
  style.textContent = customersStyles;
  document.head.appendChild(style);
}

const { Text } = Typography;

const EMPTY_CUSTOMERS = [];

const sortOptions = [
  { value: "visit-newest", label: "Newest Visit" },
  { value: "visit-oldest", label: "Oldest Visit" },
  { value: "revenue-desc", label: "Revenue High-Low" },
  { value: "revenue-asc", label: "Revenue Low-High" },
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const getCustomerInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "C";

export default function Customers({ db, fetchCustomers }) {
  const { effectiveTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortBy, setSortBy] = useState("revenue-desc");

  const customers = Array.isArray(db.customers) ? db.customers : EMPTY_CUSTOMERS;
  const isDarkTheme = effectiveTheme === "dark";

  const customersAntTheme = useMemo(
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
        Input: {
          activeBg: isDarkTheme ? "#111827" : "#ffffff",
          colorBgContainer: isDarkTheme ? "#111827" : "#ffffff",
        },
        Select: {
          optionSelectedBg: isDarkTheme ? "#263244" : "#e6f4ff",
          selectorBg: isDarkTheme ? "#111827" : "#ffffff",
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
    if (fetchCustomers) {
      fetchCustomers().catch(() => {});
    }
  }, [fetchCustomers]);

  const filteredAndSortedCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const start = startDate ? startDate.startOf("day").toDate() : null;
    const end = endDate ? endDate.endOf("day").toDate() : null;

    return customers
      .filter((customer) => {
        const matchesSearch =
          !normalizedSearch ||
          [customer.name, customer.phone].some((value) =>
            String(value || "").toLowerCase().includes(normalizedSearch),
          );

        if (!matchesSearch) return false;

        const lastVisitStr = customer.lastVisit;
        if (!start && !end) return true;
        if (!lastVisitStr) return false;

        const lastVisit = new Date(lastVisitStr);
        const afterStart = !start || lastVisit >= start;
        const beforeEnd = !end || lastVisit <= end;

        return afterStart && beforeEnd;
      })
      .sort((a, b) => {
        if (sortBy === "revenue-desc") return Number(b.total || 0) - Number(a.total || 0);
        if (sortBy === "revenue-asc") return Number(a.total || 0) - Number(b.total || 0);

        const dateA = new Date(a.lastVisit || 0);
        const dateB = new Date(b.lastVisit || 0);
        if (sortBy === "visit-newest") return dateB - dateA;
        if (sortBy === "visit-oldest") return dateA - dateB;

        return 0;
      });
  }, [customers, endDate, searchTerm, sortBy, startDate]);

  const totalCustomers = filteredAndSortedCustomers.length;
  const totalRevenue = filteredAndSortedCustomers.reduce(
    (sum, customer) => sum + Number(customer.total || 0),
    0,
  );

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setSortBy("revenue-desc");
  };

  const customerColumns = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (name) => (
        <Space size={10} className="customers-name-cell">
          <div className="customers-avatar">{getCustomerInitials(name)}</div>
          <Text className="customers-name">{name || "Customer"}</Text>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: "18%",
      render: (phone) => <Text type="secondary">{phone || "-"}</Text>,
    },
    {
      title: "Visits",
      dataIndex: "visits",
      key: "visits",
      align: "center",
      width: "12%",
      render: (visits) => <Text className="customers-number">{Number(visits || 0)}</Text>,
    },
    {
      title: "Total Purchases",
      dataIndex: "total",
      key: "total",
      align: "right",
      width: "18%",
      render: (total) => <Text className="customers-money">{formatCurrency(total)}</Text>,
    },
    {
      title: "Last Visit",
      dataIndex: "lastVisit",
      key: "lastVisit",
      width: "14%",
      render: (lastVisit) => <Text type="secondary">{formatDate(lastVisit)}</Text>,
    },
    {
      title: "Type",
      key: "type",
      align: "center",
      width: "8%",
      render: (_, customer) => (
        <Tag color={Number(customer.visits || 0) > 1 ? "green" : "blue"}>
          {Number(customer.visits || 0) > 1 ? "Returning" : "New"}
        </Tag>
      ),
    },
  ];

  return (
    <ConfigProvider theme={customersAntTheme}>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-description">View customer purchase history and details.</p>
      </div>

      <div className="customers-page">
        <Card className="customers-toolbar-card">
          <Space className="customers-filters" size={12} wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search customer or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="customers-search"
            />
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="From date"
              suffixIcon={<CalendarOutlined />}
              className="customers-date"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="To date"
              suffixIcon={<CalendarOutlined />}
              className="customers-date"
            />
            <Select
              value={sortBy}
              options={sortOptions}
              onChange={setSortBy}
              suffixIcon={<SortAscendingOutlined />}
              className="customers-sort"
            />
            <Button icon={<SyncOutlined />} onClick={resetFilters}>Reset</Button>
          </Space>
          <Text type="secondary" className="customers-result-count">
            Showing {filteredAndSortedCustomers.length} of {customers.length} customers
          </Text>
        </Card>

        <Card
          className="customers-table-card"
          title={
            <Space>
              <TeamOutlined />
              <span>Customer Database</span>
            </Space>
          }
          extra={
            <Space className="customers-stats-pill" size={10} wrap>
              <Text type="secondary">Total Customers:</Text>
              <Text className="customers-stats-value">{totalCustomers}</Text>
              <span className="customers-stats-divider" />
              <Text type="secondary">Amount:</Text>
              <Text className="customers-stats-value">
                {formatCurrency(totalRevenue)}
              </Text>
            </Space>
          }
        >
          <Table
            rowKey="id"
            columns={customerColumns}
            dataSource={filteredAndSortedCustomers}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 980 }}
            tableLayout="fixed"
            locale={{
              emptyText: <Empty description="No customers found matching your criteria" />,
            }}
          />
        </Card>
      </div>
    </ConfigProvider>
  );
}
