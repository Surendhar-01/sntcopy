import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';import companyLogo from '../assets/companylogo.png';
const loginStyles = "* {\n  box-sizing: border-box;\n}\n\n#loginPage {\n  display: flex;\n  min-height: 100vh;\n  width: 100%;\n  overflow: hidden;\n  font-family: inherit;\n  background: var(--bg-primary, #0b1120);\n}\n\n/* LEFT PANEL */\n.login-left-panel {\n  flex: 2;\n  background: linear-gradient(-45deg, #2a100b, #6f2011, #8c2b16, #b84328);\n  background-size: 400% 400%;\n  animation: gradientFlow 15s ease infinite;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  overflow: hidden;\n  color: white;\n  justify-content: center;\n}\n\n@keyframes gradientFlow {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}\n\n/* Glowing background orb for depth */\n.login-left-panel::before {\n  content: '';\n  position: absolute;\n  width: 500px;\n  height: 500px;\n  background: radial-gradient(circle, rgba(242, 161, 132, 0.36) 0%, rgba(111, 32, 17, 0) 70%);\n  border-radius: 50%;\n  top: 10%;\n  left: 20%;\n  filter: blur(40px);\n  z-index: 1;\n  animation: orbFloat 10s ease-in-out infinite alternate;\n}\n\n@keyframes orbFloat {\n  0% { transform: translateY(0) scale(1); }\n  100% { transform: translateY(-30px) scale(1.1); }\n}\n\n.login-left-content {\n  padding: 40px;\n  max-width: 600px;\n  margin-left: 10%;\n  z-index: 10;\n  animation: fadeUpIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n  opacity: 0;\n}\n\n@keyframes fadeUpIn {\n  from { opacity: 0; transform: translateY(30px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.login-company-header {\n  position: absolute;\n  top: 40px;\n  left: 10%;\n  font-size: 1.2rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 2px;\n}\n\n.company-logo-text {\n  font-weight: 800;\n  letter-spacing: 1px;\n}\n\n/* Text styles */\n.login-welcome-title {\n  font-size: 4rem;\n  font-weight: 800;\n  margin-bottom: 20px;\n  line-height: 1.1;\n  text-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);\n  background: linear-gradient(135deg, #ffffff, #f2c4ae);\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n.login-business-info {\n  background: rgba(255, 255, 255, 0.03);\n  -webkit-backdrop-filter: blur(28px) saturate(180%);\n  backdrop-filter: blur(28px) saturate(180%);\n  padding: 36px 40px;\n  border-radius: 24px;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  margin-bottom: 80px;\n  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);\n  position: relative;\n  z-index: 2;\n  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.login-business-info:hover {\n  transform: translateY(-5px);\n  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);\n}\n\n.business-name {\n  font-size: 2.2rem;\n  font-weight: 800;\n  margin-bottom: 15px;\n  letter-spacing: 0.5px;\n  color: #fff;\n  display: inline-block;\n  text-shadow: 0 2px 10px rgba(0,0,0,0.2);\n}\n\n.business-detail-row {\n  display: flex;\n  align-items: flex-start;\n  gap: 15px;\n  margin-bottom: 25px;\n  font-size: 1.1rem;\n  line-height: 1.6;\n  opacity: 0.95;\n  color: #f1f5f9;\n}\n\n.business-detail-row .icon {\n  font-size: 1.4rem;\n  margin-top: 2px;\n  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));\n}\n\n.business-badges {\n  display: flex;\n  gap: 15px;\n  flex-wrap: wrap;\n}\n\n.business-badge {\n  background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));\n  padding: 12px 20px;\n  border-radius: 14px;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.1);\n  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.business-badge:hover {\n  transform: translateY(-3px) scale(1.02);\n  background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));\n  border-color: rgba(255, 255, 255, 0.3);\n  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.2);\n}\n\n.badge-label {\n  font-size: 0.75rem;\n  text-transform: uppercase;\n  font-weight: 800;\n  color: #f2a184;\n  letter-spacing: 1px;\n}\n\n.badge-value {\n  font-size: 0.95rem;\n  font-weight: 700;\n  letter-spacing: 1px;\n  color: #fff;\n}\n\n\n\n.login-wave-bg {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  line-height: 0;\n  z-index: 1;\n  opacity: 0.6;\n}\n\n.login-wave-bg svg {\n  display: block;\n  width: 100%;\n  height: auto;\n  transform: scaleY(1.3);\n  transform-origin: bottom;\n}\n\n.login-right-panel {\n  flex: 1;\n  min-width: 460px; /* Prevent shrinking too far on smaller screens */\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #2a100b;\n  position: relative;\n}\n\n.login-box {\n  background: transparent !important;\n  padding: 40px 30px; \n  width: 100%;\n  max-width: 520px; \n  border-radius: 0;\n  box-shadow: none !important;\n  border: none !important;\n}\n\n.login-title {\n  font-size: 2.8rem;\n  color: #ffffff;\n  margin-bottom: 10px;\n  font-weight: 800;\n  letter-spacing: -0.5px;\n}\n\n.login-company-logo {\n  max-width: 110px;\n  height: auto;\n  margin: 0 auto 25px auto; \n  display: block;\n  background: transparent;\n  mix-blend-mode: normal;\n  filter: none;\n}\n\n.login-greeting {\n  color: #94a3b8;\n  font-size: 0.95rem;\n  margin-bottom: 35px;\n  line-height: 1.5;\n}\n\n.field-group { \n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-bottom: 24px; \n}\n\n.field-group label {\n  font-size: 0.9rem;\n  font-weight: 500;\n  color: #e2e8f0;\n  letter-spacing: 0.3px;\n}\n\n.field-group input[type=\"text\"],\n.field-group input[type=\"password\"] {\n  width: 100%;\n  background: rgba(15, 23, 42, 0.4);\n  border: 1px solid #64748b;\n  border-radius: 8px;\n  padding: 10px 14px; \n  color: #ffffff;\n  font-size: 0.95rem; \n  outline: none;\n  transition: all 0.3s ease;\n}\n\n.field-group input:hover {\n  border-color: #d95b3d;\n}\n\n.field-group input:focus {\n  border-color: #d95b3d;\n  background: rgba(42, 16, 11, 0.72);\n  box-shadow: 0 0 0 3px rgba(217, 91, 61, 0.18);\n}\n\n.password-wrapper {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.password-wrapper input {\n  padding-right: 48px;\n}\n\n.eye-btn {\n  position: absolute;\n  right: 12px;\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  padding: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: color 0.2s;\n}\n\n.eye-btn:hover {\n  color: #e2e8f0;\n}\n\n.login-btn {\n  background: #d95b3d;\n  color: #ffffff;\n  border: none;\n  border-radius: 8px; /* Slightly rounded */\n  padding: 10px; /* Reduced vertical padding */\n  font-size: 1rem;\n  font-weight: 600;\n  width: 100%;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  transition: all 0.2s ease;\n  margin-top: 24px;\n  letter-spacing: 0.3px;\n}\n\n.login-btn svg {\n  width: 18px;\n  height: 18px;\n  transition: transform 0.2s ease;\n}\n\n.login-btn:hover {\n  background: #b84328;\n  color: #ffffff;\n}\n\n.login-btn:hover svg {\n  transform: translateX(4px);\n}\n\n/* Light Theme Support */\n:root[data-theme='light'] .login-right-panel {\n  background: #fff7f2;\n}\n\n\n\n:root[data-theme='light'] .login-title {\n  color: #0f172a;\n}\n\n:root[data-theme='light'] .login-greeting {\n  color: #64748b;\n}\n\n:root[data-theme='light'] .field-group label {\n  color: #475569;\n}\n\n:root[data-theme='light'] .field-group input[type=\"text\"],\n:root[data-theme='light'] .field-group input[type=\"password\"] {\n  background: #ffffff;\n  border: 1px solid #94a3b8;\n  color: #0f172a;\n}\n\n:root[data-theme='light'] .field-group input[type=\"text\"]:focus,\n:root[data-theme='light'] .field-group input[type=\"password\"]:focus {\n  border-color: #d95b3d;\n  background: #ffffff;\n  box-shadow: 0 0 0 3px rgba(217, 91, 61, 0.16);\n}\n\n:root[data-theme='light'] .field-group input:hover {\n  border-color: #d95b3d;\n}\n\n:root[data-theme='light'] .login-btn:hover {\n  background: #b84328;\n}\n\n/* ─── Ant Design overrides for dark login theme ─── */\n\n/* Form labels */\n.antd-label {\n  font-size: 0.9rem;\n  font-weight: 500;\n  color: #e2e8f0;\n  letter-spacing: 0.3px;\n}\n\n:root[data-theme='light'] .antd-label {\n  color: #475569;\n}\n\n/* Input fields */\n.antd-input.ant-input,\n.antd-input .ant-input {\n  background: rgba(15, 23, 42, 0.4) !important;\n  border-color: #64748b !important;\n  color: #ffffff !important;\n  font-size: 0.95rem;\n}\n\n.antd-input.ant-input:hover,\n.antd-input:hover .ant-input,\n.ant-input-affix-wrapper.antd-input:hover {\n  border-color: #d95b3d !important;\n}\n\n.antd-input.ant-input:focus,\n.ant-input-affix-wrapper.antd-input:focus-within {\n  border-color: #d95b3d !important;\n  background: rgba(42, 16, 11, 0.72) !important;\n  box-shadow: 0 0 0 3px rgba(217, 91, 61, 0.18) !important;\n}\n\n.ant-input-affix-wrapper.antd-input {\n  background: rgba(15, 23, 42, 0.4) !important;\n  border-color: #64748b !important;\n}\n\n.ant-input-affix-wrapper.antd-input:focus-within {\n  border-color: #d95b3d !important;\n  box-shadow: 0 0 0 3px rgba(217, 91, 61, 0.18) !important;\n}\n\n/* prefix icons */\n.antd-input-icon {\n  color: #64748b;\n}\n\n/* Password visibility toggle svg */\n.ant-input-password-icon {\n  color: #94a3b8 !important;\n}\n.ant-input-password-icon:hover {\n  color: #e2e8f0 !important;\n}\n\n/* Placeholder */\n.antd-input.ant-input::placeholder,\n.antd-input .ant-input::placeholder {\n  color: #475569 !important;\n}\n\n/* Light theme input overrides */\n:root[data-theme='light'] .antd-input.ant-input,\n:root[data-theme='light'] .antd-input .ant-input,\n:root[data-theme='light'] .ant-input-affix-wrapper.antd-input {\n  background: #ffffff !important;\n  border-color: #94a3b8 !important;\n  color: #0f172a !important;\n}\n\n:root[data-theme='light'] .antd-input.ant-input:focus,\n:root[data-theme='light'] .ant-input-affix-wrapper.antd-input:focus-within {\n  border-color: #d95b3d !important;\n  box-shadow: 0 0 0 3px rgba(217, 91, 61, 0.16) !important;\n}\n\n/* Form item validation message */\n.ant-form-item-explain-error {\n  color: #ef4444 !important;\n  font-size: 0.82rem !important;\n}\n\n/* Login button */\n.antd-login-btn.ant-btn {\n  background: #d95b3d !important;\n  border-color: #d95b3d !important;\n  color: #ffffff !important;\n  font-size: 1rem;\n  font-weight: 600;\n  letter-spacing: 0.3px;\n  border-radius: 8px;\n  height: 44px;\n  transition: all 0.2s ease !important;\n}\n\n.antd-login-btn.ant-btn:hover {\n  background: #b84328 !important;\n  border-color: #b84328 !important;\n  color: #ffffff !important;\n}\n\n/* Ant Design Form vertical layout label spacing */\n.ant-form-item-label {\n  padding-bottom: 6px !important;\n}\n\n/* ─────────────────────────────────────────────────── */\n\n/* Responsive */\n@media (max-width: 900px) {\n  #loginPage {\n    flex-direction: column;\n  }\n\n  .login-left-panel {\n    flex: 0 0 40vh;\n  }\n\n  .login-left-content {\n    margin-left: 0;\n    padding: 30px 20px;\n    text-align: center;\n    margin: 0 auto;\n  }\n\n  .login-company-header {\n    position: static;\n    margin-bottom: 20px;\n    left: 0;\n  }\n\n  .login-welcome-title {\n    font-size: 2.5rem;\n  }\n\n  .login-welcome-subtitle {\n    font-size: 0.9rem;\n    display: none;\n  }\n\n\n\n  .login-right-panel {\n    flex: 1;\n    align-items: flex-start;\n    padding-top: 20px;\n  }\n}";

if (typeof document !== "undefined" && !document.getElementById("combined-login-styles")) {
  const style = document.createElement("style");
  style.id = "combined-login-styles";
  style.textContent = loginStyles;
  document.head.appendChild(style);
}

export default function Login({ onLogin }) {
  const [form] = Form.useForm();

  const doLogin = async (values) => {
    const normalizedUsername = values.username?.trim();
    try {
      await onLogin(normalizedUsername, values.password);
    } catch (loginError) {
      message.error(loginError?.message || 'Login failed');
    }
  };

  return (
    <div id="loginPage">
      {/* LEFT PANEL */}
      <div className="login-left-panel">
        <div className="login-left-content">
          <h1 className="login-welcome-title">Welcome to...</h1>
          <div className="login-business-info">
            <h2 className="business-name">Sri Nikil Tradings</h2>

            <div className="business-detail-row">
              <span className="icon">📍</span>
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

        <div className="login-wave-bg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(255, 255, 255, 0.15)" fillOpacity="1" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,197.3C672,224,768,256,864,250.7C960,245,1056,203,1152,192C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="rgba(255, 255, 255, 0.25)" fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,186.7C480,192,600,160,720,176C840,192,960,256,1080,261.3C1200,267,1320,213,1380,186.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right-panel">
        <div className="login-box">
          <img src={companyLogo} alt="Company Logo" className="login-company-logo" />
          <h2 className="login-title">Login</h2>
          <p className="login-greeting">Welcome! Login to get amazing discounts and offers only for you.</p>

          <Form
            form={form}
            layout="vertical"
            onFinish={doLogin}
            requiredMark={false}
          >
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
                iconPosition="end"
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
