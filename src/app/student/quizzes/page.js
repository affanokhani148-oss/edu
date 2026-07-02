'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetch('/api/quizzes').then(r => r.json()).then(setQuizzes);
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Available Quizzes</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {quizzes.map(q => (
          <div key={q.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase' }}>{q.communities?.map(c => c.name).join(', ')}</span>
            <h3 style={{ margin: '0.5rem 0' }}>{q.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flexGrow: 1 }}>{q.description}</p>
            <Link href={`/student/quizzes/${q.id}`} style={{ padding: '0.8rem', backgroundColor: 'var(--accent-color)', color: '#fff', textAlign: 'center', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 'bold' }}>
              Attempt Quiz ({q.questions?.length} MCQs)
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
