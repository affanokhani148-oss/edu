'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/articles').then(r => r.json()),
      fetch('/api/quizzes').then(r => r.json()),
      fetch('/api/students').then(r => r.json()),
      fetch('/api/attempts').then(r => r.json()),
      fetch('/api/messages').then(r => r.json()),
      fetch('/api/reviews').then(r => r.json()),
    ]).then(([a, q, s, att, m, r]) => {
      setArticles(Array.isArray(a) ? a : []);
      setQuizzes(Array.isArray(q) ? q : []);
      setStudents(Array.isArray(s) ? s : []);
      setRecentAttempts(Array.isArray(att) ? att : []);
      setMessages(Array.isArray(m) ? m : []);
      setReviews(Array.isArray(r) ? r : []);
      setLoading(false);
    });
  }, []);

  const handleReviewStatus = async (id, isApproved) => {
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved })
    });
    setReviews(reviews.map(r => r.id === id ? { ...r, isApproved } : r));
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Permanently delete this review?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    setReviews(reviews.filter(r => r.id !== id));
  };

  const expiringSoon = students.filter(s => {
    if (!s.accesses) return false;
    return s.accesses.some(a => {
      if (!a.expiresAt) return false;
      const days = Math.ceil((new Date(a.expiresAt) - Date.now()) / 86400000);
      return days >= 0 && days <= 7;
    });
  });

  // The new Message API returns users with their messages array
  const unreadMessagesCount = messages.reduce((total, user) => {
    if (!user.messages) return total;
    return total + user.messages.filter(m => m.senderRole === 'STUDENT' && !m.isRead).length;
  }, 0);

  const pendingReviews = reviews.filter(r => !r.isApproved);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Overview of your entire platform</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/articles/new" className="btn btn-success btn-sm">📝 Upload Article</Link>
          <Link href="/admin/quizzes/new" className="btn btn-primary btn-sm">❓ Create Quiz</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{loading ? '—' : students.length}</div>
            <div className="admin-stat-label">Total Students</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{loading ? '—' : quizzes.length}</div>
            <div className="admin-stat-label">Active Quizzes</div>
          </div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: unreadMessagesCount > 0 ? 'rgba(99,102,241,0.5)' : undefined }}>
          <div className="admin-stat-icon" style={{ background: unreadMessagesCount > 0 ? 'rgba(99,102,241,0.1)' : undefined, color: unreadMessagesCount > 0 ? 'var(--accent-primary)' : undefined }}>💬</div>
          <div className="admin-stat-info">
            <div className="admin-stat-value" style={{ color: unreadMessagesCount > 0 ? 'var(--accent-primary)' : undefined }}>
              {loading ? '—' : unreadMessagesCount}
            </div>
            <div className="admin-stat-label">Unread Messages</div>
          </div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: pendingReviews.length > 0 ? 'rgba(245,158,11,0.5)' : undefined }}>
          <div className="admin-stat-icon" style={{ background: pendingReviews.length > 0 ? 'rgba(245,158,11,0.1)' : undefined, color: pendingReviews.length > 0 ? 'var(--accent-warning)' : undefined }}>⭐</div>
          <div className="admin-stat-info">
            <div className="admin-stat-value" style={{ color: pendingReviews.length > 0 ? 'var(--accent-warning)' : undefined }}>
              {loading ? '—' : pendingReviews.length}
            </div>
            <div className="admin-stat-label">Pending Reviews</div>
          </div>
        </div>
      </div>

      {/* Actionable Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {expiringSoon.length > 0 && (
          <div className="alert alert-warning" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--accent-gold)' }}>
            ⚠️ <strong>{expiringSoon.length} student(s)</strong> have subscriptions expiring within 7 days. <Link href="/admin/students" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Manage Renewals</Link>
          </div>
        )}
        {unreadMessagesCount > 0 && (
          <div className="alert alert-info" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid var(--accent-primary)' }}>
            💬 You have <strong>{unreadMessagesCount} unread message(s)</strong> from students. <Link href="/admin/messages" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>View Inbox</Link>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Recent Quiz Attempts (Left Panel) */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>📊 Recent Quiz Submissions</h2>
            <Link href="/admin/students" className="btn btn-secondary btn-sm">View All &rarr;</Link>
          </div>
          {loading ? <div className="spinner" /> : recentAttempts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>No recent quiz attempts.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Quiz Title</th>
                    <th style={{ textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map(attempt => {
                    const pct = Math.round((attempt.score / attempt.totalScore) * 100);
                    let color = 'var(--accent-danger)';
                    let bg = 'rgba(239, 68, 68, 0.1)';
                    if (pct >= 80) { color = 'var(--accent-success)'; bg = 'rgba(16, 185, 129, 0.1)'; }
                    else if (pct >= 50) { color = 'var(--accent-warning)'; bg = 'rgba(245, 158, 11, 0.1)'; }
                    return (
                      <tr key={attempt.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{attempt.user?.name || attempt.user?.username}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(attempt.completedAt).toLocaleString()}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{attempt.quiz?.title}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: bg, color, fontWeight: 800, fontSize: '0.85rem' }}>
                            {pct}%
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{attempt.score}/{attempt.totalScore}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Reviews (Right Panel) */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(245,158,11,0.2)', background: 'linear-gradient(135deg, rgba(245,158,11,0.03), transparent)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>⭐ Pending Reviews</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Approve reviews to show them on the homepage.</p>
          </div>
          {loading ? <div className="spinner" /> : pendingReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🎉</span>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No pending reviews. You are all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingReviews.map(r => (
                <div key={r.id} style={{ padding: '1.25rem', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</span>
                    </div>
                    <span style={{ color: 'var(--accent-warning)', letterSpacing: '2px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', fontStyle: 'italic', lineHeight: 1.6 }}>&quot;{r.content}&quot;</p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => handleReviewStatus(r.id, true)} className="btn btn-success btn-sm" style={{ flex: 1 }}>✓ Approve</button>
                    <button onClick={() => handleDeleteReview(r.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-danger)' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
