'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentReview() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', rating: 5, content: '' });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      alert('Failed to submit review');
    }
    setSaving(false);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Thank You!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Your review has been submitted successfully and will appear on the homepage once approved by an admin.
        </p>
        <button onClick={() => router.push('/student')} className="btn btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div>
          <h1 className="section-title">⭐ Write a Review</h1>
          <p className="section-subtitle">Share your experience with EduPro</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Your Name (as it will appear publicly)</label>
          <input 
            required 
            className="form-input" 
            placeholder="e.g. Ali Khan (CSS 2024 Aspirant)" 
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Rating</label>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '2rem', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                onClick={() => setForm({...form, rating: star})}
                style={{ color: star <= form.rating ? 'var(--accent-gold)' : 'var(--border-color)', transition: 'color 0.2s' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Your Experience</label>
          <textarea 
            required 
            className="form-textarea" 
            rows="5"
            placeholder="Tell us how the daily editorials, essays, and quizzes have helped your preparation..."
            value={form.content}
            onChange={e => setForm({...form, content: e.target.value})}
          />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary btn-block" style={{ padding: '1rem', fontSize: '1.1rem' }}>
          {saving ? '⏳ Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
