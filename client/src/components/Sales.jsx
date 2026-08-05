import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarOutlined,
  FileTextOutlined,
  SyncOutlined,
  SearchOutlined,
  SortAscendingOutlined,
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
} from "antd";import { hasAdminAccess } from "../utils/roles";
import { useTheme } from "../context/useTheme";
const salesStyles = ".sales-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n  width: 100%;\n}\n\n.sales-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.sales-page .ant-card-body,\n.sales-page .ant-card-head,\n.sales-page .ant-statistic,\n.sales-page .ant-statistic-content,\n.sales-page .ant-typography {\n  color: var(--text) !important;\n}\n\n.sales-page .ant-card-head {\n  min-height: 52px;\n  padding: 0 20px;\n  border-bottom-color: var(--border);\n}\n\n.sales-page .ant-card-head-title {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.sales-page .ant-statistic-title {\n  color: var(--text2) !important;\n}\n\n.sales-toolbar-card .ant-card-body {\n  padding: 16px;\n}\n\n.sales-controls {\n  width: 100%;\n  align-items: center;\n  column-gap: 12px;\n  row-gap: 12px;\n}\n\n.sales-search {\n  width: 310px;\n}\n\n.sales-date {\n  width: 160px;\n}\n\n.sales-sort {\n  width: 180px;\n}\n\n.sales-controls .ant-btn {\n  min-width: 72px;\n}\n\n.sales-result-count {\n  display: block;\n  margin-top: 12px;\n  font-size: 0.82rem;\n}\n\n.sales-table-card {\n  overflow: hidden;\n}\n\n.sales-table-card .ant-card-body {\n  padding: 0;\n}\n\n.sales-stats-pill {\n  min-height: 32px;\n  padding: 5px 14px;\n  border: 1px solid var(--border);\n  border-radius: 999px;\n  background: var(--bg);\n  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);\n}\n\n.sales-stats-value {\n  color: var(--accent) !important;\n  font-weight: 800;\n}\n\n.sales-stats-divider {\n  width: 1px;\n  height: 16px;\n  background: var(--border);\n}\n\n.sales-table-card .ant-table {\n  background: transparent;\n  color: var(--text);\n  table-layout: fixed;\n}\n\n.sales-table-card .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 800;\n  padding: 13px 22px;\n  vertical-align: middle;\n}\n\n.sales-table-card .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.sales-table-card .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 58px;\n  padding: 10px 22px;\n  vertical-align: middle;\n}\n\n.sales-table-card .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.sales-bill-no,\n.sales-money {\n  color: var(--text) !important;\n  display: block;\n  font-weight: 800;\n  white-space: nowrap;\n}\n\n.sales-customer-cell {\n  max-width: 100%;\n  width: 100%;\n}\n\n.sales-customer-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  flex: 0 0 32px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(249, 115, 22, 0.14));\n  border: 1px solid var(--border);\n  color: var(--text);\n  font-size: 0.78rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n\n.sales-table-card .ant-pagination {\n  margin: 14px 20px 16px !important;\n}\n\n.sales-table-card .ant-table-tbody > tr:last-child > td {\n  border-bottom: 1px solid var(--border);\n}\n\n.sales-customer-name {\n  color: var(--text) !important;\n  display: block;\n  font-weight: 800;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.sales-table-card .ant-table-thead > tr > th:nth-child(5),\n.sales-table-card .ant-table-tbody > tr > td:nth-child(5),\n.sales-table-card .ant-table-thead > tr > th:nth-child(6),\n.sales-table-card .ant-table-tbody > tr > td:nth-child(6) {\n  text-align: center;\n}\n\n.sales-table-card .ant-tag {\n  margin-inline-end: 0;\n}\n\n:root[data-theme='dark'] .sales-page .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .sales-page,\n:root[data-theme='dark'] .sales-page .ant-card-body,\n:root[data-theme='dark'] .sales-page .ant-card-head,\n:root[data-theme='dark'] .sales-page .ant-card-head-title,\n:root[data-theme='dark'] .sales-page .ant-statistic,\n:root[data-theme='dark'] .sales-page .ant-statistic-content,\n:root[data-theme='dark'] .sales-page .ant-typography,\n:root[data-theme='dark'] .sales-page .sales-bill-no,\n:root[data-theme='dark'] .sales-page .sales-money,\n:root[data-theme='dark'] .sales-page .sales-customer-name {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .sales-page .ant-statistic-title,\n:root[data-theme='dark'] .sales-page .sales-result-count {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .sales-stats-pill {\n  background: #111827;\n  border-color: #334155;\n}\n\n:root[data-theme='dark'] .sales-stats-divider {\n  background: #334155;\n}\n\nhtml[data-theme='dark'] body .sales-page .ant-input,\nhtml[data-theme='dark'] body .sales-page .ant-input-affix-wrapper,\nhtml[data-theme='dark'] body .sales-page .ant-picker,\nhtml[data-theme='dark'] body .sales-page .ant-select .ant-select-selector,\nhtml[data-theme='dark'] body .sales-page .ant-btn-default {\n  background-color: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .sales-page .ant-input-affix-wrapper input {\n  background: transparent !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .sales-page .ant-input::placeholder,\nhtml[data-theme='dark'] body .sales-page .ant-input-affix-wrapper input::placeholder,\nhtml[data-theme='dark'] body .sales-page .ant-picker-input input::placeholder {\n  color: #94a3b8 !important;\n}\n\nhtml[data-theme='dark'] body .sales-page .ant-input-prefix,\nhtml[data-theme='dark'] body .sales-page .ant-picker-input input,\nhtml[data-theme='dark'] body .sales-page .ant-picker-suffix,\nhtml[data-theme='dark'] body .sales-page .ant-select-selection-item,\nhtml[data-theme='dark'] body .sales-page .ant-select-arrow {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .sales-page .ant-btn-default:hover,\nhtml[data-theme='dark'] body .sales-page .ant-btn-default:focus {\n  background: #263244 !important;\n  border-color: #475569 !important;\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-table,\n:root[data-theme='dark'] .sales-table-card .ant-table-container,\n:root[data-theme='dark'] .sales-table-card .ant-table-content,\n:root[data-theme='dark'] .sales-table-card .ant-table-cell-scrollbar {\n  background: #1b2433 !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-table-tbody > tr > td {\n  background: #1b2433 !important;\n  border-bottom-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-table-tbody > tr.ant-table-row:hover > td,\n:root[data-theme='dark'] .sales-table-card .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-pagination-item,\n:root[data-theme='dark'] .sales-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .sales-table-card .ant-pagination-next button {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-pagination-item a,\n:root[data-theme='dark'] .sales-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .sales-table-card .ant-pagination-next button {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-pagination-item-active {\n  border-color: var(--accent) !important;\n}\n\n:root[data-theme='dark'] .sales-table-card .ant-pagination-item-active a {\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .sales-page .ant-tag {\n  background: #111827;\n  border-color: #334155;\n  color: #e5e7eb;\n}\n\n:root[data-theme='dark'] .sales-page .ant-tag-green {\n  background: rgba(34, 197, 94, 0.14);\n  border-color: rgba(74, 222, 128, 0.34);\n  color: #bbf7d0;\n}\n\n:root[data-theme='dark'] .sales-page .ant-tag-blue {\n  background: rgba(37, 99, 235, 0.18);\n  border-color: rgba(96, 165, 250, 0.36);\n  color: #bfdbfe;\n}\n\nhtml[data-theme='dark'] body .ant-select-dropdown,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-panel-container {\n  background: #111827 !important;\n  border: 1px solid #334155 !important;\n}\n\nhtml[data-theme='dark'] body .ant-select-dropdown .ant-select-item,\nhtml[data-theme='dark'] body .ant-picker-dropdown,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-header,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-content th {\n  color: #e5e7eb !important;\n}\n\nhtml[data-theme='dark'] body .ant-select-dropdown .ant-select-item-option-active,\nhtml[data-theme='dark'] body .ant-select-dropdown .ant-select-item-option-selected,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,\nhtml[data-theme='dark'] body .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {\n  background: #263244 !important;\n  color: #ffffff !important;\n}\n\n@media (max-width: 768px) {\n  .sales-search,\n  .sales-date,\n  .sales-sort {\n    width: 100%;\n  }\n\n  .sales-controls {\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n    gap: 10px !important;\n  }\n\n  .sales-table-card .ant-table-thead > tr > th,\n  .sales-table-card .ant-table-tbody > tr > td {\n    padding: 12px 14px;\n  }\n\n  .sales-table-card .ant-card-head {\n    align-items: stretch;\n    flex-direction: column;\n    gap: 10px;\n    padding-block: 12px;\n  }\n\n  .sales-table-card .ant-card-extra {\n    margin-left: 0;\n  }\n\n  .sales-stats-pill {\n    width: 100%;\n    justify-content: center;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-sales-styles")) {
  const style = document.createElement("style");
  style.id = "combined-sales-styles";
  style.textContent = salesStyles;
  document.head.appendChild(style);
}

const { Text } = Typography;

const EMPTY_BILLS = [];

const sortOptions = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "price-high", label: "Amount High-Low" },
  { value: "price-low", label: "Amount Low-High" },
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const isSameUserName = (left, right) =>
  String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();

export default function Sales({ db, fetchBills, user }) {
  const { effectiveTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc");

  const bills = db.bills || EMPTY_BILLS;
  const canManageAdminPages = hasAdminAccess(user);
  const isDarkTheme = effectiveTheme === "dark";

  const salesAntTheme = useMemo(
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
    if (fetchBills) {
      fetchBills().catch(() => {});
    }
  }, [fetchBills]);

  const filteredBills = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const start = startDate ? startDate.startOf("day").toDate() : null;
    const end = endDate ? endDate.endOf("day").toDate() : null;

    return bills
      .filter((bill) => {
        const isMine = isSameUserName(bill.by || bill.by_user, user?.user);
        const canSee = canManageAdminPages || isMine;
        if (!canSee) return false;

        const matchesSearch =
          !normalizedSearch ||
          [bill.billNo, bill.customer, bill.payment, bill.by, bill.by_user].some(
            (value) => String(value || "").toLowerCase().includes(normalizedSearch),
          );

        const billDateStr = bill.date || bill.created_at;
        if (!billDateStr) return matchesSearch;

        const billDate = new Date(billDateStr);
        const afterStart = !start || billDate >= start;
        const beforeEnd = !end || billDate <= end;

        return matchesSearch && afterStart && beforeEnd;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || 0);
        const dateB = new Date(b.date || b.created_at || 0);

        if (sortBy === "date-desc") return dateB - dateA;
        if (sortBy === "date-asc") return dateA - dateB;
        if (sortBy === "price-high") return Number(b.grand || 0) - Number(a.grand || 0);
        if (sortBy === "price-low") return Number(a.grand || 0) - Number(b.grand || 0);
        return 0;
      });
  }, [bills, canManageAdminPages, endDate, searchTerm, sortBy, startDate, user]);

  const salesSummary = useMemo(() => {
    const totalAmount = filteredBills.reduce(
      (sum, bill) => sum + Number(bill.grand || 0),
      0,
    );
    return {
      totalBills: filteredBills.length,
      totalAmount,
    };
  }, [filteredBills]);

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setSortBy("date-desc");
  };

  const salesColumns = [
    {
      title: "Bill No",
      dataIndex: "billNo",
      key: "billNo",
      width: "14%",
      render: (billNo) => <Text className="sales-bill-no">{billNo || "-"}</Text>,
    },
    {
      title: "Date",
      key: "date",
      width: "20%",
      render: (_, bill) => (
        <Text type="secondary">{formatDate(bill.date || bill.created_at)}</Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      width: "26%",
      render: (customer) => (
        <Space size={10} className="sales-customer-cell">
          <div className="sales-customer-avatar">
            {String(customer || "C").slice(0, 2).toUpperCase()}
          </div>
          <Text className="sales-customer-name">{customer || "Walk-in"}</Text>
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "grand",
      key: "grand",
      align: "right",
      width: "15%",
      render: (grand) => (
        <Text className="sales-money">{formatCurrency(grand)}</Text>
      ),
    },
    {
      title: "Method",
      dataIndex: "payment",
      key: "payment",
      align: "center",
      width: "12%",
      render: (payment) => (
        <Tag color={payment === "Cash" ? "green" : "blue"}>
          {payment || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Issued By",
      key: "by",
      width: "13%",
      render: (_, bill) => (
        <Text type="secondary">{bill.by || bill.by_user || "System"}</Text>
      ),
    },
  ];

  return (
    <ConfigProvider theme={salesAntTheme}>
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
        <p className="page-description">
          View {canManageAdminPages ? "all sales history and details." : "your sales history and details."}
        </p>
      </div>

      <div className="sales-page">
        <Card className="sales-toolbar-card">
          <Space className="sales-controls" size={12} wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search customer, bill, payment"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="sales-search"
            />
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="From date"
              suffixIcon={<CalendarOutlined />}
              className="sales-date"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="To date"
              suffixIcon={<CalendarOutlined />}
              className="sales-date"
            />
            <Select
              value={sortBy}
              options={sortOptions}
              onChange={setSortBy}
              suffixIcon={<SortAscendingOutlined />}
              className="sales-sort"
            />
            <Button icon={<SyncOutlined />} onClick={resetFilters}>Reset</Button>
          </Space>
          <Text type="secondary" className="sales-result-count">
            Showing {filteredBills.length} of {bills.length} bills
          </Text>
        </Card>

        <Card
          className="sales-table-card"
          title={
            <Space>
              <FileTextOutlined />
              <span>{canManageAdminPages ? "Sales History" : "My Sales History"}</span>
            </Space>
          }
          extra={
            <Space className="sales-stats-pill" size={10} wrap>
              <Text type="secondary">Total Bills:</Text>
              <Text className="sales-stats-value">{salesSummary.totalBills}</Text>
              <span className="sales-stats-divider" />
              <Text type="secondary">Amount:</Text>
              <Text className="sales-stats-value">
                {formatCurrency(salesSummary.totalAmount)}
              </Text>
            </Space>
          }
        >
          <Table
            rowKey="id"
            columns={salesColumns}
            dataSource={filteredBills}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 920 }}
            tableLayout="fixed"
            locale={{
              emptyText: <Empty description="No bills found matching filters" />,
            }}
          />
        </Card>
      </div>
    </ConfigProvider>
  );
}
