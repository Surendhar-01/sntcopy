import React, { useEffect, useMemo, useState } from "react";
import {
  DeleteOutlined,
  HistoryOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Form,
  InputNumber,
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
import "./Stock.css";
import { useTheme } from "../../context/useTheme";

const { Text, Title } = Typography;

const EMPTY_PRODUCTS = [];
const EMPTY_REFILLS = [];

const getOpeningStock = (product) => Number(product.opening_stock || 0);
const getSold = (product) => Number(product.sold || 0);
const getStock = (product) => Number(product.stock || 0);
const getPrice = (product) => Number(product.price || 0);

const getStockStatus = (stock) => {
  if (stock <= 0) {
    return { color: "red", label: "Out of stock" };
  }

  if (stock <= 5) {
    return { color: "orange", label: "Refill due" };
  }

  return { color: "green", label: "Healthy" };
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
const normalizeName = (value = "") => String(value).trim().toLowerCase();

export default function Stock({ db, erp, user }) {
  const [form] = Form.useForm();
  const { effectiveTheme } = useTheme();
  const [refillProduct, setRefillProduct] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSavingRefill, setIsSavingRefill] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [deletingRefillId, setDeletingRefillId] = useState(null);

  const products = db.products || EMPTY_PRODUCTS;
  const refills = db.refills || EMPTY_REFILLS;
  const isDarkTheme = effectiveTheme === "dark";

  const stockAntTheme = useMemo(
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
    erp.fetchRefills().catch(() => {});
  }, [erp]);

  const productIdByName = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      map.set(normalizeName(product.name), product.id);
    });

    return map;
  }, [products]);

  const openRefillModal = (product) => {
    setRefillProduct(product);
    form.setFieldsValue({ qty: null });
  };

  const closeRefillModal = () => {
    setRefillProduct(null);
    form.resetFields();
  };

  const submitRefill = async () => {
    if (!refillProduct) return;

    try {
      const values = await form.validateFields();
      setIsSavingRefill(true);
      await erp.addRefill({
        product_id: refillProduct.id,
        product: refillProduct.name,
        qty: Number(values.qty),
        by: user ? user.user : "Admin",
      });

      message.success("Refill saved");
      closeRefillModal();
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error.message || "Failed to save refill");
      }
    } finally {
      setIsSavingRefill(false);
    }
  };

  const handleClearRefills = async () => {
    if (!refills.length || isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await erp.clearRefills();
      message.success("Refill history cleared");
      setShowClearConfirm(false);
    } catch (error) {
      message.error(error.message || "Failed to clear refill history");
    } finally {
      setIsClearing(false);
    }
  };

  const deleteRefill = async (id) => {
    try {
      setDeletingRefillId(id);
      await erp.deleteRefill(id);
      message.success("Refill deleted");
    } catch (error) {
      message.error(error.message || "Failed to delete refill");
    } finally {
      setDeletingRefillId(null);
    }
  };

  const inventoryColumns = [
    {
      title: "Product",
      key: "product",
      width: 340,
      render: (_, product) => (
        <Space size={12} className="stock-product-cell">
          <div className="stock-product-avatar">
            {String(product.name || "P").slice(0, 2).toUpperCase()}
          </div>
          <div className="stock-product-copy">
            <Text className="stock-product-name">{product.name}</Text>
            <Text type="secondary" className="stock-product-code">
              {product.code || product.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Opening",
      key: "opening",
      align: "right",
      width: 130,
      render: (_, product) => getOpeningStock(product),
    },
    {
      title: "Sold",
      key: "sold",
      align: "right",
      width: 110,
      render: (_, product) => <Text type="danger">{getSold(product)}</Text>,
    },
    {
      title: "Current",
      dataIndex: "stock",
      key: "stock",
      align: "right",
      width: 120,
      render: (stock) => <Text className="stock-current-value">{getStock({ stock })}</Text>,
    },
    {
      title: "Stock Value",
      key: "value",
      align: "right",
      width: 170,
      render: (_, product) => (
        <Text className="stock-money">
          {formatCurrency(getPrice(product) * getStock(product))}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      width: 150,
      render: (_, product) => {
        const status = getStockStatus(getStock(product));
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 120,
      render: (_, product) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openRefillModal(product)}
        >
          Refill
        </Button>
      ),
    },
  ];

  const refillColumns = [
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
      render: (_, refill) => (
        <Text>{refill.product_id || productIdByName.get(normalizeName(refill.product)) || "-"}</Text>
      ),
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      width: 340,
      render: (product) => <Text className="stock-product-name">{product}</Text>,
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      align: "right",
      width: 110,
      render: (qty) => <Text className="stock-refill-qty">+{qty}</Text>,
    },
    {
      title: "By",
      dataIndex: "by",
      key: "by",
      width: 130,
    },
    {
      title: "",
      key: "action",
      align: "center",
      width: 90,
      render: (_, refill) => (
        <Popconfirm
          title="Delete refill?"
          description="This refill entry will be removed."
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteRefill(refill.id)}
        >
          <Tooltip title="Delete refill">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              loading={deletingRefillId === refill.id}
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
    <ConfigProvider theme={stockAntTheme}>
      <div className="page-header">
        <h1 className="page-title">Stock & Inventory</h1>
        <p className="page-description">
          Monitor product availability, sold units, and manage refills.
        </p>
      </div>

      <div className="stock-page">
        <Card
          className="stock-table-card"
          title={
            <Space>
              <InboxOutlined />
              <span>Stock Management</span>
            </Space>
          }
        >
          <Table
            rowKey="id"
            columns={inventoryColumns}
            dataSource={products}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 1140 }}
            tableLayout="fixed"
            locale={{
              emptyText: <Empty description="No products found" />,
            }}
          />
        </Card>

        <Card
          className="stock-table-card"
          title={
            <Space>
              <HistoryOutlined />
              <span>Refill History</span>
            </Space>
          }
          extra={
            <Button
              danger
              icon={<ReloadOutlined />}
              onClick={() => setShowClearConfirm(true)}
              disabled={!refills.length || isClearing}
              loading={isClearing}
            >
              Clear
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={refillColumns}
            dataSource={refills}
            pagination={{ pageSize: 6, showSizeChanger: false }}
            scroll={{ x: 960 }}
            tableLayout="fixed"
            locale={{
              emptyText: <Empty description="No refill history" />,
            }}
          />
        </Card>

        <Modal
          title="Refill Stock"
          open={Boolean(refillProduct)}
          onCancel={closeRefillModal}
          onOk={submitRefill}
          okText="Save Refill"
          cancelText="Cancel"
          confirmLoading={isSavingRefill}
          centered
          destroyOnHidden
          className="stock-modal"
          styles={modalStyles}
        >
          <Text type="secondary" className="stock-modal-description">
            Add new stock inventory for{" "}
            <Text strong>{refillProduct?.name}</Text>
          </Text>
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              label="Refill Quantity"
              name="qty"
              rules={[{ required: true, message: "Enter refill quantity" }]}
            >
              <InputNumber
                min={1}
                precision={0}
                placeholder="Enter quantity"
                className="stock-number-input"
                autoFocus
                onPressEnter={submitRefill}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Clear Refill History"
          open={showClearConfirm}
          onCancel={() => setShowClearConfirm(false)}
          onOk={handleClearRefills}
          okText="Clear All"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          confirmLoading={isClearing}
          centered
          className="stock-modal"
          styles={modalStyles}
        >
          <Text type="secondary">
            Clear all refill history records permanently?
          </Text>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
