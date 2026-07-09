import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_URL from '../config';

function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = location.state?.isAdmin || savedUser.isAdmin;

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [polls, setPolls] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [msgStatus, setMsgStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) {
      navigate('/tracker');
      return;
    }
    
    try {
      const usersResponse = await fetch(`${API_URL}/api/admin/users?is_admin=true`);
      const usersData = await usersResponse.json();
      if (!usersResponse.ok) throw new Error(usersData.message);
      setUsers(usersData.users);

      const clubsResponse = await fetch(`${API_URL}/api/admin/clubs?is_admin=true`);
      const clubsData = await clubsResponse.json();
      if (!clubsResponse.ok) throw new Error(clubsData.message);
      setClubs(clubsData.clubs);
      
      const reviewsResponse = await fetch(`${API_URL}/api/admin/reviews?is_admin=true`);
      const reviewsData = await reviewsResponse.json();
      if (!reviewsResponse.ok) throw new Error(reviewsData.message);
      setReviews(reviewsData.reviews);

      const pollsResponse = await fetch(`${API_URL}/api/admin/polls?is_admin=true`);
      const pollsData = await pollsResponse.json();
      if (pollsResponse.ok) setPolls(pollsData.polls || []);

      const discussionsResponse = await fetch(`${API_URL}/api/admin/discussions?is_admin=true`);
      const discussionsData = await discussionsResponse.json();
      if (discussionsResponse.ok) setDiscussions(discussionsData.discussions || []);

    } catch (err) {
      console.error('Admin panel fetch error:', err);
      setError('Could not fetch data for admin panel. ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleDelete = async (type, id) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/${type}s/${id}?is_admin=true`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchAdminData(); // Refresh data
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Could not delete item.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !messageContent.trim()) {
      alert('Please select a user and enter a message.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/messages?is_admin=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(selectedUserId), message: messageContent })
      });
      const data = await response.json();
      if (response.ok) {
        setMsgStatus('Message sent successfully!');
        setMessageContent('');
        setSelectedUserId('');
        setTimeout(() => setMsgStatus(''), 3000);
      } else {
        alert(data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert('Could not send message.');
    }
  };

  if (isLoading) {
    return <div className="loading-message">Loading Admin Panel...</div>;
  }
  
  if (error) {
    return <div className="error-message">Access Denied: {error}</div>;
  }

  return (
    <div className="admin-panel-container">
      <h2>Admin Panel</h2>

      <div className="admin-section">
        <h3>Manage Users</h3>
        <div className="admin-list">
          {users.map(user => (
            <div key={user.id} className="admin-card">
              <p><strong>Username:</strong> {user.username}</p>
              <button onClick={() => handleDelete('user', user.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h3>Manage Clubs</h3>
        <div className="admin-list">
          {clubs.map(club => (
            <div key={club.id} className="admin-card">
              <p><strong>Name:</strong> {club.name}</p>
              <button onClick={() => handleDelete('club', club.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="admin-section">
        <h3>Manage Reviews</h3>
        <div className="admin-list">
          {reviews.map(review => (
            <div key={review.id} className="admin-card">
              <p><strong>User:</strong> {review.username}</p>
              <p><strong>Review:</strong> {review.review_text}</p>
              <button onClick={() => handleDelete('review', review.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h3>Send Message to User</h3>
        <form onSubmit={handleSendMessage} className="admin-message-form" style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="user-select">Select User:</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
            >
              <option value="">-- Choose User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="message-text">Message:</label>
            <textarea
              id="message-text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type message here..."
              style={{ padding: '8px', borderRadius: '4px', minHeight: '80px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>Send Message</button>
          {msgStatus && <p style={{ color: 'var(--primary)', margin: 0 }}>{msgStatus}</p>}
        </form>
      </div>

      <div className="admin-section">
        <h3>Manage Polls</h3>
        <div className="admin-list">
          {polls.length > 0 ? (
            polls.map(poll => (
              <div key={poll.id} className="admin-card">
                <p><strong>Question:</strong> {poll.question}</p>
                <p><small>Created in <strong>{poll.club_name}</strong> by <strong>{poll.username}</strong></small></p>
                <button onClick={() => handleDelete('poll', poll.id)}>Delete</button>
              </div>
            ))
          ) : (
            <p>No polls have been created yet.</p>
          )}
        </div>
      </div>

      <div className="admin-section">
        <h3>Manage Discussions</h3>
        <div className="admin-list">
          {discussions.length > 0 ? (
            discussions.map(msg => (
              <div key={msg.id} className="admin-card">
                <p><strong>Message:</strong> "{msg.content}"</p>
                <p><small>Posted in <strong>{msg.club_name}</strong> by <strong>{msg.username}</strong></small></p>
                <button onClick={() => handleDelete('discussion', msg.id)}>Delete</button>
              </div>
            ))
          ) : (
            <p>No discussion messages have been posted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
