'use client';
import { useState, useEffect } from 'react';

export default function AdminLeaderboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboards, setLeaderboards] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/quizzes').then(r => r.json()).then(d => setQuizzes(Array.isArray(d) ? d : []));
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = () => {
    fetch('/api/leaderboard').then(r => r.json()).then(d => setLeaderboards(Array.isArray(d) ? d : []));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;
    setLoading(true);

    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: selectedQuiz, isPublished: true })
    });

    if (res.ok) {
      alert('✅ Leaderboard published to homepage successfully!');
      fetchLeaderboards();
    } else {
      alert('❌ Failed to publish leaderboard');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">🏆 Daily Leaderboards</h1>
          <p className="section-subtitle">Publish the top 3 students of any quiz to the public homepage</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Publish form */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Publish New Leaderboard</h2>
          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Quiz</label>
              <select className="form-select" value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)} required>
                <option value="">-- Choose Quiz --</option>
                {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            </div>
            
            <div style={{ background: 'rgba(99,102,241,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                💡 <strong>Note:</strong> This will calculate the top 3 highest scores for the selected quiz and publish them immediately to the public homepage.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? '⏳ Publishing...' : '📢 Publish Top 3 to Homepage'}
            </button>
          </form>
        </div>

        {/* Currently Published Leaderboards */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Live Public Leaderboards</h2>
          
          {leaderboards.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No leaderboards currently published on homepage.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaderboards.map(lb => {
                const top3 = JSON.parse(lb.topJson || '[]');
                return (
                  <div key={lb.id} style={{ border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'linear-gradient(to right, rgba(99,102,241,0.05), transparent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{lb.quiz?.title}</h3>
                      <span className="badge badge-success">Live on Homepage</span>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {top3.map((student, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                            <span style={{ fontWeight: 700 }}>{student.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{student.score}/{student.totalScore}</span>
                            <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{student.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
