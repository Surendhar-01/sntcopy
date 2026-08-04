import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloseOutlined,
  DatabaseOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import companyLogo from '../assets/companylogo.png';
import Login from './Login';
import { useTheme } from '../context/useTheme';
import { USER_ROLE_LABELS, USER_ROLES } from '../utils/roles';

const introStyles = `
#introPage {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 78% 20%, rgba(236, 72, 153, 0.20), transparent 28%),
    radial-gradient(circle at 24% 78%, rgba(59, 130, 246, 0.20), transparent 30%),
    linear-gradient(135deg, #080b18 0%, #11142a 48%, #191034 100%);
  background-attachment: fixed;
  color: #f8fafc;
  font-family: inherit;
  position: relative;
}

#introPage::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 58px 58px;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 78%);
  pointer-events: none;
}

.intro-navbar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 22px clamp(18px, 5vw, 72px);
}

.intro-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.intro-brand-logo-shell {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ec4899, #8b5cf6 48%, #38bdf8);
  box-shadow: 0 16px 34px rgba(236, 72, 153, 0.28);
}

.intro-brand-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  padding: 3px;
}

.intro-brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.intro-brand-name {
  color: #ffffff;
  font-size: 1.02rem;
  font-weight: 900;
  line-height: 1.15;
}

.intro-brand-place {
  color: #aeb7d8;
  font-size: 0.74rem;
  font-weight: 700;
  margin-top: 2px;
}

.intro-nav-links {
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 38px);
  margin-left: auto;
}

.intro-nav-link {
  border: 0;
  background: transparent;
  color: #dbe4ff;
  cursor: default;
  font-size: 0.86rem;
  font-weight: 700;
  opacity: 0.92;
}

.intro-nav-actions {
  position: relative;
  display: flex;
  align-items: center;
}

.intro-login-btn.ant-btn {
  height: 44px;
  border: 0;
  border-radius: 12px;
  padding-inline: 20px;
  font-weight: 900;
  background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 48%, #38bdf8 100%);
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(139, 92, 246, 0.35);
}

.intro-login-btn.ant-btn:hover {
  filter: brightness(1.08);
  color: #ffffff !important;
}

.intro-role-menu {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  width: min(330px, calc(100vw - 32px));
  z-index: 12;
  background: rgba(15, 18, 39, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.44);
  padding: 10px;
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

.intro-role-title {
  padding: 8px 10px 12px;
  color: #aeb7d8;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.intro-role-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 0;
  background: transparent;
  border-radius: 14px;
  color: #f8fafc;
  cursor: pointer;
  text-align: left;
}

.intro-role-option:hover,
.intro-role-option:focus-visible {
  background: rgba(139, 92, 246, 0.18);
  outline: none;
}

.intro-role-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.26), rgba(56, 189, 248, 0.18));
  color: #ffffff;
  font-size: 1.12rem;
}

.intro-role-copy strong {
  display: block;
  font-size: 0.95rem;
  line-height: 1.25;
}

.intro-role-copy span {
  display: block;
  margin-top: 3px;
  color: #aeb7d8;
  font-size: 0.78rem;
}

.intro-hero {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 88px);
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
  align-items: center;
  gap: clamp(26px, 5vw, 72px);
  padding: clamp(22px, 5vw, 64px) clamp(18px, 6vw, 84px) clamp(42px, 5vw, 70px);
}

.intro-hero-copy {
  max-width: 650px;
}

.intro-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #f0abfc;
  font-size: 0.82rem;
  text-transform: uppercase;
  font-weight: 900;
  margin-bottom: 18px;
}

.intro-kicker::before {
  content: '';
  width: 34px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ec4899, #38bdf8);
}

.intro-title {
  margin: 0 0 20px;
  color: #ffffff;
  font-size: clamp(2.6rem, 5.4vw, 5.8rem);
  line-height: 1.02;
  font-weight: 950;
  letter-spacing: 0;
}

.intro-gradient-text {
  background: linear-gradient(90deg, #f472b6 0%, #a78bfa 48%, #38bdf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.intro-subtitle {
  max-width: 520px;
  color: #d3dcff;
  font-size: clamp(1rem, 1.6vw, 1.18rem);
  line-height: 1.65;
  margin: 0 0 28px;
}

.intro-primary-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 30px;
}

.intro-start-btn.ant-btn {
  height: 48px;
  border: 0;
  border-radius: 14px;
  padding-inline: 24px;
  font-weight: 900;
  background: linear-gradient(90deg, #ec4899, #8b5cf6, #38bdf8);
  color: #ffffff;
  box-shadow: 0 18px 38px rgba(236, 72, 153, 0.28);
}

.intro-secondary-note {
  color: #aeb7d8;
  font-weight: 700;
  font-size: 0.9rem;
}

.intro-quick-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 580px;
}

.intro-stat {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.055);
  border-radius: 14px;
  padding: 15px;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.intro-stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #ffffff;
  background: rgba(139, 92, 246, 0.28);
}

.intro-stat strong {
  display: block;
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 4px;
}

.intro-stat span {
  color: #aeb7d8;
  font-size: 0.78rem;
  font-weight: 700;
}

.intro-visual {
  min-height: 560px;
  position: relative;
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03)),
    #11152d;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  padding: 28px;
}

.intro-visual::before {
  content: '';
  position: absolute;
  left: -18%;
  right: -18%;
  bottom: 10%;
  height: 210px;
  background:
    repeating-linear-gradient(102deg, rgba(244, 114, 182, 0.18) 0 2px, transparent 2px 12px),
    linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.58), rgba(56, 189, 248, 0.42), transparent);
  transform: rotate(-10deg);
  filter: blur(0.2px);
  border-radius: 50%;
  opacity: 0.9;
}

.intro-visual::after {
  content: '';
  position: absolute;
  width: 480px;
  height: 480px;
  left: 4%;
  bottom: -210px;
  border-radius: 999px;
  border: 1px solid rgba(236, 72, 153, 0.30);
  box-shadow:
    0 0 0 28px rgba(236, 72, 153, 0.05),
    0 0 0 58px rgba(56, 189, 248, 0.04);
}

.intro-window {
  position: relative;
  z-index: 2;
  border-radius: 18px;
  background: rgba(18, 24, 50, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.30);
  overflow: hidden;
}

.intro-window-main {
  width: min(430px, 82%);
  margin-left: auto;
  padding: 18px;
}

.intro-window-top {
  display: flex;
  gap: 6px;
  padding-bottom: 16px;
}

.intro-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ec4899;
}

.intro-dot:nth-child(2) { background: #8b5cf6; }
.intro-dot:nth-child(3) { background: #38bdf8; }

.intro-window-title {
  color: #ffffff;
  font-weight: 900;
  font-size: 1rem;
  margin-bottom: 4px;
}

.intro-window-sub {
  color: #aeb7d8;
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 18px;
}

.intro-bars {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
}

.intro-bar {
  height: 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  overflow: hidden;
}

.intro-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ec4899, #8b5cf6, #38bdf8);
}

.intro-chart {
  height: 124px;
  display: flex;
  align-items: end;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
}

.intro-chart span {
  flex: 1;
  border-radius: 999px 999px 6px 6px;
  background: linear-gradient(180deg, #ec4899, #8b5cf6);
}

.intro-floating-card {
  position: absolute;
  z-index: 3;
  border-radius: 18px;
  background: rgba(27, 32, 64, 0.90);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.34);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}

.intro-mini-form {
  left: 5%;
  top: 32%;
  width: 240px;
  padding: 18px;
}

.intro-mini-line {
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  margin-bottom: 12px;
}

.intro-mini-line:nth-child(2) { width: 78%; }
.intro-mini-line:nth-child(3) {
  width: 58%;
  background: linear-gradient(90deg, #ec4899, #8b5cf6);
}

.intro-metric-card {
  right: 6%;
  top: 12%;
  width: 190px;
  padding: 18px;
}

.intro-ring {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  margin: 8px auto 12px;
  background: conic-gradient(#ec4899 0 42%, #38bdf8 42% 72%, rgba(255,255,255,0.12) 72%);
  position: relative;
}

.intro-ring::after {
  content: '';
  position: absolute;
  inset: 13px;
  border-radius: 50%;
  background: #1b2040;
}

.intro-card-label {
  color: #aeb7d8;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.intro-card-value {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 950;
  margin-top: 3px;
}

.intro-feature-row {
  position: absolute;
  z-index: 4;
  right: 6%;
  bottom: 8%;
  display: grid;
  grid-template-columns: repeat(3, minmax(96px, 1fr));
  gap: 12px;
  width: min(430px, 80%);
}

.intro-feature {
  min-height: 112px;
  border-radius: 18px;
  padding: 16px 12px;
  display: grid;
  place-items: center;
  text-align: center;
  background: rgba(20, 24, 50, 0.88);
  border: 1px solid rgba(255,255,255,0.10);
  color: #ffffff;
}

.intro-feature span {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  margin-bottom: 8px;
  background: rgba(139, 92, 246, 0.26);
  color: #ffffff;
}

.intro-feature strong {
  font-size: 0.78rem;
  line-height: 1.3;
}

.login-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(5, 8, 20, 0.72);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.login-popup-card {
  position: relative;
  width: min(1240px, calc(100vw - 36px));
  max-height: min(780px, calc(100vh - 36px));
  overflow: auto;
  border-radius: 18px;
  background: var(--bg2);
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.48);
}

.login-popup-close.ant-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 4;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.90);
  border-color: rgba(15, 23, 42, 0.12);
  color: #172033;
}

.login-popup-card #loginPage {
  min-height: 640px;
  border-radius: 18px;
}

.login-popup-card .login-left-panel,
.login-popup-card .login-right-panel {
  min-height: 640px;
}

.login-popup-card .login-left-content {
  margin-left: 0;
  padding: 48px 30px;
}

.login-popup-card .login-back-btn {
  display: none;
}

:root[data-theme='light'] #introPage {
  background:
    radial-gradient(circle at 78% 20%, rgba(85, 110, 230, 0.18), transparent 28%),
    radial-gradient(circle at 20% 78%, rgba(56, 189, 248, 0.18), transparent 32%),
    linear-gradient(135deg, #f8faff 0%, #edf2ff 48%, #ffffff 100%);
  color: #172033;
}

:root[data-theme='light'] #introPage::before {
  background:
    linear-gradient(rgba(85, 110, 230, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(85, 110, 230, 0.08) 1px, transparent 1px);
}

:root[data-theme='light'] .intro-navbar {
  background: rgba(255, 255, 255, 0.72);
  border-bottom: 1px solid rgba(85, 110, 230, 0.12);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

:root[data-theme='light'] .intro-brand-name,
:root[data-theme='light'] .intro-title,
:root[data-theme='light'] .intro-stat strong,
:root[data-theme='light'] .intro-card-value {
  color: #111827;
}

:root[data-theme='light'] .intro-brand-place,
:root[data-theme='light'] .intro-nav-link,
:root[data-theme='light'] .intro-subtitle,
:root[data-theme='light'] .intro-secondary-note,
:root[data-theme='light'] .intro-stat span,
:root[data-theme='light'] .intro-window-sub,
:root[data-theme='light'] .intro-card-label {
  color: #5a6278;
}

:root[data-theme='light'] .intro-kicker {
  color: #556ee6;
}

:root[data-theme='light'] .intro-stat,
:root[data-theme='light'] .intro-feature,
:root[data-theme='light'] .intro-floating-card,
:root[data-theme='light'] .intro-window {
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(85, 110, 230, 0.16);
  box-shadow: 0 20px 48px rgba(85, 110, 230, 0.12);
}

:root[data-theme='light'] .intro-visual {
  background:
    linear-gradient(145deg, rgba(255,255,255,0.86), rgba(238,242,255,0.74)),
    #ffffff;
  border-color: rgba(85, 110, 230, 0.16);
  box-shadow: 0 34px 80px rgba(85, 110, 230, 0.18);
}

:root[data-theme='light'] .intro-visual::before {
  opacity: 0.58;
}

:root[data-theme='light'] .intro-window-title,
:root[data-theme='light'] .intro-feature,
:root[data-theme='light'] .intro-feature strong {
  color: #172033;
}

:root[data-theme='light'] .intro-bar {
  background: rgba(85, 110, 230, 0.12);
}

:root[data-theme='light'] .intro-chart {
  background: rgba(85, 110, 230, 0.08);
}

:root[data-theme='light'] .intro-mini-line {
  background: rgba(85, 110, 230, 0.18);
}

:root[data-theme='light'] .intro-ring::after {
  background: #ffffff;
}

:root[data-theme='light'] .intro-role-menu {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(85, 110, 230, 0.16);
  box-shadow: 0 26px 70px rgba(85, 110, 230, 0.20);
}

:root[data-theme='light'] .intro-role-title,
:root[data-theme='light'] .intro-role-copy span {
  color: #667085;
}

:root[data-theme='light'] .intro-role-option {
  color: #172033;
}

:root[data-theme='light'] .intro-role-option:hover,
:root[data-theme='light'] .intro-role-option:focus-visible {
  background: #eef2ff;
}

@media (max-width: 1050px) {
  .intro-nav-links {
    display: none;
  }

  .intro-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .intro-visual {
    min-height: 520px;
  }
}

@media (max-width: 720px) {
  #introPage {
    overflow-x: hidden;
  }

  .intro-navbar {
    padding: 16px;
  }

  .intro-brand-place {
    display: none;
  }

  .intro-brand-logo-shell {
    width: 40px;
    height: 40px;
  }

  .intro-login-btn.ant-btn {
    height: 40px;
    padding-inline: 15px;
  }

  .intro-hero {
    padding: 22px 16px 38px;
  }

  .intro-title {
    font-size: clamp(2.35rem, 13vw, 3.45rem);
  }

  .intro-primary-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .intro-quick-stats {
    grid-template-columns: 1fr;
  }

  .intro-visual {
    min-height: 620px;
    padding: 18px;
    border-radius: 22px;
  }

  .intro-window-main {
    width: 100%;
    margin-left: 0;
  }

  .intro-mini-form {
    left: 18px;
    top: 285px;
    width: calc(100% - 36px);
  }

  .intro-metric-card {
    right: 18px;
    top: 432px;
    width: 170px;
  }

  .intro-feature-row {
    left: 18px;
    right: 18px;
    bottom: 18px;
    width: auto;
    grid-template-columns: 1fr;
  }

  .intro-feature {
    min-height: 76px;
    grid-template-columns: auto 1fr;
    text-align: left;
    justify-content: start;
    gap: 12px;
  }

  .intro-feature span {
    margin-bottom: 0;
  }

  .login-popup-overlay {
    align-items: flex-start;
    padding: 12px;
    overflow: auto;
  }

  .login-popup-card {
    width: 100%;
    max-height: none;
    overflow-x: hidden;
  }

  .login-popup-card #loginPage,
  .login-popup-card .login-left-panel,
  .login-popup-card .login-right-panel {
    min-height: auto;
  }

  .login-popup-card #loginPage {
    grid-template-columns: minmax(0, 1fr) !important;
    width: 100%;
    overflow: visible;
  }

  .login-popup-card .login-left-panel {
    display: none;
  }

  .login-popup-card .login-right-panel {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
    padding: 72px 22px 28px;
  }

  .login-popup-card .login-box,
  .login-popup-card .ant-form,
  .login-popup-card .ant-form-item,
  .login-popup-card .ant-form-item-control,
  .login-popup-card .ant-form-item-control-input,
  .login-popup-card .ant-form-item-control-input-content {
    width: 100%;
    min-width: 0;
  }

  .login-popup-card .ant-input-affix-wrapper.antd-input,
  .login-popup-card .antd-login-btn.ant-btn {
    width: 100%;
    max-width: 100%;
  }
}
`;

function upsertIntroStyles() {
  if (typeof document === 'undefined') return;
  let style = document.getElementById('combined-intro-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'combined-intro-styles';
    document.head.appendChild(style);
  }
  style.textContent = introStyles;
}

upsertIntroStyles();

const ROLE_CHOICES = [
  {
    role: USER_ROLES.STAFF,
    label: USER_ROLE_LABELS[USER_ROLES.STAFF],
    description: 'Billing and daily sales access',
    icon: <UserOutlined />,
  },
  {
    role: USER_ROLES.ADMIN,
    label: USER_ROLE_LABELS[USER_ROLES.ADMIN],
    description: 'Full system and settings access',
    icon: <SafetyCertificateOutlined />,
  },
  {
    role: USER_ROLES.MANAGER,
    label: USER_ROLE_LABELS[USER_ROLES.MANAGER],
    description: 'Operations and report access',
    icon: <TeamOutlined />,
  },
];

export default function IntroPage({ onRoleSelect, onLogin, selectedRole, onCloseLogin }) {
  const [showRoles, setShowRoles] = useState(false);
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    const previousBodyBg = document.body.style.background;
    const previousHtmlBg = document.documentElement.style.background;
    const introBackground = effectiveTheme === 'light' ? '#f8faff' : '#080b18';
    document.body.style.background = introBackground;
    document.documentElement.style.background = introBackground;
    return () => {
      document.body.style.background = previousBodyBg;
      document.documentElement.style.background = previousHtmlBg;
    };
  }, [effectiveTheme]);

  const handleRoleSelect = (role) => {
    setShowRoles(false);
    onRoleSelect(role);
  };

  return (
    <div id="introPage">
      <nav className="intro-navbar">
        <div className="intro-brand">
          <span className="intro-brand-logo-shell">
            <img src={companyLogo} alt="Sri Nikil Tradings" className="intro-brand-logo" />
          </span>
          <div className="intro-brand-text">
            <span className="intro-brand-name">Sri Nikil Tradings</span>
            <span className="intro-brand-place">Oil trading ERP, Erode</span>
          </div>
        </div>

        <div className="intro-nav-links" aria-hidden="true">
          <button className="intro-nav-link" type="button">Home</button>
          <button className="intro-nav-link" type="button">Stock</button>
          <button className="intro-nav-link" type="button">Billing</button>
          <button className="intro-nav-link" type="button">Reports</button>
        </div>

        <div className="intro-nav-actions">
          <Button
            type="primary"
            icon={<LoginOutlined />}
            className="intro-login-btn"
            onClick={() => setShowRoles((current) => !current)}
          >
            Login
          </Button>

          {showRoles && (
            <div className="intro-role-menu" role="menu" aria-label="Choose login role">
              <div className="intro-role-title">Choose login type</div>
              {ROLE_CHOICES.map((choice) => (
                <button
                  key={choice.role}
                  type="button"
                  className="intro-role-option"
                  onClick={() => handleRoleSelect(choice.role)}
                >
                  <span className="intro-role-icon">{choice.icon}</span>
                  <span className="intro-role-copy">
                    <strong>{choice.label}</strong>
                    <span>{choice.description}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="intro-hero">
        <section className="intro-hero-copy">
          <div className="intro-kicker">Sri Nikil ERP Portal</div>
          <h1 className="intro-title">
            We Manage <span className="intro-gradient-text">Oil Business</span> With Modern Control
          </h1>
          <p className="intro-subtitle">
            A secure role based workspace for billing, stock, price board, sales reports and daily shift tracking.
          </p>

          <div className="intro-primary-actions">
            <Button
              className="intro-start-btn"
              icon={<ThunderboltOutlined />}
              onClick={() => setShowRoles((current) => !current)}
            >
              Get Started
            </Button>
            <span className="intro-secondary-note">Staff, Admin and Manager login access</span>
          </div>

          <div className="intro-quick-stats">
            <div className="intro-stat">
              <span className="intro-stat-icon"><AppstoreOutlined /></span>
              <strong>Fast Billing</strong>
              <span>GST-ready daily sales</span>
            </div>
            <div className="intro-stat">
              <span className="intro-stat-icon"><DatabaseOutlined /></span>
              <strong>Live Stock</strong>
              <span>Refill and price tracking</span>
            </div>
            <div className="intro-stat">
              <span className="intro-stat-icon"><BarChartOutlined /></span>
              <strong>Reports</strong>
              <span>Role based insights</span>
            </div>
          </div>
        </section>

        <aside className="intro-visual" aria-label="Sri Nikil ERP preview">
          <div className="intro-window intro-window-main">
            <div className="intro-window-top">
              <span className="intro-dot" />
              <span className="intro-dot" />
              <span className="intro-dot" />
            </div>
            <div className="intro-window-title">Business Dashboard</div>
            <div className="intro-window-sub">Revenue, stock and price movement</div>
            <div className="intro-bars">
              <div className="intro-bar"><span style={{ width: '82%' }} /></div>
              <div className="intro-bar"><span style={{ width: '56%' }} /></div>
              <div className="intro-bar"><span style={{ width: '68%' }} /></div>
            </div>
            <div className="intro-chart">
              <span style={{ height: '44%' }} />
              <span style={{ height: '64%' }} />
              <span style={{ height: '52%' }} />
              <span style={{ height: '86%' }} />
              <span style={{ height: '72%' }} />
            </div>
          </div>

          <div className="intro-floating-card intro-mini-form">
            <div className="intro-card-label">Current module</div>
            <div className="intro-card-value">Billing</div>
            <div className="intro-mini-line" />
            <div className="intro-mini-line" />
            <div className="intro-mini-line" />
          </div>

          <div className="intro-floating-card intro-metric-card">
            <div className="intro-card-label">Sales mix</div>
            <div className="intro-ring" />
            <div className="intro-card-value">Role Safe</div>
          </div>

          <div className="intro-feature-row">
            <div className="intro-feature">
              <span><AppstoreOutlined /></span>
              <strong>Responsive Dashboard</strong>
            </div>
            <div className="intro-feature">
              <span><ThunderboltOutlined /></span>
              <strong>Fast Shift Flow</strong>
            </div>
            <div className="intro-feature">
              <span><SafetyCertificateOutlined /></span>
              <strong>Secure Role Login</strong>
            </div>
          </div>
        </aside>
      </main>

      {selectedRole && (
        <div className="login-popup-overlay" role="dialog" aria-modal="true" aria-label="Login">
          <div className="login-popup-card">
            <Button
              aria-label="Close login"
              icon={<CloseOutlined />}
              className="login-popup-close"
              onClick={onCloseLogin}
            />
            <Login
              onLogin={onLogin}
              selectedRole={selectedRole}
              onBack={onCloseLogin}
            />
          </div>
        </div>
      )}
    </div>
  );
}
