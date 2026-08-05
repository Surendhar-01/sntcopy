import React, { useEffect, useMemo, useState } from "react";
import {
  ClearOutlined,
  DeleteOutlined,
  HistoryOutlined,
  InboxOutlined,
  PlusCircleOutlined,
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
} from "antd";import { useTheme } from "../context/useTheme";
const stockStyles = ".stock-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n  width: 100%;\n}\n\n.stock-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.stock-page .ant-card-body,\n.stock-page .ant-card-head,\n.stock-page .ant-typography {\n  color: var(--text) !important;\n}\n\n.stock-page .ant-card-head {\n  min-height: 56px;\n  border-bottom-color: var(--border);\n}\n\n.stock-page .ant-card-head-title {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.stock-table-card {\n  overflow: hidden;\n}\n\n.stock-table-card .ant-card-body {\n  padding: 0;\n}\n\n.stock-table-card .ant-table {\n  background: transparent;\n  color: var(--text);\n  table-layout: fixed;\n}\n\n.stock-table-card .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 800;\n  padding: 16px 20px;\n  vertical-align: middle;\n}\n\n.stock-table-card .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.stock-table-card .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 74px;\n  padding: 14px 20px;\n  vertical-align: middle;\n}\n\n.stock-table-card .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.stock-product-cell {\n  max-width: 100%;\n}\n\n.stock-product-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 38px;\n  height: 38px;\n  flex: 0 0 38px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(249, 115, 22, 0.14));\n  border: 1px solid var(--border);\n  color: var(--text);\n  font-size: 0.78rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n\n.stock-product-copy {\n  min-width: 0;\n}\n\n.stock-product-name {\n  display: block;\n  color: var(--text) !important;\n  font-weight: 800;\n  line-height: 1.35;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.stock-product-code {\n  display: block;\n  margin-top: 3px;\n  color: var(--text2) !important;\n  font-size: 0.76rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.stock-current-value,\n.stock-money {\n  color: var(--text) !important;\n  font-weight: 800;\n  white-space: nowrap;\n}\n\n.stock-refill-qty {\n  color: var(--green) !important;\n  font-weight: 800;\n}\n\n.stock-table-card .ant-tag {\n  margin-inline-end: 0;\n}\n\n.stock-number-input {\n  width: 100%;\n}\n\n.stock-modal .ant-modal-content {\n  padding: 0 !important;\n  overflow: hidden;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n\n.stock-modal .ant-modal-header {\n  margin: 0;\n  padding: 20px 24px 12px;\n  border-bottom: 1px solid var(--border);\n}\n\n.stock-modal .ant-modal-body {\n  padding: 20px 24px 4px;\n}\n\n.stock-modal .ant-modal-footer {\n  margin: 0;\n  padding: 16px 24px 20px;\n  border-top: 1px solid var(--border);\n}\n\n.stock-modal .ant-modal-title,\n.stock-modal .ant-form-item-label > label {\n  color: var(--text) !important;\n}\n\n.stock-modal-description {\n  display: block;\n  margin-bottom: 16px;\n}\n\n.stock-modal .ant-form-item {\n  margin-bottom: 18px;\n}\n\n:root[data-theme='dark'] .stock-page .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .stock-page,\n:root[data-theme='dark'] .stock-page .ant-card-body,\n:root[data-theme='dark'] .stock-page .ant-card-head,\n:root[data-theme='dark'] .stock-page .ant-card-head-title,\n:root[data-theme='dark'] .stock-page .ant-typography,\n:root[data-theme='dark'] .stock-page .stock-product-name,\n:root[data-theme='dark'] .stock-page .stock-current-value,\n:root[data-theme='dark'] .stock-page .stock-money {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .stock-page .stock-product-code {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-table,\n:root[data-theme='dark'] .stock-table-card .ant-table-container,\n:root[data-theme='dark'] .stock-table-card .ant-table-content,\n:root[data-theme='dark'] .stock-table-card .ant-table-cell-scrollbar {\n  background: #1b2433 !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-table-tbody > tr > td {\n  background: #1b2433 !important;\n  border-bottom-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-table-tbody > tr.ant-table-row:hover > td,\n:root[data-theme='dark'] .stock-table-card .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-pagination-item,\n:root[data-theme='dark'] .stock-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .stock-table-card .ant-pagination-next button {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-pagination-item a,\n:root[data-theme='dark'] .stock-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .stock-table-card .ant-pagination-next button {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-pagination-item-active {\n  border-color: var(--accent) !important;\n}\n\n:root[data-theme='dark'] .stock-table-card .ant-pagination-item-active a {\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .stock-page .ant-tag {\n  background: #111827;\n  border-color: #334155;\n  color: #e5e7eb;\n}\n\n:root[data-theme='dark'] .stock-page .ant-tag-green {\n  background: rgba(34, 197, 94, 0.14);\n  border-color: rgba(74, 222, 128, 0.34);\n  color: #bbf7d0;\n}\n\n:root[data-theme='dark'] .stock-page .ant-tag-orange {\n  background: rgba(249, 115, 22, 0.16);\n  border-color: rgba(251, 146, 60, 0.38);\n  color: #fed7aa;\n}\n\n:root[data-theme='dark'] .stock-page .ant-tag-red {\n  background: rgba(248, 113, 113, 0.14);\n  border-color: rgba(248, 113, 113, 0.36);\n  color: #fecaca;\n}\n\nhtml[data-theme='dark'] body .stock-modal,\nhtml[data-theme='dark'] body .stock-modal .ant-modal-content {\n  background: transparent !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-modal-content,\nhtml[data-theme='dark'] body .stock-modal .ant-modal-header,\nhtml[data-theme='dark'] body .stock-modal .ant-modal-body,\nhtml[data-theme='dark'] body .stock-modal .ant-modal-footer {\n  background-color: #1b2433 !important;\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-modal-title,\nhtml[data-theme='dark'] body .stock-modal .ant-form-item-label > label,\nhtml[data-theme='dark'] body .stock-modal .ant-typography {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-modal-close,\nhtml[data-theme='dark'] body .stock-modal .ant-modal-close-x {\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-modal-close:hover {\n  background: #263244 !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-input-number,\nhtml[data-theme='dark'] body .stock-modal .ant-input-number-input {\n  background-color: #111827 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-input-number {\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-input-number:hover {\n  border-color: #475569 !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-input-number-focused {\n  border-color: var(--accent) !important;\n  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.16) !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-input-number-input::placeholder {\n  color: #94a3b8 !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-btn-default {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .stock-modal .ant-btn-default:hover,\nhtml[data-theme='dark'] body .stock-modal .ant-btn-default:focus {\n  background: #263244 !important;\n  border-color: #475569 !important;\n  color: #ffffff !important;\n}\n\n@media (max-width: 768px) {\n  .stock-table-card .ant-table-thead > tr > th,\n  .stock-table-card .ant-table-tbody > tr > td {\n    padding: 12px 14px;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-stock-styles")) {
  const style = document.createElement("style");
  style.id = "combined-stock-styles";
  style.textContent = stockStyles;
  document.head.appendChild(style);
}

const stockMobileCompactStyles = `
@media (max-width: 768px) {
  .stock-table-card .ant-table-measure-row,
  .stock-table-card .ant-table-measure-row td {
    height: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    visibility: collapse !important;
  }

  .stock-table-card .ant-table-tbody > tr {
    height: 38px !important;
  }

  .stock-table-card .ant-table-thead > tr > th,
  .stock-table-card .ant-table-tbody > tr > td {
    height: 38px !important;
    min-height: 0 !important;
    padding: 0 10px !important;
    line-height: 1.25 !important;
    vertical-align: middle !important;
  }

  .stock-table-card .ant-card-head {
    min-height: 48px;
    padding-inline: 14px;
  }

  .stock-table-card .ant-card-head-title,
  .stock-table-card .ant-card-extra {
    padding-block: 8px;
  }

  .stock-table-card .ant-card-head-wrapper {
    align-items: center;
  }

  .stock-table-card .ant-card-extra .ant-btn {
    height: 34px;
    min-height: 34px;
    padding-inline: 12px;
    font-size: 0.86rem;
  }

  .stock-table-card .ant-pagination {
    margin: 10px 12px 12px !important;
  }

  .stock-management-card .ant-table-tbody > tr {
    height: 56px !important;
  }

  .stock-management-card .ant-table-tbody > tr > td {
    height: 56px !important;
    padding: 6px 10px !important;
    line-height: 1.3 !important;
  }

  .stock-management-card .ant-table-thead > tr > th {
    height: 40px !important;
    padding-block: 8px !important;
  }

  .stock-management-card .stock-product-cell {
    gap: 10px !important;
  }

  .stock-management-card .stock-product-avatar {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    min-width: 34px;
    font-size: 0.72rem;
  }

  .stock-management-card .stock-product-code {
    margin-top: 2px;
  }

  .stock-refill-card .ant-table-tbody > tr {
    height: 56px !important;
  }

  .stock-refill-card .ant-table-tbody > tr > td {
    height: 56px !important;
    padding: 6px 10px !important;
    line-height: 1.3 !important;
  }

  .stock-refill-card .ant-table-thead > tr > th {
    height: 40px !important;
    padding-block: 8px !important;
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("stock-mobile-compact-styles")) {
  const style = document.createElement("style");
  style.id = "stock-mobile-compact-styles";
  style.textContent = stockMobileCompactStyles;
  document.head.appendChild(style);
}

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
          icon={<PlusCircleOutlined />}
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
          okText="Yes"
          cancelText="No"
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
          className="stock-table-card stock-management-card"
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
          className="stock-table-card stock-refill-card"
          title={
            <Space>
              <HistoryOutlined />
              <span>Refill History</span>
            </Space>
          }
          extra={
            <Popconfirm
              title="Clear refill history?"
              description="Clear all refill history records permanently?"
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
              onConfirm={handleClearRefills}
              disabled={!refills.length || isClearing}
            >
              <Button
                danger
                icon={<ClearOutlined />}
                disabled={!refills.length || isClearing}
                loading={isClearing}
              >
                Clear
              </Button>
            </Popconfirm>
          }
        >
          <Table
            rowKey="id"
            columns={refillColumns}
            dataSource={refills}
            size="small"
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
