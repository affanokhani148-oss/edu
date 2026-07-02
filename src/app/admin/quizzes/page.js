'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch('/api/quizzes').then(r => r.json()).then(setQuizzes);
  }, []);

  const togglePublishResult = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    const res = await fetch(`/api/quizzes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isResultPublished: updatedStatus })
    });
    if (res.ok) {
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, isResultPublished: updatedStatus } : q));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Quiz Management</h1>
        <Link href="/admin/quizzes/new" style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--success)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 'bold' }}>
          + Create New Quiz
        </Link>
      </div>

      <div className="card">
        <h2>All Quizzes</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
              <th>Title</th>
              <th>Community</th>
              <th>Questions Count</th>
              <th>Date Created</th>
              <th>Public Results</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(q => (
              <tr key={q.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.8rem' }}>{q.title}</td>
                <td style={{ padding: '0.8rem' }}>{q.communities?.map(c => c.name).join(', ')}</td>
                <td style={{ padding: '0.8rem' }}>{q.questions?.length}</td>
                <td style={{ padding: '0.8rem' }}>{new Date(q.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.8rem' }}>
                  <button 
                    onClick={() => togglePublishResult(q.id, q.isResultPublished)}
                    className={`btn btn-sm ${q.isResultPublished ? 'btn-success' : 'btn-secondary'}`}
                  >
                    {q.isResultPublished ? 'Published' : 'Hidden'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
