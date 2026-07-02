'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewQuiz() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', communityIds: [],
    timeLimit: '', activeFrom: '', activeTo: '',
    questions: [
      { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    ]
  });

  useEffect(() => {
    fetch('/api/communities').then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : [];
      setCommunities(list);
    });
  }, []);

  const handleAddQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]
    }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newQs = [...form.questions];
    newQs[qIndex][field] = value;
    setForm({ ...form, questions: newQs });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQs = [...form.questions];
    newQs[qIndex].options[oIndex] = value;
    setForm({ ...form, questions: newQs });
  };

  const handleRemoveQuestion = (qIndex) => {
    const newQs = form.questions.filter((_, i) => i !== qIndex);
    setForm({ ...form, questions: newQs });
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      const parsedQuestions = [];
      // Skip header if first line looks like header
      const startIdx = lines[0].toLowerCase().includes('question') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        // Simple CSV parse handling quotes
        const regex = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]+))/g;
        let match;
        const row = [];
        while ((match = regex.exec(lines[i])) !== null) {
          let val = match[1] || match[2] || '';
          val = val.replace(/\"\"/g, '\"'); // unescape quotes
          row.push(val.trim());
        }

        if (row.length >= 6) {
          parsedQuestions.push({
            text: row[0],
            options: [row[1], row[2], row[3], row[4]],
            correctIndex: parseInt(row[5]) || 0,
            explanation: row[6] || '',
          });
        }
      }

      if (parsedQuestions.length > 0) {
        setForm(prev => ({ ...prev, questions: parsedQuestions }));
        alert(`Successfully loaded ${parsedQuestions.length} questions from CSV!`);
      } else {
        alert('Could not parse CSV. Please ensure format is: Question, Opt1, Opt2, Opt3, Opt4, CorrectIndex(0-3), Explanation');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      router.push('/admin/quizzes');
    } else {
      alert('Failed to create quiz');
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">Create New Quiz</h1>
          <p className="section-subtitle">Add questions manually or upload a CSV file</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Settings Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Quiz Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Quiz Title *</label>
              <input required className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Daily Current Affairs - 26 June" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Assign Communities *</label>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                {communities.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={form.communityIds.includes(c.id)}
                      onChange={(e) => {
                        const ids = new Set(form.communityIds);
                        if (e.target.checked) ids.add(c.id);
                        else ids.delete(c.id);
                        setForm({...form, communityIds: Array.from(ids)});
                      }}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description (Optional)</label>
              <input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief instructions for students..." />
            </div>

            <div className="form-group">
              <label className="form-label">Time Limit (Minutes)</label>
              <input type="number" min="1" className="form-input" value={form.timeLimit} onChange={e => setForm({...form, timeLimit: e.target.value})} placeholder="e.g. 15 (Leave empty for no limit)" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Quiz will auto-submit when time is up.</p>
            </div>

            <div></div>

            <div className="form-group">
              <label className="form-label">Active From (Schedule)</label>
              <input type="datetime-local" className="form-input" value={form.activeFrom} onChange={e => setForm({...form, activeFrom: e.target.value})} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Leave empty to activate immediately.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Active Until (Disappear)</label>
              <input type="datetime-local" className="form-input" value={form.activeTo} onChange={e => setForm({...form, activeTo: e.target.value})} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Leave empty to never disappear.</p>
            </div>
          </div>
        </div>

        {/* CSV Upload Card */}
        <div className="card" style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.05), rgba(6,182,212,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Bulk Upload MCQs (CSV)</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Format: <code>Question, OptionA, OptionB, OptionC, OptionD, CorrectIndex(0-3), Explanation</code>
              </p>
            </div>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              📁 Choose CSV File
              <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Questions Area */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Questions ({form.questions.length})</h2>
            <button type="button" onClick={handleAddQuestion} className="btn btn-secondary btn-sm">+ Add Question</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {form.questions.map((q, qIndex) => (
              <div key={qIndex} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <label className="form-label" style={{ margin: 0, color: 'var(--accent-primary)' }}>Question {qIndex + 1}</label>
                  {form.questions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Remove
                    </button>
                  )}
                </div>

                <textarea required className="form-textarea" value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} rows={2} style={{ minHeight: '60px', marginBottom: '1rem' }} placeholder="Enter question text..." />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="radio" 
                        name={`correct-${qIndex}`} 
                        checked={q.correctIndex === oIndex} 
                        onChange={() => handleQuestionChange(qIndex, 'correctIndex', oIndex)} 
                        style={{ accentColor: 'var(--accent-success)', width: '18px', height: '18px', cursor: 'pointer' }}
                        title="Mark as correct answer"
                      />
                      <input required className="form-input" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIndex)}`} style={{ flex: 1, borderColor: q.correctIndex === oIndex ? 'var(--accent-success)' : 'var(--border-color)' }} />
                    </div>
                  ))}
                </div>

                <div>
                  <input className="form-input" value={q.explanation} onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)} placeholder="Explanation (Optional) - Why is this correct?" style={{ fontSize: '0.85rem' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
            {saving ? '⏳ Saving Quiz...' : '✅ Publish Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
