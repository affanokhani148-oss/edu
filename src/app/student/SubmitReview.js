'use client';
import { useState } from 'react';

export default function SubmitReview() {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student', rating, content }) // Name could be fetched from session but API ignores it if userId is present
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(46,160,67,0.1)', border: '1px solid var(--accent-success)' }}>
        <h3 style={{ color: 'var(--accent-success)' }}>Thank you for your feedback!</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Your review has been sent to the admin for approval.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>⭐ Write a Review</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="form-label">Rating</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(num => (
              <button 
                key={num} 
                type="button" 
                onClick={() => setRating(num)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer', 
                  color: num <= rating ? 'var(--accent-gold)' : 'var(--text-muted)',
                  transition: 'color 0.2s'
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <textarea 
          required 
          className="form-textarea" 
          placeholder="What do you think about the course materials and platform?" 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          rows={3} 
        />
        <button type="submit" disabled={loading || !content.trim()} className="btn btn-primary btn-sm">
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
