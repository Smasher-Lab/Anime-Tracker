import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
console.log("API_URL:", API_URL);

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    if (!username || !password) {
      setMessage('Please enter a username and password.');
      return;
    }

    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, isAdmin: !isLogin && isAdminChecked, adminCode: !isLogin ? adminCode : '' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        if (isLogin) {
          localStorage.setItem('user', JSON.stringify({
            userId: data.user_id,
            username: username,
            isAdmin: data.is_admin
          }));
          setTimeout(() => {
            navigate('/tracker', {
              state: {
                userId: data.user_id,
                username: username,
                isAdmin: data.is_admin
              }
            });
          }, 1500);
        } else {
          setTimeout(() => {
            setIsLogin(true);
            setMessage('Registration successful! Please log in.');
          }, 1500);
        }
      } else {
        setMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Request error:', error);
      setMessage('Could not connect to the server. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {!isLogin && (
          <>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', marginBottom: isAdminChecked ? '0.5rem' : '1.5rem' }}>
              <input
                type="checkbox"
                id="admin-checkbox"
                checked={isAdminChecked}
                onChange={(e) => setIsAdminChecked(e.target.checked)}
                style={{ width: 'auto', margin: 0 }}
              />
              <label htmlFor="admin-checkbox" style={{ display: 'inline', margin: 0, cursor: 'pointer' }}>Register as Administrator</label>
            </div>
            {isAdminChecked && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="admin-code">Admin Secret Passcode:</label>
                <input
                  type="password"
                  id="admin-code"
                  placeholder="Enter admin passcode..."
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
              </div>
            )}
          </>
        )}
        <button type="submit">{isLogin ? 'Log In' : 'Register'}</button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="toggle-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
          {isLogin ? ' Register' : ' Log in'}
        </span>
      </p>
    </div>
  );
}

export default Login;