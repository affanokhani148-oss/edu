'use client';
import { useState, useEffect } from 'react';

export default function ApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/admin/approvals');
      if (res.ok) {
        const data = await res.json();
        setPending(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (articleId, action) => {
    setStatus('Processing...');
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, action })
      });
      if (res.ok) {
        setStatus(`Article ${action} successfully.`);
        fetchPending();
      } else {
        setStatus('Error processing article.');
      }
    } catch (error) {
      setStatus('An error occurred.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Columnist Approvals</h2>
      {status && <p style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 700 }}>{status}</p>}
      
      {pending.length === 0 ? (
        <p>No articles pending approval.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pending.map(article => (
            <div key={article.id} style={{ background: 'var(--color-card)', border: '2px solid var(--color-border)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{article.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    By {article.author?.name || article.author?.username} on {new Date(article.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleAction(article.id, 'approve')} className="btn btn-primary" style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}>Approve & Publish</button>
                  <button onClick={() => handleAction(article.id, 'reject')} className="btn btn-primary" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Reject / Delete</button>
                </div>
              </div>
              <div style={{ background: 'var(--color-background)', padding: '1rem', border: '1px solid var(--color-border-light)', fontSize: '0.95rem' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Description:</p>
                <p style={{ marginBottom: '1rem' }}>{article.description}</p>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Content:</p>
                <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
