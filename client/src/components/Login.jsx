import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      <div
        className="login-logo gold-text"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <img src="/logo.svg" alt="Logo" style={{ height: '40px' }} />
        Sri Nikil Tradings
      </div>
      <div className="login-sub">
        058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004
        <br />
        GSTIN: 33AMCPD1118L1ZK | FSSAI: 12424007000946
        <br />
        94875 81302 / 0424 2901803
      </div>
      <div className="login-box">
        <h2>Login</h2>
        <div className="field">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={event => {
              setUsername(event.target.value);
              setError('');
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                doLogin();
              }
            }}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={event => {
              setPassword(event.target.value);
              setError('');
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                doLogin();
              }
            }}
          />
        </div>
        {error ? (
          <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '10px' }}>
            {error}
          </div>
        ) : null}
        <button className="btn btn-primary btn-full" onClick={doLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
