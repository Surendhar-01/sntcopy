import React, { useState, useEffect, useMemo } from "react";
import {
  AppstoreOutlined,
  BarsOutlined,
  DeleteOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import "./Products.css";
import { hasAdminAccess } from "../../utils/roles";
import { useTheme } from "../../context/useTheme";

const { Text, Title } = Typography;

const EMPTY_PRODUCTS = [];

const categoryOptions = [
  "Groundnut",
  "Sunflower",
  "Palm",
  "Vanaspati",
  "Sesame",
  "Castor",
  "Coconut",
];

const sortOptions = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "price-low", label: "Price Low-High" },
  { value: "price-high", label: "Price High-Low" },
];

const stockOptions = [
  { value: "all", label: "All stock" },
  { value: "available", label: "Available" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

const getProductInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "P";

const getStockMeta = (stock = 0) => {
  if (stock <= 0) {
    return { color: "red", label: "Out of stock" };
  }

  if (stock <= 5) {
    return { color: "orange", label: `Only ${stock} left` };
  }

  return { color: "green", label: `${stock} in stock` };
};

export default function Products({ db, erp, user }) {
  const [form] = Form.useForm();
  const { effectiveTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = hasAdminAccess(user);
  const products = db.products || EMPTY_PRODUCTS;
  const isDarkTheme = effectiveTheme === "dark";

  const productsAntTheme = useMemo(
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
        colorBorder: isDarkTheme ? "#334155" : "#d9d9d9",
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
    erp.fetchProducts().catch(() => {});
  }, [erp]);

  const categoryFilterOptions = useMemo(() => {
    const categories = Array.from(
      new Set(products.map((p) => p.cat).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { value: "all", label: "All categories" },
      ...categories.map((cat) => ({ value: cat, label: cat })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products
      .filter((p) => {
        const matchesSearch =
          !normalizedSearch ||
          [p.name, p.code, p.cat].some((value) =>
            String(value || "").toLowerCase().includes(normalizedSearch),
          );

        const matchesCategory =
          categoryFilter === "all" || p.cat === categoryFilter;

        const stock = Number(p.stock) || 0;
        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "available" && stock > 5) ||
          (stockFilter === "low" && stock > 0 && stock <= 5) ||
          (stockFilter === "out" && stock <= 0);

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [products, searchTerm, sortBy, categoryFilter, stockFilter]);

  const openAddModal = () => {
    form.setFieldsValue({
      code: "",
      name: "",
      cat: "Groundnut",
      unit: "tins",
      price: null,
      stock: 0,
    });
    setShowModal(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await erp.addProduct({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock) || 0,
      });
      message.success("Product added");
      setShowModal(false);
      form.resetFields();
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error.message || "Failed to add product");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteProd = async (id) => {
    try {
      setDeletingId(id);
      await erp.deleteProduct(id);
      message.success("Product deleted");
    } catch (error) {
      message.error(error.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockFilter("all");
    setSortBy("name-asc");
  };

  const productColumns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      width: 360,
      render: (_, product) => (
        <Space size={12} className="product-table-product">
          <div className="product-table-avatar">
            {getProductInitials(product.name)}
          </div>
          <div className="product-table-copy">
            <Text className="product-table-name">{product.name}</Text>
            <Text type="secondary" className="product-table-code">
              {product.code || "No code"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: "cat",
      key: "cat",
      align: "center",
      width: 180,
      render: (cat) => (
        <Tag icon={<TagsOutlined />} color="blue">
          {cat}
        </Tag>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      align: "center",
      width: 140,
      render: (unit) => <Tag>{unit || "tins"}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 180,
      render: (price) => (
        <Text className="product-table-price">
          Rs. {Number(price || 0).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      width: 160,
      render: (stock) => {
        const stockMeta = getStockMeta(Number(stock) || 0);
        return <Tag color={stockMeta.color}>{stockMeta.label}</Tag>;
      },
    },
    ...(isAdmin
      ? [
          {
            title: "",
            key: "actions",
            align: "center",
            width: 78,
            render: (_, product) => (
              <Popconfirm
                title="Delete product?"
                description="This product will be removed from the catalog."
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={() => deleteProd(product.id)}
              >
                <Tooltip title="Delete product">
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    loading={deletingId === product.id}
                  />
                </Tooltip>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <ConfigProvider theme={productsAntTheme}>
    <div className="products-page">
      <div className="page-header products-page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-description">
            Manage your product catalog and view current prices.
          </p>
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
            className="products-primary-btn"
          >
            Add Product
          </Button>
        )}
      </div>

      <Card className="products-toolbar-card">
        <Space className="products-toolbar" size={12} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search by name, code, category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="products-search"
          />
          <Select
            value={categoryFilter}
            options={categoryFilterOptions}
            onChange={setCategoryFilter}
            className="products-filter"
            suffixIcon={<FilterOutlined />}
          />
          <Select
            value={stockFilter}
            options={stockOptions}
            onChange={setStockFilter}
            className="products-filter"
          />
          <Select
            value={sortBy}
            options={sortOptions}
            onChange={setSortBy}
            className="products-sort"
          />
          <Button onClick={resetFilters}>Reset</Button>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: "grid", icon: <AppstoreOutlined /> },
              { value: "table", icon: <BarsOutlined /> },
            ]}
            className="products-view-switch"
          />
        </Space>
        <Text type="secondary" className="products-result-count">
          Showing {filteredProducts.length} of {products.length} products
        </Text>
      </Card>

      {filteredProducts.length > 0 && viewMode === "grid" ? (
        <Row gutter={[16, 16]} className="products-grid">
          {filteredProducts.map((p) => {
            const stockMeta = getStockMeta(p.stock);

            return (
              <Col key={p.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  className="product-card"
                  actions={
                    isAdmin
                      ? [
                          <Popconfirm
                            key="delete"
                            title="Delete product?"
                            description="This product will be removed from the catalog."
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => deleteProd(p.id)}
                          >
                            <Tooltip title="Delete product">
                              <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                loading={deletingId === p.id}
                              />
                            </Tooltip>
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <div className="product-card-top">
                    <div className="product-avatar">{getProductInitials(p.name)}</div>
                    <Tag color={stockMeta.color}>{stockMeta.label}</Tag>
                  </div>

                  <Space direction="vertical" size={8} className="product-card-body">
                    <div>
                      <Text type="secondary" className="product-code">
                        {p.code || "No code"}
                      </Text>
                      <Title level={5} className="product-title">
                        {p.name}
                      </Title>
                    </div>

                    <Space size={6} wrap>
                      <Tag icon={<TagsOutlined />} color="blue">
                        {p.cat}
                      </Tag>
                      <Tag>{p.unit || "tins"}</Tag>
                    </Space>

                    <div className="product-price-row">
                      <Text className="product-price">
                        Rs. {Number(p.price || 0).toFixed(2)}
                      </Text>
                      <Text delete type="secondary">
                        Rs. {(Number(p.price || 0) * 1.1).toFixed(2)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : null}

      {filteredProducts.length > 0 && viewMode === "table" ? (
        <Card className="products-table-card">
          <Table
            rowKey="id"
            columns={productColumns}
            dataSource={filteredProducts}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 1100 }}
            tableLayout="fixed"
          />
        </Card>
      ) : null}

      {filteredProducts.length === 0 ? (
        <Card className="products-empty-card">
          <Empty description="No products found" />
        </Card>
      ) : null}

      <Modal
        title="Add New Product"
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleAdd}
        okText="Save Product"
        cancelText="Close"
        confirmLoading={saving}
        destroyOnHidden
        centered
        className="products-modal"
        styles={{
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
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: "Enter product name" }]}
          >
            <Input placeholder="Enter product name" autoFocus />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Code" name="code">
                <Input placeholder="Enter product code" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Category"
                name="cat"
                rules={[{ required: true, message: "Select category" }]}
              >
                <Select
                  options={categoryOptions.map((cat) => ({
                    value: cat,
                    label: cat,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={8}>
              <Form.Item label="Unit" name="unit">
                <Input placeholder="tins" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: "Enter price" }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  prefix="Rs."
                  placeholder="0.00"
                  className="products-number-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Initial Stock" name="stock">
                <InputNumber
                  min={0}
                  precision={0}
                  placeholder="0"
                  className="products-number-input"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
    </ConfigProvider>
  );
}
