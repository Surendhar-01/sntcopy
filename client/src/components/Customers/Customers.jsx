import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarOutlined,
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
} from "antd";
import "./Customers.css";
import { useTheme } from "../../context/useTheme";

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
            <Button onClick={resetFilters}>Reset</Button>
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
