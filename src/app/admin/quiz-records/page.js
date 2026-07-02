'use client';
import { useState, useEffect } from 'react';

export default function AdminQuizRecords() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/quizzes').then(r => r.json()).then(d => setQuizzes(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!selectedQuiz) {
      setAttempts([]);
      return;
    }
    setLoading(true);
    fetch(`/api/attempts?quizId=${selectedQuiz}`)
      .then(r => r.json())
      .then(d => {
        setAttempts(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedQuiz]);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">📊 Quiz Records</h1>
          <p className="section-subtitle">Track and analyze all student attempts for any specific quiz.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Select Quiz to View Records:</label>
          <select 
            className="form-select" 
            value={selectedQuiz} 
            onChange={e => setSelectedQuiz(e.target.value)} 
            style={{ maxWidth: '400px' }}
          >
            <option value="">-- Choose a Quiz --</option>
            {quizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title} ({q.questions?.length || 0} Questions)</option>
            ))}
          </select>
        </div>
      </div>

      {selectedQuiz && (
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Student Performance Records
          </h2>
          
          {loading ? (
            <div className="spinner"></div>
          ) : attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No attempts recorded for this quiz yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Username / Email</th>
                    <th>Phone</th>
                    <th style={{ textAlign: 'right' }}>Score</th>
                    <th style={{ textAlign: 'right' }}>Date Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let currentRank = 1;
                    let currentScore = -1;
                    return attempts.map((att, index) => {
                      if (currentScore === -1) {
                        currentScore = att.score;
                      } else if (att.score < currentScore) {
                        currentRank++;
                        currentScore = att.score;
                      }
                      
                      const pct = Math.round((att.score / att.totalScore) * 100);
                      let color = 'var(--danger)';
                      let bg = 'rgba(239, 68, 68, 0.1)';
                      if (pct >= 80) { color = 'var(--success)'; bg = 'rgba(34, 197, 94, 0.1)'; }
                      else if (pct >= 50) { color = 'var(--warning)'; bg = 'rgba(245, 158, 11, 0.1)'; }

                      return (
                        <tr key={att.id}>
                          <td style={{ fontWeight: 800, color: currentRank <= 3 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                            #{currentRank}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {att.user?.name || '—'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {att.user?.username}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {att.user?.phone || '—'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: bg, color, fontWeight: 800, fontSize: '0.85rem' }}>
                              {pct}%
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{att.score}/{att.totalScore}</div>
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {new Date(att.completedAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
