import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './Login.css';
import companyLogo from '../assets/companylogo.png';

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
