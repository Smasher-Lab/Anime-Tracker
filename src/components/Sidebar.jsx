import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ShareWatchlist from "./ShareWatchlist";
import API_URL from "../config";

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showInboxModal, setShowInboxModal] = useState(false);
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Listen to localStorage or updates on route changes
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            setUser(null);
        }
    }, [location.pathname]);

    // Fetch notifications and count unread messages
    const fetchAdminMessages = async () => {
        if (!user || !user.userId) return;
        try {
            const response = await fetch(`${API_URL}/api/admin/messages/${user.userId}`);
            const data = await response.json();
            if (response.ok) {
                setMessages(data.messages || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch admin messages:", err);
        }
    };

    // Load messages initially and set up interval polling
    useEffect(() => {
        if (user && user.userId) {
            fetchAdminMessages();
            const interval = setInterval(fetchAdminMessages, 10000); // Check every 10 seconds
            return () => clearInterval(interval);
        } else {
            setMessages([]);
            setUnreadCount(0);
        }
    }, [user]);

    // Mark messages as read when inbox opens
    const handleOpenInbox = async () => {
        setIsOpen(false);
        setShowInboxModal(true);
        if (!user || !user.userId) return;
        try {
            const response = await fetch(`${API_URL}/api/admin/messages/read/${user.userId}`, {
                method: "PUT"
            });
            if (response.ok) {
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Error marking messages as read:", err);
        }
    };

    // Don't render sidebar on Login page or if user is not authenticated
    if (location.pathname === "/" || !user) {
        return null;
    }

    const { userId, username, isAdmin } = user;

    return (
        <div className="sidebar-container">
            <button
                className={`sidebar-btn ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                style={{ position: "relative" }}
            >
                {isOpen ? "x" : ">"}
                {unreadCount > 0 && !isOpen && (
                    <span 
                        className="sidebar-btn-badge"
                        style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "var(--primary)",
                            border: "2px solid var(--bg-primary)"
                        }}
                    ></span>
                )}
            </button>

            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-links">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/tracker", { state: { userId, username, isAdmin } });
                        }}
                        className="home-link-button"
                    >
                        Home Page
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/dashboard", { state: { userId, username, isAdmin } });
                        }}
                        className="dashboard-link-button"
                    >
                        Analytics
                    </button>
                    <button
                        onClick={handleOpenInbox}
                        className="inbox-link-button"
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
                    >
                        <span>System Messages</span>
                        {unreadCount > 0 && (
                            <span 
                                className="sidebar-badge"
                                style={{
                                    background: "var(--primary)",
                                    color: "#ffffff",
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                    padding: "2px 8px",
                                    borderRadius: "10px"
                                }}
                            >
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setShowShareModal(true);
                        }}
                        className="share-link-button"
                    >
                        Share Watchlist
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/clubs", { state: { userId, username, isAdmin } });
                        }}
                        className="clubs-link-button"
                    >
                        Community Clubs
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/clubs?filter=my", { state: { userId, username, isAdmin } });
                        }}
                        className="my-clubs-link-button"
                    >
                        My Clubs
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/profile", { state: { username, isAdmin } });
                        }}
                        className="profile-link-button"
                    >
                        My Profile
                    </button>
                </div>
            </div>

            {showShareModal && (
                <div className="share-modal-backdrop">
                    <div className="share-modal-content">
                        <button onClick={() => setShowShareModal(false)} className="close-modal-button">&times;</button>
                        <ShareWatchlist userId={userId} />
                    </div>
                </div>
            )}

            {showInboxModal && (
                <div className="share-modal-backdrop">
                    <div className="share-modal-content" style={{ maxWidth: "500px" }}>
                        <button onClick={() => { setShowInboxModal(false); fetchAdminMessages(); }} className="close-modal-button">&times;</button>
                        <h2 style={{ marginBottom: "1.5rem" }}>System Inbox</h2>
                        <div className="system-messages-list" style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "5px" }}>
                            {messages.length > 0 ? (
                                messages.map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className="system-message-card" 
                                        style={{ 
                                            padding: "1rem", 
                                            borderRadius: "12px", 
                                            background: "var(--bg-secondary)", 
                                            border: "1px solid var(--glass-border)",
                                            textAlign: "left"
                                        }}
                                    >
                                        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.4" }}>
                                            {msg.message}
                                        </p>
                                        <small style={{ color: "var(--text-muted)", display: "block", marginTop: "8px", fontSize: "0.8rem" }}>
                                            Received: {new Date(msg.created_at).toLocaleString()}
                                        </small>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "var(--text-secondary)" }}>Your inbox is empty.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sidebar;
