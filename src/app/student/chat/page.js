'use client';
import { useState, useEffect, useRef } from 'react';

export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('/api/messages').then(r => r.json()).then(data => {
      setMessages(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const sendMessage = async (content, imageUrl = null) => {
    if (!content?.trim() && !imageUrl) return;

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, imageUrl })
    });

    if (res.ok) {
      const { message } = await res.json();
      setMessages([...messages, message]);
      setText('');
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Chat Header */}
      <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
          A
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Admin Support</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)' }}>● Online</span>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.map(msg => {
          const isStudent = msg.senderRole === 'STUDENT';
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isStudent ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                background: isStudent ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
                borderTopRightRadius: isStudent ? '0.2rem' : '1rem',
                borderTopLeftRadius: !isStudent ? '0.2rem' : '1rem',
              }}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '0.5rem', marginBottom: msg.content ? '0.75rem' : 0 }} />
                )}
                {msg.content && <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.content}</div>}
                <div style={{ fontSize: '0.7rem', color: isStudent ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', textAlign: 'right', marginTop: '0.4rem' }}>
                  {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>No messages yet.</p>
            <p style={{ fontSize: '0.85rem' }}>Send a message to admin if you need help.</p>
          </div>
        )}
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
          value={text} 
          onChange={e => setText(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && sendMessage(text)}
          placeholder="Type a message..." 
          className="form-input" 
          style={{ flex: 1, borderRadius: '2rem', padding: '0.75rem 1.25rem' }} 
        />
        <button 
          onClick={() => sendMessage(text)} 
          className="btn btn-primary" 
          style={{ borderRadius: '2rem', padding: '0.75rem 1.5rem' }}
          disabled={!text.trim() && !uploading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
