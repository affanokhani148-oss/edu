'use client';
import { useState, useEffect, useRef } from 'react';

export default function AdminChat() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('/api/messages').then(r => r.json()).then(data => {
      // API returns an array of Users with their embedded messages array
      setUsers(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeUser) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        await sendMessage(null, data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (text, imageUrl = null) => {
    if ((!text?.trim() && !imageUrl) || !activeUser) return;

    const newMsg = {
      userId: activeUser.id,
      content: text,
      imageUrl: imageUrl,
      senderRole: 'ADMIN'
    };

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });

    if (res.ok) {
      const { message } = await res.json();
      
      // Update local state
      const updatedUsers = users.map(u => {
        if (u.id === activeUser.id) {
          const updatedMessages = [...u.messages, message];
          return { ...u, messages: updatedMessages };
        }
        return u;
      });
      setUsers(updatedUsers);
      setActiveUser(updatedUsers.find(u => u.id === activeUser.id));
      setReplyText('');
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
      {/* LEFT PANE - User List */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Chats</h2>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {users.map(u => {
            const lastMsg = u.messages[u.messages.length - 1];
            const unread = u.messages.some(m => m.senderRole === 'STUDENT' && !m.isRead); // Simplified logic
            const isActive = activeUser?.id === u.id;

            return (
              <div 
                key={u.id}
                onClick={() => setActiveUser(u)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-secondary)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                  display: 'flex', gap: '0.75rem', alignItems: 'center'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                  {(u.name || u.username).charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.name || u.username}</span>
                    {lastMsg && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(lastMsg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: unread ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: unread ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lastMsg?.imageUrl ? '📷 Image' : lastMsg?.content}
                  </div>
                </div>
              </div>
            );
          })}
          {users.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No conversations yet.</div>}
        </div>
      </div>

      {/* RIGHT PANE - Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                {(activeUser.name || activeUser.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{activeUser.name || activeUser.username}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Student</span>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeUser.messages.map(msg => {
                const isAdmin = msg.senderRole === 'ADMIN';
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      background: isAdmin ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-md)',
                      position: 'relative',
                      borderTopRightRadius: isAdmin ? '0.2rem' : '1rem',
                      borderTopLeftRadius: !isAdmin ? '0.2rem' : '1rem',
                    }}>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '0.5rem', marginBottom: msg.content ? '0.75rem' : 0 }} />
                      )}
                      {msg.content && <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.content}</div>}
                      <div style={{ fontSize: '0.7rem', color: isAdmin ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', textAlign: 'right', marginTop: '0.4rem' }}>
                        {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div style={{ padding: '1rem', background: 'var(--bg-primary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-secondary" 
                style={{ padding: '0.75rem', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                disabled={uploading}
              >
                {uploading ? '⏳' : '📷'}
              </button>
              <input 
                type="text" 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendMessage(replyText)}
                placeholder="Type a message..." 
                className="form-input" 
                style={{ flex: 1, borderRadius: '2rem', padding: '0.75rem 1.25rem' }} 
              />
              <button 
                onClick={() => sendMessage(replyText)} 
                className="btn btn-primary" 
                style={{ borderRadius: '2rem', padding: '0.75rem 1.5rem' }}
                disabled={!replyText.trim() && !uploading}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ fontSize: '1.2rem' }}>EduPro Web</h3>
              <p>Select a student to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
