'use client';
import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizAttempt({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Anti-Cheating Keydown Event (Block Print, Save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        alert('Printing and saving are disabled for this quiz.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetch(`/api/quizzes/${resolvedParams.id}`).then(r => r.json()).then(data => {
      setQuiz(data);
      if (data.timeLimit && !result) {
        setTimeLeft(data.timeLimit * 60); // minutes to seconds
      }
    });
  }, [resolvedParams.id, result]);

  useEffect(() => {
    if (timeLeft === null || result || submitting) return;
    
    if (timeLeft <= 0) {
      // Auto submit
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, submitting]);

  const handleOptionSelect = (qIndex, oIndex) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const handleAutoSubmit = async () => {
    setSubmitting(true);
    await submitQuizData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await submitQuizData();
  };

  const submitQuizData = async () => {
    if (!quiz) return;
    const res = await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: quiz.id, answers, timeTaken: quiz.timeLimit ? (quiz.timeLimit * 60) - timeLeft : null })
    });
    
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
    setSubmitting(false);
  };

  if (!quiz) return <div className="spinner" style={{ margin: '4rem auto' }} />;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      style={{ maxWidth: '800px', margin: '0 auto', userSelect: 'none', WebkitUserSelect: 'none' }}
      onCopy={e => e.preventDefault()}
      onCut={e => e.preventDefault()}
      onContextMenu={e => e.preventDefault()}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { display: none !important; }
        }
      `}} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{quiz.title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{quiz.description}</p>
        </div>
        
        {timeLeft !== null && !result && (
          <div style={{
            background: timeLeft <= 60 ? 'rgba(239,68,68,0.1)' : 'var(--primary-color)',
            border: `1px solid ${timeLeft <= 60 ? 'var(--accent-danger)' : 'var(--border-color)'}`,
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            position: 'sticky',
            top: '20px',
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: '120px'
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: timeLeft <= 60 ? 'var(--accent-danger)' : 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Time Left
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: timeLeft <= 60 ? 'var(--accent-danger)' : 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </p>
          </div>
        )}
      </div>

      {result && (
        <div className="card" style={{ backgroundColor: 'rgba(99,102,241,0.05)', marginBottom: '2rem', border: '1px solid var(--accent-primary)', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Quiz Completed!</h2>
          <p style={{ fontSize: '1.2rem' }}>
            Your Score: <strong style={{ fontSize: '1.8rem', marginLeft: '0.5rem' }}>{result.score} / {result.totalScore}</strong>
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {Math.round((result.score / result.totalScore) * 100)}% Accuracy
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((q, qIndex) => {
          const options = JSON.parse(q.optionsJson);
          const isCorrect = result && result.answersJson[qIndex] === q.correctIndex;
          const isWrong = result && result.answersJson[qIndex] !== q.correctIndex && result.answersJson[qIndex] !== undefined;

          return (
            <div key={q.id} className="card" style={{ marginBottom: '1.5rem', border: result ? (isCorrect ? '1px solid var(--accent-success)' : '1px solid rgba(239,68,68,0.4)') : '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>{qIndex + 1}.</span> 
                {q.text}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {options.map((opt, oIndex) => {
                  let bgColor = 'rgba(255,255,255,0.02)';
                  let borderColor = 'var(--border-color)';
                  
                  if (result) {
                    if (oIndex === q.correctIndex) {
                      bgColor = 'rgba(46, 160, 67, 0.15)';
                      borderColor = 'var(--accent-success)';
                    } else if (oIndex === answers[qIndex]) {
                      bgColor = 'rgba(239,68,68,0.1)';
                      borderColor = 'var(--accent-danger)';
                    }
                  } else if (answers[qIndex] === oIndex) {
                    borderColor = 'var(--accent-primary)';
                    bgColor = 'rgba(99,102,241,0.05)';
                  }

                  return (
                    <label key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)', cursor: result ? 'default' : 'pointer', backgroundColor: bgColor, transition: 'all 0.2s' }}>
                      <input 
                        type="radio" 
                        name={`question-${qIndex}`} 
                        checked={answers[qIndex] === oIndex} 
                        onChange={() => handleOptionSelect(qIndex, oIndex)}
                        disabled={!!result || submitting}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>{opt}</span>
                    </label>
                  );
                })}
              </div>
              {result && q.explanation && (
                <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', backgroundColor: 'var(--primary-color)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-gold)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Explanation:</strong> 
                  <span style={{ color: 'var(--text-secondary)' }}>{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}

        {!result ? (
          <button type="submit" disabled={submitting} className="btn btn-primary btn-block" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            {submitting ? '⏳ Submitting Quiz...' : '✅ Submit Quiz'}
          </button>
        ) : (
          <button type="button" onClick={() => router.push('/student')} className="btn btn-secondary btn-block" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            Return to Dashboard
          </button>
        )}
      </form>
    </div>
  );
}
