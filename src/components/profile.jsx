// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Chatbot from './Chatbot';
import API_URL from '../config';
function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = location.state?.userId || savedUser.userId;
  const username = location.state?.username || savedUser.username;
  const isAdmin = location.state?.isAdmin || savedUser.isAdmin;
  
  const [showHelp, setShowHelp] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`${API_URL}/api/admin/messages/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages || []);
          // Clear notification count since they are viewed on this page
          fetch(`${API_URL}/api/admin/messages/read/${userId}`, { method: "PUT" }).catch(e => console.error(e));
        }
      } catch (err) {
        console.error("Failed to fetch admin messages:", err);
      }
    };
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    localStorage.removeItem('user');
    navigate("/", { replace: true });
  };
  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {username ? (
        <>
          <p className="profile-greeting">Hello, <strong>{username}</strong>!</p>
          <div className="profile-details">
            <p><strong>Account Type:</strong> {isAdmin ? 'Administrator' : 'Standard User'}</p>
          </div>

          <div className="profile-actions">
            <button onClick={() => setShowHelp(!showHelp)} className="help-button">
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>

          {messages.length > 0 && (
            <div className="system-messages-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
              <h3>Inbox (Messages from Admin)</h3>
              <div className="messages-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1rem' }}>
                {messages.map(msg => (
                  <div key={msg.id} className="system-message-card" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', boxShadow: 'var(--card-shadow)' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{msg.message}</p>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '8px', fontSize: '0.8rem' }}>
                      Received on: {new Date(msg.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showHelp && (
            <div className="help-section">
              <h3>User Documentation & Help</h3>
              <p>Welcome to the help section! Here are a few tips:</p>
              <ul>
                <li>Use the search bar on the Tracker page to find new anime.</li>
                <li>Add anime to your list and use the +/- buttons to track your progress.</li>
                <li>Join a club to discuss shows with other users and participate in polls.</li>
                <li>Your entire list is automatically saved to the database, so you won't lose any progress!</li>
              </ul>
              <Chatbot />
            </div>
          )}
        </>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );

}

export default Profile;