'use client';
import { useState, useEffect } from 'react';

const ACCESS_DURATIONS = [
  { label: '30 Days', days: 30 },
  { label: '60 Days', days: 60 },
  { label: '90 Days', days: 90 },
  { label: '1 Year', days: 365 },
  { label: 'Custom Date', days: null },
];

const CONTENT_ACCESS = [
  { label: 'All Past Content', value: 'all' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 60 Days', value: '60' },
  { label: 'Last 90 Days', value: '90' },
  { label: 'From Joining Date', value: 'joining' },
];

function daysRemaining(expiresAt) {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt) - Date.now()) / 86400000);
}

export default function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [communityAccess, setCommunityAccess] = useState([]);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [form, setForm] = useState({
    name: '', username: '', password: '', phone: '',
  });

  useEffect(() => {
    fetch('/api/students').then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
    fetch('/api/communities').then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : [];
      setCommunities(list);
      setCommunityAccess(list.map(c => ({
        communityId: c.id,
        enabled: false,
        durationKey: '30',
        customDate: '',
        contentAccess: 'all',
      })));
    });
  }, []);

  const toggleCommunity = (idx) => {
    setCommunityAccess(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], enabled: !next[idx].enabled };
      return next;
    });
  };

  const updateCommunityField = (idx, field, value) => {
    setCommunityAccess(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const getExpiresAt = (access) => {
    const dur = ACCESS_DURATIONS.find(d => String(d.days) === access.durationKey);
    if (!dur) {
      if (access.customDate) return access.customDate;
      return null;
    }
    if (dur.days === null) return access.customDate || null;
    const d = new Date();
    d.setDate(d.getDate() + dur.days);
    return d.toISOString();
  };

  const getAccessFrom = (access) => {
    if (access.contentAccess === 'all') return null;
    if (access.contentAccess === 'joining') return new Date().toISOString();
    const d = new Date();
    d.setDate(d.getDate() - parseInt(access.contentAccess));
    return d.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const selectedAccesses = communityAccess
      .filter(a => a.enabled)
      .map(a => ({
        communityId: a.communityId,
        expiresAt: getExpiresAt(a),
        accessFrom: getAccessFrom(a),
      }));

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, communityAccesses: selectedAccesses }),
    });

    if (res.ok) {
      setMessage('✅ Student account created successfully!');
      setShowForm(false);
      setForm({ name: '', username: '', password: '', phone: '' });
      fetch('/api/students').then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
    } else {
      const err = await res.json();
      setMessage('❌ Error: ' + (err.error || 'Failed to create student'));
    }
    setSaving(false);
  };

  const handleRenew = async (studentId, accessId, days) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    await fetch(`/api/students/${studentId}/manage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessId, expiresAt: expiresAt.toISOString() }),
    });
    fetch('/api/students').then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Delete this student account permanently?')) return;
    await fetch(`/api/students/${id}/manage`, { method: 'DELETE' });
    setStudents(students.filter(s => s.id !== id));
  };

  const handleViewRecord = async (id) => {
    const res = await fetch(`/api/students/${id}`);
    if (res.ok) {
      setViewingRecord(await res.json());
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Student Management</h1>
          <p className="section-subtitle">Add students after Easypaisa payment verification</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          {showForm ? '✕ Cancel' : '+ Add New Student'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {message}
        </div>
      )}

      {/* ADD STUDENT FORM */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Create New Student Account
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Student Full Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone / Easypaisa Number</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Login Username) *</label>
                <input type="email" className="form-input" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="student@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Set a secure password" />
              </div>
            </div>

            {/* Community Access */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label" style={{ marginBottom: '1rem' }}>Community Access & Subscription Duration</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {communities.map((c, idx) => (
                  <div key={c.id} style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${communityAccess[idx]?.enabled ? 'rgba(99,102,241,0.4)' : 'var(--border-color)'}`,
                    background: communityAccess[idx]?.enabled ? 'rgba(99,102,241,0.05)' : 'transparent',
                    transition: 'all 0.2s',
                  }}>
                    <label className="form-checkbox" style={{ marginBottom: communityAccess[idx]?.enabled ? '1rem' : 0 }}>
                      <input type="checkbox" checked={communityAccess[idx]?.enabled || false} onChange={() => toggleCommunity(idx)} />
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</span>
                    </label>

                    {communityAccess[idx]?.enabled && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label">Subscription Duration</label>
                          <select
                            className="form-select"
                            value={communityAccess[idx].durationKey}
                            onChange={e => updateCommunityField(idx, 'durationKey', e.target.value)}
                          >
                            {ACCESS_DURATIONS.map(d => (
                              <option key={d.label} value={d.days === null ? 'custom' : String(d.days)}>{d.label}</option>
                            ))}
                          </select>
                        </div>

                        {communityAccess[idx].durationKey === 'custom' && (
                          <div className="form-group">
                            <label className="form-label">Expiry Date</label>
                            <input type="date" className="form-input" value={communityAccess[idx].customDate} onChange={e => updateCommunityField(idx, 'customDate', e.target.value)} />
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label">Past Content Access</label>
                          <select
                            className="form-select"
                            value={communityAccess[idx].contentAccess}
                            onChange={e => updateCommunityField(idx, 'contentAccess', e.target.value)}
                          >
                            {CONTENT_ACCESS.map(ca => (
                              <option key={ca.value} value={ca.value}>{ca.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} className="btn btn-success">
                {saving ? '⏳ Creating...' : '✅ Create Student Account'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STUDENTS TABLE */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Enrolled Students ({students.length})
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Phone</th>
                <th>Communities & Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name || s.username}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.username}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{s.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {s.accesses?.map(a => {
                        const days = daysRemaining(a.expiresAt);
                        const isExpired = days !== null && days < 0;
                        const isWarning = days !== null && days >= 0 && days <= 7;
                        return (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className={`badge ${isExpired ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}`}>
                              {isExpired ? '🔒' : '✅'} {a.community?.name}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {days === null ? 'No expiry' : isExpired ? 'Expired' : `${days}d left`}
                            </span>
                            <button
                              onClick={() => handleRenew(s.id, a.id, 30)}
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                              +30d
                            </button>
                            <button
                              onClick={() => handleRenew(s.id, a.id, 90)}
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                            >
                              +90d
                            </button>
                          </div>
                        );
                      })}
                      {(!s.accesses || s.accesses.length === 0) && (
                        <span className="badge badge-default">No communities</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      <button onClick={() => handleViewRecord(s.id)} className="btn btn-secondary btn-sm">View Record</button>
                      <button onClick={() => handleDeleteStudent(s.id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No students yet. Add your first student above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW RECORD MODAL */}
      {viewingRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setViewingRecord(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Student Record: {viewingRecord.name || viewingRecord.username}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact Info</p>
                <p><strong>Email:</strong> {viewingRecord.username}</p>
                <p><strong>Phone:</strong> {viewingRecord.phone || 'N/A'}</p>
                <p><strong>Joined:</strong> {new Date(viewingRecord.joiningDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Quiz Performance</p>
                <p><strong>Total Attempts:</strong> {viewingRecord.attempts?.length || 0}</p>
                <p><strong>Average Score:</strong> {viewingRecord.attempts?.length > 0 ? Math.round(viewingRecord.attempts.reduce((acc, curr) => acc + (curr.score / curr.totalScore), 0) / viewingRecord.attempts.length * 100) : 0}%</p>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Detailed Quiz History</h3>
            {viewingRecord.attempts?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No quiz attempts yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {viewingRecord.attempts?.map(attempt => {
                  const pct = Math.round((attempt.score / attempt.totalScore) * 100);
                  const color = pct >= 80 ? 'var(--accent-success)' : pct >= 50 ? 'var(--accent-gold)' : 'var(--accent-danger)';
                  return (
                    <div key={attempt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ fontWeight: 600 }}>{attempt.quiz?.title}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(attempt.completedAt).toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, color }}>{pct}%</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {attempt.score}/{attempt.totalScore} 
                          {attempt.timeTaken ? ` (${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s)` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
