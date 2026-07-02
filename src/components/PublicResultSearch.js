'use client';
import { useState } from 'react';

export default function PublicResultSearch({ activeQuizzes }) {
  const [quizId, setQuizId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!quizId || !studentName) return;

    setLoading(true);
    setHasSearched(false);
    setError('');

    try {
      const res = await fetch(`/api/public-results?quizId=${quizId}&studentName=${encodeURIComponent(studentName)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', background: 'var(--bg-secondary)' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>🔍 Search Student Results</h3>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="form-label">Select Quiz</label>
          <select 
            className="form-input" 
            value={quizId} 
            onChange={(e) => setQuizId(e.target.value)} 
            required
          >
            <option value="" disabled>Choose a published quiz...</option>
            {activeQuizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Student Name / Username</label>
          <input 
            type="text" 
            className="form-input" 
            value={studentName} 
            onChange={(e) => setStudentName(e.target.value)} 
            placeholder="Enter name to search" 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Searching...' : 'Search Results'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--accent-danger)', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}

      {hasSearched && !loading && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Search Results:</h4>
          {results.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No results found for "{studentName}".</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {results.map((attempt, index) => {
                const pct = Math.round((attempt.score / attempt.totalScore) * 100);
                const color = pct >= 80 ? 'var(--accent-success)' : pct >= 50 ? 'var(--accent-gold)' : 'var(--accent-danger)';
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ display: 'block' }}>{attempt.user?.name || attempt.user?.username}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color, fontSize: '1.1rem', display: 'block' }}>{pct}%</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{attempt.score}/{attempt.totalScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
