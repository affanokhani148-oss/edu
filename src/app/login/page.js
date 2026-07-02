'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.role === 'ADMIN') router.push('/admin');
      else if (data.role === 'COLUMNIST') router.push('/columnist');
      else router.push('/student');
    } else {
      const data = await res.json();
      setError(data.error || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            EduPro Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Access your Student or Admin Dashboard
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Email / Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>👤</span>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)' }}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your@email.com or admin"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔒</span>
                <input
                  type="password"
                  className="form-input"
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', boxSizing: 'border-box', borderRadius: 'var(--radius-md)' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem', borderRadius: 'var(--radius-md)', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '1.5rem 0' }} />

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <p>Don&apos;t have an account? Contact admin after Easypaisa payment.</p>
            <p style={{ marginTop: '0.4rem' }}>
              💳 <strong style={{ color: 'var(--text-primary)' }}>0333985267</strong> — Syed Azam Shah
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
