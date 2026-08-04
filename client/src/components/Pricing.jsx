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
} from "antd";import { useTheme } from "../context/useTheme";
const pricingStyles = ".pricing-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  min-width: 0;\n  width: 100%;\n}\n\n.pricing-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.pricing-page .ant-card-body,\n.pricing-page .ant-card-head,\n.pricing-page .ant-typography {\n  color: var(--text) !important;\n}\n\n.pricing-page .ant-card-head {\n  min-height: 56px;\n  border-bottom-color: var(--border);\n}\n\n.pricing-page .ant-card-head-title {\n  color: var(--text);\n  font-weight: 800;\n}\n\n.pricing-table-card {\n  overflow: hidden;\n}\n\n.pricing-table-card .ant-card-body {\n  padding: 0;\n}\n\n.pricing-table-card .ant-table {\n  background: transparent;\n  color: var(--text);\n  table-layout: fixed;\n}\n\n.pricing-table-card .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 800;\n  padding: 16px 20px;\n  vertical-align: middle;\n}\n\n.pricing-table-card .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.pricing-table-card .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 74px;\n  padding: 14px 20px;\n  vertical-align: middle;\n}\n\n.pricing-table-card .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.pricing-product-cell {\n  max-width: 100%;\n}\n\n.pricing-product-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 38px;\n  height: 38px;\n  flex: 0 0 38px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(249, 115, 22, 0.14));\n  border: 1px solid var(--border);\n  color: var(--text);\n  font-size: 0.78rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n\n.pricing-product-copy {\n  min-width: 0;\n}\n\n.pricing-product-name {\n  display: block;\n  color: var(--text) !important;\n  font-weight: 800;\n  line-height: 1.35;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.pricing-product-code {\n  display: block;\n  margin-top: 3px;\n  color: var(--text2) !important;\n  font-size: 0.76rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.pricing-money {\n  color: var(--text) !important;\n  display: block;\n  font-weight: 800;\n  white-space: nowrap;\n}\n\n.pricing-table-card .ant-tag {\n  margin-inline-end: 0;\n}\n\n.pricing-number-input {\n  width: 100%;\n}\n\n.pricing-modal .ant-modal-content {\n  padding: 0 !important;\n  overflow: hidden;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n\n.pricing-modal .ant-modal-header {\n  margin: 0;\n  padding: 20px 24px 12px;\n  border-bottom: 1px solid var(--border);\n}\n\n.pricing-modal .ant-modal-body {\n  padding: 20px 24px 4px;\n}\n\n.pricing-modal .ant-modal-footer {\n  margin: 0;\n  padding: 16px 24px 20px;\n  border-top: 1px solid var(--border);\n}\n\n.pricing-modal .ant-modal-title,\n.pricing-modal .ant-form-item-label > label {\n  color: var(--text) !important;\n}\n\n.pricing-modal .ant-form-item {\n  margin-bottom: 18px;\n}\n\n:root[data-theme='dark'] .pricing-page .ant-card {\n  background: #1b2433;\n  border-color: #334155;\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .pricing-page,\n:root[data-theme='dark'] .pricing-page .ant-card-body,\n:root[data-theme='dark'] .pricing-page .ant-card-head,\n:root[data-theme='dark'] .pricing-page .ant-card-head-title,\n:root[data-theme='dark'] .pricing-page .ant-typography,\n:root[data-theme='dark'] .pricing-page .pricing-product-name,\n:root[data-theme='dark'] .pricing-page .pricing-money {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .pricing-page .pricing-product-code {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-table,\n:root[data-theme='dark'] .pricing-table-card .ant-table-container,\n:root[data-theme='dark'] .pricing-table-card .ant-table-content,\n:root[data-theme='dark'] .pricing-table-card .ant-table-cell-scrollbar {\n  background: #1b2433 !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-table-tbody > tr > td {\n  background: #1b2433 !important;\n  border-bottom-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-table-tbody > tr.ant-table-row:hover > td,\n:root[data-theme='dark'] .pricing-table-card .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-item,\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-next button {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-item a,\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-next button {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-item-active {\n  border-color: var(--accent) !important;\n}\n\n:root[data-theme='dark'] .pricing-table-card .ant-pagination-item-active a {\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .pricing-page .ant-tag {\n  background: #111827;\n  border-color: #334155;\n  color: #e5e7eb;\n}\n\nhtml[data-theme='dark'] body .pricing-modal,\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-content {\n  background: transparent !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-content,\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-header,\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-body,\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-footer {\n  background-color: #1b2433 !important;\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-title,\nhtml[data-theme='dark'] body .pricing-modal .ant-form-item-label > label,\nhtml[data-theme='dark'] body .pricing-modal .ant-typography {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-close,\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-close-x {\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-modal-close:hover {\n  background: #263244 !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-input,\nhtml[data-theme='dark'] body .pricing-modal .ant-input-number,\nhtml[data-theme='dark'] body .pricing-modal .ant-input-number-input {\n  background-color: #111827 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-input,\nhtml[data-theme='dark'] body .pricing-modal .ant-input-number {\n  border-color: #334155 !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-input:hover,\nhtml[data-theme='dark'] body .pricing-modal .ant-input-number:hover {\n  border-color: #475569 !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-input:focus,\nhtml[data-theme='dark'] body .pricing-modal .ant-input-number-focused {\n  border-color: var(--accent) !important;\n  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.16) !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-input-number-prefix {\n  color: #cbd5e1 !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-btn-default {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .pricing-modal .ant-btn-default:hover,\nhtml[data-theme='dark'] body .pricing-modal .ant-btn-default:focus {\n  background: #263244 !important;\n  border-color: #475569 !important;\n  color: #ffffff !important;\n}\n\nhtml[data-theme='dark'] body .ant-popover .ant-popconfirm,\nhtml[data-theme='dark'] body .ant-popover .ant-popover-inner {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n}\n\nhtml[data-theme='dark'] body .ant-popover .ant-popover-title,\nhtml[data-theme='dark'] body .ant-popover .ant-popconfirm-description {\n  color: #e5e7eb !important;\n}\n\n@media (max-width: 768px) {\n  .pricing-table-card .ant-table-thead > tr > th,\n  .pricing-table-card .ant-table-tbody > tr > td {\n    padding: 12px 14px;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-pricing-styles")) {
  const style = document.createElement("style");
  style.id = "combined-pricing-styles";
  style.textContent = pricingStyles;
  document.head.appendChild(style);
}

const pricingMobileCompactStyles = `
@media (max-width: 768px) {
  .pricing-table-card .ant-table-measure-row,
  .pricing-table-card .ant-table-measure-row td {
    height: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    visibility: collapse !important;
  }

  .pricing-table-card .ant-table-tbody > tr {
    height: 56px !important;
  }

  .pricing-table-card .ant-table-thead > tr > th,
  .pricing-table-card .ant-table-tbody > tr > td {
    height: 56px !important;
    min-height: 0 !important;
    padding: 6px 10px !important;
    line-height: 1.3 !important;
    vertical-align: middle !important;
  }

  .pricing-table-card .ant-table-thead > tr > th {
    height: 40px !important;
    padding-block: 8px !important;
  }

  .pricing-product-cell {
    gap: 10px !important;
  }

  .pricing-product-avatar {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    min-width: 34px;
    font-size: 0.72rem;
  }

  .pricing-product-code {
    margin-top: 2px;
  }

  .pricing-table-card .ant-card-head {
    min-height: 48px;
    padding-inline: 14px;
  }

  .pricing-table-card .ant-card-head-title,
  .pricing-table-card .ant-card-extra {
    padding-block: 8px;
  }

  .pricing-table-card .ant-card-head-wrapper {
    align-items: center;
  }

  .pricing-table-card .ant-card-extra .ant-btn {
    height: 34px;
    min-height: 34px;
    padding-inline: 12px;
    font-size: 0.86rem;
  }

  .pricing-table-card .ant-pagination {
    margin: 10px 12px 12px !important;
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("pricing-mobile-compact-styles")) {
  const style = document.createElement("style");
  style.id = "pricing-mobile-compact-styles";
  style.textContent = pricingMobileCompactStyles;
  document.head.appendChild(style);
}

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
            size="small"
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
            size="small"
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
