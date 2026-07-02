'use client';
import { useState, useEffect } from 'react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    fetch('/api/reviews').then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : []));
  };

  const handleToggleApprove = async (id, isApproved) => {
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: !isApproved })
    });
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    fetchReviews();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">⭐ Manage Reviews</h1>
          <p className="section-subtitle">Approve or reject student testimonials for the public homepage</p>
        </div>
      </div>

      <div className="card">
        {reviews.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No reviews found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ 
                border: `1px solid ${review.isApproved ? 'var(--accent-success)' : 'var(--border-color)'}`,
                padding: '1.5rem', 
                borderRadius: 'var(--radius-md)', 
                background: review.isApproved ? 'rgba(16,185,129,0.05)' : 'var(--bg-primary)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: 700 }}>{review.name}</h3>
                  <div style={{ color: 'var(--accent-gold)' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  "{review.content}"
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button 
                    onClick={() => handleToggleApprove(review.id, review.isApproved)} 
                    className={`btn btn-sm ${review.isApproved ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ flex: 1 }}
                  >
                    {review.isApproved ? 'Hide from Public' : '✅ Approve for Public'}
                  </button>
                  <button onClick={() => handleDelete(review.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
