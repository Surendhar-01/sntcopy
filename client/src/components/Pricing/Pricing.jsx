import React, { useEffect, useMemo, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Col,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme as antdTheme,
} from "antd";
import "./Pricing.css";
import { useTheme } from "../../context/useTheme";

const { Text } = Typography;

const EMPTY_PRODUCTS = [];
const EMPTY_PRICE_HISTORY = [];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
const normalizeName = (value = "") => String(value).trim().toLowerCase();

const getProductInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "P";

export default function Pricing({ db, erp, user }) {
  const [form] = Form.useForm();
  const { effectiveTheme } = useTheme();
  const [priceModal, setPriceModal] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [deletingHistoryId, setDeletingHistoryId] = useState(null);

  const products = db.products || EMPTY_PRODUCTS;
  const priceHistory = db.priceHistory || EMPTY_PRICE_HISTORY;
  const isDarkTheme = effectiveTheme === "dark";

  const pricingAntTheme = useMemo(
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
    erp.fetchPriceHistory().catch(() => {});
  }, [erp]);

  const latestHistoryByProduct = useMemo(() => {
    const map = new Map();

    priceHistory.forEach((entry) => {
      if (!map.has(entry.product)) {
        map.set(entry.product, entry);
      }
    });

    return map;
  }, [priceHistory]);

  const productIdByName = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      map.set(normalizeName(product.name), product.id);
    });

    return map;
  }, [products]);

  const openPriceModal = (product) => {
    const currentPrice = Number(product.price || 0);
    const nextModal = {
      id: product.id,
      name: product.name,
      code: product.code || product.id,
      currentPrice,
    };

    setPriceModal(nextModal);
    form.setFieldsValue({
      name: product.name,
      currentPrice,
      newPrice: currentPrice,
    });
  };

  const closePriceModal = () => {
    setPriceModal(null);
    form.resetFields();
  };

  const handleSavePrice = async () => {
    if (!priceModal) return;

    try {
      const values = await form.validateFields();
      setIsSavingPrice(true);
      await erp.updateProductPrice(
        priceModal.id,
        Number(values.newPrice),
        user?.user || "Admin",
      );
      message.success("Price updated");
      closePriceModal();
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error.message || "Failed to update price");
      }
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleClearLog = async () => {
    if (!priceHistory.length || isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await erp.clearPriceHistory();
      message.success("Price history cleared");
      setShowClearConfirm(false);
    } catch (error) {
      message.error(error.message || "Failed to clear price history");
    } finally {
      setIsClearing(false);
    }
  };

  const deleteHistory = async (id) => {
    try {
      setDeletingHistoryId(id);
      await erp.deletePriceHistory(id);
      message.success("Price log deleted");
    } catch (error) {
      message.error(error.message || "Failed to delete log");
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const productColumns = [
    {
      title: "Product",
      key: "product",
      width: 360,
      render: (_, product) => (
        <Space size={12} className="pricing-product-cell">
          <div className="pricing-product-avatar">
            {getProductInitials(product.name)}
          </div>
          <div className="pricing-product-copy">
            <Text className="pricing-product-name">{product.name}</Text>
            <Text type="secondary" className="pricing-product-code">
              {product.code || product.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Previous",
      key: "previous",
      align: "right",
      width: 170,
      render: (_, product) => {
        const history = latestHistoryByProduct.get(product.name);
        const previous = history ? Number(history.old || 0) : Number(product.price || 0);
        return <Text type="secondary">{formatCurrency(previous)}</Text>;
      },
    },
    {
      title: "Current",
      dataIndex: "price",
      key: "current",
      align: "right",
      width: 170,
      render: (price) => (
        <Text className="pricing-money">{formatCurrency(price)}</Text>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      align: "right",
      width: 120,
      render: (stock) => <Tag>{Number(stock || 0)}</Tag>,
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 130,
      render: (_, product) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => openPriceModal(product)}
        >
          Update
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 160,
      render: (date) => new Date(date).toLocaleDateString("en-GB"),
    },
    {
      title: "Product ID",
      key: "productId",
      width: 130,
      render: (_, history) => (
        <Text>{history.product_id || history.productId || productIdByName.get(normalizeName(history.product)) || "-"}</Text>
      ),
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      width: 320,
      render: (product) => <Text className="pricing-product-name">{product}</Text>,
    },
    {
      title: "Old",
      dataIndex: "old",
      key: "old",
      align: "right",
      width: 130,
      render: (oldPrice) => <Text type="secondary">{formatCurrency(oldPrice)}</Text>,
    },
    {
      title: "New",
      dataIndex: "new",
      key: "new",
      align: "right",
      width: 130,
      render: (newPrice) => (
        <Text className="pricing-money">{formatCurrency(newPrice)}</Text>
      ),
    },
    {
      title: "By",
      dataIndex: "by",
      key: "by",
      width: 110,
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 90,
      render: (_, history) => (
        <Popconfirm
          title="Delete log?"
          description="This price change entry will be removed."
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteHistory(history.id)}
        >
          <Tooltip title="Delete log">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              loading={deletingHistoryId === history.id}
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
    <ConfigProvider theme={pricingAntTheme}>
      <div className="page-header">
        <h1 className="page-title">Pricing Control</h1>
        <p className="page-description">
          Manage product rates and track historical price variations.
        </p>
      </div>

      <div className="pricing-page">
        <Card
          className="pricing-table-card"
          title={
            <Space>
              <TagsOutlined />
              <span>Price Control</span>
            </Space>
          }
        >
          <Table
            rowKey="id"
            columns={productColumns}
            dataSource={products}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 950 }}
            tableLayout="fixed"
            locale={{
              emptyText: <Empty description="No products found" />,
            }}
          />
        </Card>

        <Card
          className="pricing-table-card"
          title={
            <Space>
              <HistoryOutlined />
              <span>Price Change Log</span>
            </Space>
          }
          extra={
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setShowClearConfirm(true)}
              disabled={!priceHistory.length || isClearing}
              loading={isClearing}
            >
              Clear
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={historyColumns}
            dataSource={priceHistory}
            pagination={{ pageSize: 6, showSizeChanger: false }}
            scroll={{ x: 1060 }}
            tableLayout="fixed"
            locale={{
              emptyText: <Empty description="No price changes recorded" />,
            }}
          />
        </Card>

        <Modal
          title="Update Price"
          open={Boolean(priceModal)}
          onCancel={closePriceModal}
          onOk={handleSavePrice}
          okText="Save Price"
          cancelText="Cancel"
          confirmLoading={isSavingPrice}
          centered
          destroyOnHidden
          className="pricing-modal"
          styles={modalStyles}
        >
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item label="Product Name" name="name">
              <Input readOnly />
            </Form.Item>

            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item label="Current Price" name="currentPrice">
                  <InputNumber
                    readOnly
                    precision={2}
                    prefix="Rs."
                    className="pricing-number-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="New Price"
                  name="newPrice"
                  rules={[{ required: true, message: "Enter new price" }]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    prefix="Rs."
                    className="pricing-number-input"
                    autoFocus
                    onPressEnter={handleSavePrice}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          title="Clear Price History"
          open={showClearConfirm}
          onCancel={() => setShowClearConfirm(false)}
          onOk={handleClearLog}
          okText="Clear All"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          confirmLoading={isClearing}
          centered
          className="pricing-modal"
          styles={modalStyles}
        >
          <Text type="secondary">
            Clear all price history records permanently?
          </Text>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
