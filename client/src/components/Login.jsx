import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { ArrowRightOutlined, EnvironmentOutlined, LeftOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import companyLogo from '../assets/companylogo.png';
import { getRoleLabel } from '../utils/roles';

const loginStyles = "* {\n  box-sizing: border-box;\n}\n\n#loginPage {\n  min-height: 100vh;\n  width: 100%;\n  display: grid;\n  grid-template-columns: minmax(0, 1.25fr) minmax(420px, 0.75fr);\n  overflow: hidden;\n  background: var(--bg);\n  font-family: inherit;\n}\n\n.login-left-panel {\n  position: relative;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  color: var(--text);\n  background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 58%, #e8f6f3 100%);\n  border-right: 1px solid var(--border);\n}\n\n.login-left-content {\n  position: relative;\n  z-index: 1;\n  width: min(680px, 100%);\n  margin-left: clamp(24px, 8vw, 110px);\n  padding: 42px 28px;\n}\n\n.login-welcome-title {\n  font-size: clamp(2.5rem, 5vw, 4.7rem);\n  line-height: 1.02;\n  margin-bottom: 24px;\n  font-weight: 900;\n  letter-spacing: 0;\n  color: var(--text);\n}\n\n.login-business-info {\n  max-width: 560px;\n  padding: 30px;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  background: rgba(255, 255, 255, 0.72);\n  -webkit-backdrop-filter: blur(18px);\n  backdrop-filter: blur(18px);\n  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);\n}\n\n.business-name {\n  margin: 0 0 18px;\n  color: var(--text);\n  font-size: clamp(1.7rem, 3vw, 2.35rem);\n  line-height: 1.15;\n  font-weight: 900;\n}\n\n.business-detail-row {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  margin-bottom: 24px;\n  color: var(--text2);\n  line-height: 1.6;\n  font-size: 1rem;\n}\n\n.business-detail-row .icon {\n  margin-top: 3px;\n  color: var(--accent);\n  font-size: 1.18rem;\n}\n\n.business-badges {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n}\n\n.business-badge {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: 170px;\n  padding: 12px 14px;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  background: var(--surface-strong);\n}\n\n.badge-label {\n  color: var(--accent);\n  font-size: 0.72rem;\n  text-transform: uppercase;\n  font-weight: 900;\n}\n\n.badge-value {\n  color: var(--text);\n  font-size: 0.92rem;\n  font-weight: 800;\n}\n\n.login-right-panel {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 36px;\n  background: var(--bg2);\n}\n\n.login-box {\n  width: min(100%, 460px);\n}\n\n.login-company-logo {\n  display: block;\n  width: 108px;\n  height: auto;\n  margin: 0 auto 24px;\n}\n\n.login-back-btn.ant-btn {\n  margin-bottom: 18px;\n  padding-left: 0;\n  color: var(--accent) !important;\n  font-weight: 800;\n}\n\n.login-role-pill {\n  display: inline-flex;\n  align-items: center;\n  min-height: 34px;\n  margin-bottom: 14px;\n  padding: 7px 12px;\n  border-radius: 8px;\n  background: var(--accent3);\n  color: var(--accent2);\n  border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--border));\n  font-size: 0.86rem;\n  font-weight: 900;\n}\n\n.login-title {\n  margin: 0 0 10px;\n  color: var(--text);\n  font-size: 2.55rem;\n  line-height: 1.1;\n  font-weight: 900;\n  letter-spacing: 0;\n}\n\n.login-greeting {\n  margin: 0 0 32px;\n  color: var(--text2);\n  line-height: 1.55;\n  font-size: 0.96rem;\n}\n\n.antd-label {\n  color: var(--text2);\n  font-size: 0.9rem;\n  font-weight: 700;\n}\n\n.antd-input.ant-input,\n.antd-input .ant-input,\n.ant-input-affix-wrapper.antd-input {\n  background: var(--input-bg) !important;\n  border-color: var(--input-border) !important;\n  color: var(--text) !important;\n  border-radius: 8px;\n}\n\n.antd-input.ant-input:hover,\n.ant-input-affix-wrapper.antd-input:hover,\n.ant-input-affix-wrapper.antd-input:focus-within {\n  border-color: var(--accent) !important;\n  box-shadow: 0 0 0 3px var(--focus-ring) !important;\n}\n\n.antd-input-icon,\n.ant-input-password-icon {\n  color: var(--text3) !important;\n}\n\n.antd-login-btn.ant-btn {\n  height: 44px;\n  border-radius: 8px;\n  background: var(--accent) !important;\n  border-color: var(--accent) !important;\n  color: #ffffff !important;\n  font-size: 1rem;\n  font-weight: 800;\n}\n\n.antd-login-btn.ant-btn:hover {\n  background: var(--accent2) !important;\n  border-color: var(--accent2) !important;\n}\n\n.ant-form-item-explain-error {\n  color: #ef4444 !important;\n  font-size: 0.82rem !important;\n}\n\n:root[data-theme='dark'] .login-left-panel {\n  background: linear-gradient(135deg, #10141f 0%, #171d2a 58%, #1f2635 100%);\n}\n\n:root[data-theme='dark'] .login-business-info {\n  background: rgba(31, 38, 53, 0.78);\n  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);\n}\n\n@media (max-width: 900px) {\n  #loginPage {\n    grid-template-columns: 1fr;\n  }\n\n  .login-left-panel {\n    min-height: 42vh;\n  }\n\n  .login-left-content {\n    margin-left: 0;\n    padding: 30px 18px;\n  }\n\n  .login-business-info {\n    padding: 22px;\n  }\n\n  .login-right-panel {\n    min-height: 58vh;\n    align-items: flex-start;\n    padding: 28px 18px;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-login-styles")) {
  const style = document.createElement("style");
  style.id = "combined-login-styles";
  style.textContent = loginStyles;
  document.head.appendChild(style);
}

export default function Login({ onLogin, selectedRole, onBack }) {
  const [form] = Form.useForm();
  const selectedRoleLabel = getRoleLabel(selectedRole);

  const doLogin = async (values) => {
    const normalizedUsername = values.username?.trim();
    try {
      await onLogin(normalizedUsername, values.password, selectedRole);
    } catch (loginError) {
      message.error(loginError?.message || 'Login failed');
    }
  };

  return (
    <div id="loginPage">
      <div className="login-left-panel">
        <div className="login-left-content">
          <h1 className="login-welcome-title">Welcome to...</h1>
          <div className="login-business-info">
            <h2 className="business-name">Sri Nikil Tradings</h2>

            <div className="business-detail-row">
              <EnvironmentOutlined className="icon" />
              <p style={{ margin: 0 }}>
                058/1, Bhavani Main Road,<br />
                Opp. Central Warehouse, Erode - 638004
              </p>
            </div>

            <div className="business-badges">
              <div className="business-badge">
                <span className="badge-label">GSTIN</span>
                <span className="badge-value">33AMCPD1118L1ZK</span>
              </div>
              <div className="business-badge">
                <span className="badge-label">FSSAI</span>
                <span className="badge-value">12424007000946</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-box">
          <Button type="link" icon={<LeftOutlined />} className="login-back-btn" onClick={onBack}>
            Back
          </Button>
          <img src={companyLogo} alt="Company Logo" className="login-company-logo" />
          <span className="login-role-pill">{selectedRoleLabel} Login</span>
          <h2 className="login-title">Login</h2>
          <p className="login-greeting">Use your {selectedRoleLabel.toLowerCase()} account to continue.</p>

          <Form form={form} layout="vertical" onFinish={doLogin} requiredMark={false}>
            <Form.Item
              name="username"
              label={<span className="antd-label">Username</span>}
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input
                prefix={<UserOutlined className="antd-input-icon" />}
                placeholder="Enter username"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                size="large"
                className="antd-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="antd-label">Password</span>}
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="antd-input-icon" />}
                placeholder="Enter password"
                size="large"
                className="antd-input"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
                block
                className="antd-login-btn"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
