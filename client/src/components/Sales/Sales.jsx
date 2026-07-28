import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarOutlined,
  FileTextOutlined,
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
} from "antd";
import "./Sales.css";
import { hasAdminAccess } from "../../utils/roles";
import { useTheme } from "../../context/useTheme";

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
            <Button onClick={resetFilters}>Reset</Button>
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
