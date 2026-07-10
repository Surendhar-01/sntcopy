import React, { useState } from 'react';
import './Login.css';
import companyLogo from '../assets/companylogo.png';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const doLogin = async () => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setError('Enter username and password');
      return;
    }

    try {
      await onLogin(normalizedUsername, password);
      setError('');
    } catch (loginError) {
      setError(loginError?.message || 'Login failed');
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
      
      <div className="login-right-panel">
        <div className="login-box">
          <img src={companyLogo} alt="Company Logo" className="login-company-logo" />
          <h2 className="login-title">Login</h2>
          <p className="login-greeting">Welcome! Login to get amazing discounts and offers only for you.</p>
          
          <div className="field-group">
            <label>Username</label>
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Enter username"
              value={username}
              onChange={event => {
                setUsername(event.target.value);
                setError('');
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') doLogin();
              }}
            />
          </div>
          <div className="field-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value);
                  setError('');
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') doLogin();
                }}
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>



          {error && (
             <div style={{ color: 'var(--red, #ef4444)', fontSize: '.82rem', marginBottom: '10px' }}>
               {error}
             </div>
          )}
          
          <button className="login-btn" onClick={doLogin}>
            <span>Login</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
