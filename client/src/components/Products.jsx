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
} from "antd";import { hasAdminAccess } from "../utils/roles";
import { useTheme } from "../context/useTheme";
const productsStyles = ".products-page {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n}\n\n.products-page-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 16px;\n  margin-bottom: 4px;\n}\n\n.products-primary-btn {\n  min-height: 40px;\n  font-weight: 700;\n}\n\n.products-page .ant-card {\n  background: var(--card);\n  border-color: var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px var(--shadow-soft);\n}\n\n.products-page .ant-card-body {\n  color: var(--text);\n}\n\n.products-page .ant-typography,\n.products-page .ant-card-meta-description {\n  color: var(--text2) !important;\n}\n\n.products-page .ant-card-meta-title {\n  color: var(--text) !important;\n}\n\n.products-toolbar-card .ant-card-body {\n  padding: 16px;\n}\n\n.products-toolbar {\n  width: 100%;\n  align-items: center;\n  column-gap: 12px;\n  row-gap: 12px;\n}\n\n.products-search {\n  width: 300px;\n}\n\n.products-filter {\n  width: 176px;\n}\n\n.products-sort {\n  width: 180px;\n}\n\n.products-view-switch {\n  margin-left: auto;\n}\n\n.products-toolbar .ant-btn {\n  min-width: 72px;\n}\n\n.products-result-count {\n  display: block;\n  margin-top: 12px;\n  font-size: 0.82rem;\n}\n\n.product-card {\n  height: 100%;\n  overflow: hidden;\n}\n\n.product-card .ant-card-body {\n  min-height: 226px;\n  padding: 18px 16px;\n}\n\n.product-card .ant-card-actions {\n  background: var(--surface);\n  border-top-color: var(--border);\n}\n\n.product-card .ant-card-actions > li {\n  margin: 8px 0;\n}\n\n.product-card-top {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 10px;\n  margin-bottom: 18px;\n}\n\n.product-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 58px;\n  height: 58px;\n  flex: 0 0 58px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(249, 115, 22, 0.14));\n  border: 1px solid var(--border);\n  color: var(--text);\n  font-size: 1.05rem;\n  font-weight: 800;\n  letter-spacing: 0;\n}\n\n.product-card-body {\n  width: 100%;\n}\n\n.product-code {\n  display: block;\n  margin-bottom: 8px;\n  font-size: 0.78rem;\n  text-transform: uppercase;\n}\n\n.product-title {\n  margin: 0 !important;\n  color: var(--text) !important;\n  line-height: 1.35 !important;\n  min-height: 44px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n.product-price-row {\n  display: flex;\n  align-items: baseline;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding-top: 8px;\n}\n\n.product-price {\n  color: var(--text) !important;\n  font-size: 1.2rem;\n  font-weight: 800;\n}\n\n.products-empty-card .ant-card-body {\n  padding: 42px 16px;\n}\n\n.products-table-card .ant-card-body {\n  padding: 0;\n}\n\n.products-table-card .ant-table {\n  background: transparent;\n  color: var(--text);\n  table-layout: fixed;\n}\n\n.products-table-card {\n  overflow: hidden;\n}\n\n.products-table-card .ant-table-thead > tr > th {\n  background: var(--surface) !important;\n  color: var(--text2) !important;\n  border-bottom-color: var(--border);\n  font-weight: 700;\n  padding: 16px 20px;\n  vertical-align: middle;\n}\n\n.products-table-card .ant-table-thead > tr > th::before {\n  display: none !important;\n}\n\n.products-table-card .ant-table-tbody > tr > td {\n  background: var(--card);\n  border-bottom-color: var(--border);\n  color: var(--text);\n  height: 74px;\n  padding: 14px 20px;\n  vertical-align: middle;\n}\n\n.products-table-card .ant-table-tbody > tr:hover > td {\n  background: var(--surface-hover) !important;\n}\n\n.product-table-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 38px;\n  height: 38px;\n  flex: 0 0 38px;\n  border-radius: 8px;\n  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(249, 115, 22, 0.14));\n  border: 1px solid var(--border);\n  color: var(--text);\n  font-size: 0.78rem;\n  font-weight: 800;\n}\n\n.product-table-product {\n  max-width: 100%;\n}\n\n.product-table-copy {\n  min-width: 0;\n}\n\n.product-table-name {\n  display: block;\n  color: var(--text) !important;\n  font-weight: 700;\n  line-height: 1.35;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.product-table-code {\n  display: block;\n  margin-top: 3px;\n  font-size: 0.76rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.product-table-price {\n  color: var(--text) !important;\n  font-weight: 800;\n  display: block;\n  white-space: nowrap;\n}\n\n.products-table-card .ant-tag {\n  margin-inline-end: 0;\n}\n\n.products-number-input {\n  width: 100%;\n}\n\n.products-modal .ant-modal-content,\n.products-modal .ant-modal-header {\n  background: var(--card);\n  color: var(--text);\n}\n\n.products-modal .ant-modal-content {\n  padding: 0 !important;\n  overflow: hidden;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n\n.products-modal .ant-modal-header {\n  margin: 0;\n  padding: 20px 24px 12px;\n  border-bottom: 1px solid var(--border);\n}\n\n.products-modal .ant-modal-body {\n  padding: 20px 24px 4px;\n  background: var(--card);\n}\n\n.products-modal .ant-modal-footer {\n  margin: 0;\n  padding: 16px 24px 20px;\n  background: var(--card);\n  border-top: 1px solid var(--border);\n}\n\n.products-modal .ant-modal-close {\n  top: 16px;\n  inset-inline-end: 18px;\n}\n\n.products-modal .ant-modal-title,\n.products-modal .ant-form-item-label > label {\n  color: var(--text) !important;\n}\n\n.products-modal .ant-form-item {\n  margin-bottom: 18px;\n}\n\n.products-modal .ant-form-item-label {\n  padding-bottom: 6px;\n}\n\n.products-modal .ant-input,\n.products-modal .ant-input-number,\n.products-page .ant-input,\n.products-page .ant-input-affix-wrapper,\n.products-page .ant-select-selector,\n.products-page .ant-segmented {\n  background: var(--input-bg) !important;\n  border-color: var(--input-border) !important;\n  color: var(--text) !important;\n}\n\n.products-modal .ant-select-selector {\n  background: var(--input-bg) !important;\n  border-color: var(--input-border) !important;\n  color: var(--text) !important;\n}\n\n.products-modal .ant-select-selection-item,\n.products-modal .ant-select-arrow {\n  color: var(--text) !important;\n}\n\n.products-page .ant-input-affix-wrapper input {\n  background: transparent !important;\n  color: var(--text) !important;\n}\n\n.products-modal .ant-input-number-input,\n.products-page .ant-input::placeholder,\n.products-page .ant-input-affix-wrapper input::placeholder {\n  color: var(--text) !important;\n}\n\n.products-page .ant-input::placeholder {\n  opacity: 0.55;\n}\n\n:root[data-theme='dark'] .products-page .ant-card,\n:root[data-theme='dark'] .products-modal .ant-modal-content,\n:root[data-theme='dark'] .products-modal .ant-modal-header {\n  background: var(--surface);\n}\n\n:root[data-theme='dark'] .products-modal .ant-modal-content {\n  background: #1b2433 !important;\n  border-color: #334155;\n}\n\nhtml[data-theme='dark'] body .products-modal,\nhtml[data-theme='dark'] body .products-modal .ant-modal-content {\n  background: transparent !important;\n}\n\nhtml[data-theme='dark'] body .products-modal .ant-modal-content {\n  background-color: #1b2433 !important;\n  padding: 0 !important;\n  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45) !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-modal-header,\n:root[data-theme='dark'] .products-modal .ant-modal-body,\n:root[data-theme='dark'] .products-modal .ant-modal-footer {\n  background: #1b2433 !important;\n  border-color: #334155;\n}\n\n:root[data-theme='dark'] .products-modal .ant-modal-title,\n:root[data-theme='dark'] .products-modal .ant-form-item-label > label {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-modal-close,\n:root[data-theme='dark'] .products-modal .ant-modal-close-x {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-modal-close:hover {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-input,\n:root[data-theme='dark'] .products-modal .ant-input-number,\n:root[data-theme='dark'] .products-modal .ant-select-selector {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-input:hover,\n:root[data-theme='dark'] .products-modal .ant-input-number:hover,\n:root[data-theme='dark'] .products-modal .ant-select-selector:hover {\n  border-color: #475569 !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-input:focus,\n:root[data-theme='dark'] .products-modal .ant-input-number-focused,\n:root[data-theme='dark'] .products-modal .ant-select-focused .ant-select-selector {\n  border-color: var(--accent) !important;\n  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.16) !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-input::placeholder,\n:root[data-theme='dark'] .products-modal .ant-input-number-input::placeholder {\n  color: #94a3b8 !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-input-number-input,\n:root[data-theme='dark'] .products-modal .ant-input-number-prefix,\n:root[data-theme='dark'] .products-modal .ant-select-selection-item,\n:root[data-theme='dark'] .products-modal .ant-select-arrow {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-btn-default {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .products-modal .ant-btn-default:hover,\n:root[data-theme='dark'] .products-modal .ant-btn-default:focus {\n  background: #263244 !important;\n  border-color: #475569 !important;\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-card {\n  box-shadow: none;\n}\n\n:root[data-theme='dark'] .products-page,\n:root[data-theme='dark'] .products-page .ant-card-body,\n:root[data-theme='dark'] .products-page .ant-typography,\n:root[data-theme='dark'] .products-page .product-title,\n:root[data-theme='dark'] .products-page .product-price,\n:root[data-theme='dark'] .products-page .product-table-name,\n:root[data-theme='dark'] .products-page .product-table-price {\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .products-page .product-code,\n:root[data-theme='dark'] .products-page .product-table-code,\n:root[data-theme='dark'] .products-page .products-result-count {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-input,\n:root[data-theme='dark'] .products-page .ant-input-affix-wrapper,\n:root[data-theme='dark'] .products-page .ant-select-selector,\n:root[data-theme='dark'] .products-page .ant-btn-default,\n:root[data-theme='dark'] .products-page .ant-segmented {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .products-page .ant-select,\nhtml[data-theme='dark'] body .products-modal .ant-select {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .products-page .ant-select .ant-select-selector,\nhtml[data-theme='dark'] body .products-page .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector,\nhtml[data-theme='dark'] body .products-modal .ant-select .ant-select-selector,\nhtml[data-theme='dark'] body .products-modal .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector {\n  background-color: #111827 !important;\n  border-color: #334155 !important;\n  color: #f8fafc !important;\n  box-shadow: none !important;\n}\n\nhtml[data-theme='dark'] body .products-page .ant-select .ant-select-selection-item,\nhtml[data-theme='dark'] body .products-page .ant-select .ant-select-arrow,\nhtml[data-theme='dark'] body .products-modal .ant-select .ant-select-selection-item,\nhtml[data-theme='dark'] body .products-modal .ant-select .ant-select-arrow {\n  color: #f8fafc !important;\n}\n\nhtml[data-theme='dark'] body .products-modal .ant-input,\nhtml[data-theme='dark'] body .products-modal .ant-input-number,\nhtml[data-theme='dark'] body .products-modal .ant-input-number-input {\n  background-color: #111827 !important;\n  color: #f8fafc !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-input-affix-wrapper-focused,\n:root[data-theme='dark'] .products-page .ant-select-focused .ant-select-selector {\n  border-color: var(--accent) !important;\n  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.16) !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-input::placeholder,\n:root[data-theme='dark'] .products-page .ant-input-affix-wrapper input::placeholder {\n  color: #94a3b8 !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-select-selection-item,\n:root[data-theme='dark'] .products-page .ant-input-prefix,\n:root[data-theme='dark'] .products-page .ant-select-arrow,\n:root[data-theme='dark'] .products-modal .ant-input-number-prefix,\n:root[data-theme='dark'] .products-page .ant-segmented-item {\n  color: #cbd5e1;\n}\n\n:root[data-theme='dark'] .products-page .ant-btn-default:hover,\n:root[data-theme='dark'] .products-page .ant-btn-default:focus {\n  border-color: var(--accent) !important;\n  color: #ffffff !important;\n  background: #1f2937 !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-segmented-item-selected {\n  background: #334155 !important;\n  color: #ffffff !important;\n  box-shadow: none !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-segmented-item-selected .anticon {\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-segmented-thumb {\n  background: #334155 !important;\n}\n\n:root[data-theme='dark'] .products-page .ant-tag {\n  background: #111827;\n  border-color: #334155;\n  color: #e5e7eb;\n}\n\n:root[data-theme='dark'] .products-page .ant-tag-blue {\n  background: rgba(37, 99, 235, 0.18);\n  border-color: rgba(96, 165, 250, 0.36);\n  color: #bfdbfe;\n}\n\n:root[data-theme='dark'] .products-page .ant-tag-green {\n  background: rgba(34, 197, 94, 0.14);\n  border-color: rgba(74, 222, 128, 0.34);\n  color: #bbf7d0;\n}\n\n:root[data-theme='dark'] .products-page .ant-tag-orange {\n  background: rgba(249, 115, 22, 0.16);\n  border-color: rgba(251, 146, 60, 0.38);\n  color: #fed7aa;\n}\n\n:root[data-theme='dark'] .products-page .ant-tag-red {\n  background: rgba(248, 113, 113, 0.14);\n  border-color: rgba(248, 113, 113, 0.36);\n  color: #fecaca;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-table-tbody > tr > td {\n  background: var(--surface);\n}\n\n:root[data-theme='dark'] .products-table-card .ant-table,\n:root[data-theme='dark'] .products-table-card .ant-table-container,\n:root[data-theme='dark'] .products-table-card .ant-table-content,\n:root[data-theme='dark'] .products-table-card .ant-table-cell-scrollbar {\n  background: var(--surface) !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-table-thead > tr > th {\n  background: #111827 !important;\n  color: #e5e7eb !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-table-tbody > tr > td {\n  background: var(--surface) !important;\n  border-bottom-color: #334155 !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-table-tbody > tr.ant-table-row:hover > td,\n:root[data-theme='dark'] .products-table-card .ant-table-tbody > tr:hover > td {\n  background: #263244 !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-table-tbody > tr.ant-table-row-selected > td {\n  background: #1f2a3a !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-pagination-item,\n:root[data-theme='dark'] .products-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .products-table-card .ant-pagination-next button {\n  background: #111827 !important;\n  border-color: #334155 !important;\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-pagination-item a,\n:root[data-theme='dark'] .products-table-card .ant-pagination-prev button,\n:root[data-theme='dark'] .products-table-card .ant-pagination-next button {\n  color: #cbd5e1 !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-pagination-item-active {\n  border-color: var(--accent) !important;\n}\n\n:root[data-theme='dark'] .products-table-card .ant-pagination-item-active a {\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .ant-select-dropdown {\n  background: #111827 !important;\n  border: 1px solid #334155 !important;\n}\n\n:root[data-theme='dark'] .ant-select-dropdown .ant-select-item {\n  color: #e5e7eb !important;\n}\n\n:root[data-theme='dark'] .ant-select-dropdown .ant-select-item-option-active,\n:root[data-theme='dark'] .ant-select-dropdown .ant-select-item-option-selected {\n  background: #263244 !important;\n  color: #ffffff !important;\n}\n\n:root[data-theme='dark'] .ant-popover .ant-popconfirm,\n:root[data-theme='dark'] .ant-popover .ant-popover-inner {\n  background: #111827;\n  color: #e5e7eb;\n}\n\n:root[data-theme='dark'] .ant-popover .ant-popover-title,\n:root[data-theme='dark'] .ant-popover .ant-popconfirm-description {\n  color: #e5e7eb;\n}\n\n@media (max-width: 768px) {\n  .products-page-header {\n    align-items: stretch;\n    flex-direction: column;\n  }\n\n  .products-primary-btn,\n  .products-search,\n  .products-filter,\n  .products-sort {\n    width: 100%;\n  }\n\n  .products-toolbar {\n    display: flex;\n    flex-direction: column;\n    align-items: stretch;\n    gap: 10px !important;\n  }\n\n  .products-view-switch {\n    margin-left: 0;\n    width: 100%;\n  }\n\n  .products-view-switch .ant-segmented-group {\n    width: 100%;\n  }\n\n  .products-view-switch .ant-segmented-item {\n    flex: 1;\n  }\n\n  .product-card .ant-card-body {\n    min-height: 220px;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-products-styles")) {
  const style = document.createElement("style");
  style.id = "combined-products-styles";
  style.textContent = productsStyles;
  document.head.appendChild(style);
}

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
