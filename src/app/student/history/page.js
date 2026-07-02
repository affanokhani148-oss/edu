'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QuizHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch('/api/my-attempts').then(r => r.json()).then(d => {
      setAttempts(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.score / a.totalScore) * 100, 0) / totalAttempts)
    : 0;
  const best = totalAttempts > 0
    ? Math.max(...attempts.map(a => Math.round((a.score / a.totalScore) * 100)))
    : 0;

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">📊 My Quiz History</h1>
          <p className="section-subtitle">Review all your past quiz attempts and performance</p>
        </div>
        <Link href="/student/quizzes" className="btn btn-primary btn-sm">Take New Quiz →</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{totalAttempts}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{avgScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{best}%</div>
          <div className="stat-label">Best Score</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : attempts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No Quiz Attempts Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Start taking daily quizzes to track your progress!</p>
          <Link href="/student/quizzes" className="btn btn-primary">Browse Quizzes →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {attempts.map(attempt => {
            const pct = Math.round((attempt.score / attempt.totalScore) * 100);
            const color = pct >= 80 ? 'var(--accent-success)' : pct >= 50 ? 'var(--accent-gold)' : 'var(--accent-danger)';
            const isOpen = expanded === attempt.id;
            const questions = attempt.quizWithQuestions?.questions || [];
            const answers = attempt.answers || {};

            return (
              <div key={attempt.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div
                  style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  onClick={() => setExpanded(isOpen ? null : attempt.id)}
                >
                  {/* Score circle */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: `0 0 12px ${color}40`,
                  }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color }}>
                      {pct}%
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {attempt.quiz?.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {attempt.quiz?.communities?.map(c => c.name).join(', ')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        📅 {new Date(attempt.completedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '0.8rem', color }}>
                        {attempt.score}/{attempt.totalScore} correct
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                      {pct >= 80 ? '⭐ Excellent' : pct >= 50 ? '👍 Good' : '📚 Needs Work'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar" style={{ borderRadius: 0, height: '3px' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>

                {/* Expanded Review */}
                {isOpen && (
                  <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Detailed Review
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {questions.map((q, qi) => {
                        const options = JSON.parse(q.optionsJson || '[]');
                        const selected = answers[qi];
                        const isCorrect = selected === q.correctIndex;
                        const notAnswered = selected === undefined;

                        return (
                          <div key={q.id} style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            background: isCorrect ? 'rgba(16,185,129,0.06)' : notAnswered ? 'rgba(148,163,184,0.06)' : 'rgba(239,68,68,0.06)',
                            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : notAnswered ? 'var(--border-color)' : 'rgba(239,68,68,0.2)'}`,
                          }}>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                              <span>{isCorrect ? '✅' : notAnswered ? '⬜' : '❌'}</span>
                              <span>Q{qi + 1}: {q.text}</span>
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
                              {options.map((opt, oi) => (
                                <div key={oi} style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.85rem',
                                  background: oi === q.correctIndex ? 'rgba(16,185,129,0.15)' : oi === selected && !isCorrect ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                                  border: oi === q.correctIndex ? '1px solid rgba(16,185,129,0.3)' : oi === selected && !isCorrect ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                                  color: oi === q.correctIndex ? 'var(--accent-success)' : oi === selected && !isCorrect ? 'var(--accent-danger)' : 'var(--text-secondary)',
                                  fontWeight: oi === q.correctIndex ? 600 : 400,
                                }}>
                                  {String.fromCharCode(65 + oi)}. {opt}
                                  {oi === q.correctIndex ? ' ✓' : ''}
                                  {oi === selected && !isCorrect ? ' ✗' : ''}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                                💡 {q.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
