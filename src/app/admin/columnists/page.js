'use client';
import { useState, useEffect } from 'react';

export default function ColumnistsPage() {
  const [columnists, setColumnists] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchColumnists();
  }, []);

  const fetchColumnists = async () => {
    try {
      const res = await fetch('/api/admin/columnists');
      if (res.ok) {
        const data = await res.json();
        setColumnists(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    try {
      const res = await fetch('/api/admin/columnists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password, name })
      });
      if (res.ok) {
        setStatus('Columnist account created successfully.');
        setNewUsername('');
        setPassword('');
        setName('');
        fetchColumnists();
      } else {
        const err = await res.json();
        setStatus(err.error || 'Failed to create account.');
      }
    } catch (e) {
      setStatus('An error occurred.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Manage Columnists</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Create Form */}
        <div style={{ background: 'var(--color-card)', border: '2px solid var(--color-border)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Create Columnist Account</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Display Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="form-input" 
                placeholder="e.g. John Doe"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Username (for login)</label>
              <input 
                type="text" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                required 
                className="form-input" 
                placeholder="e.g. johndoe"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="form-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Columnist</button>
            {status && <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{status}</p>}
          </form>
        </div>

        {/* Existing Columnists */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Active Columnists</h3>
          {columnists.length === 0 ? (
            <p>No columnists found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {columnists.map(c => (
                <div key={c.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border-light)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img 
                      src={c.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.name || c.username) + '&background=random'} 
                      alt="avatar" 
                      style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                    />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{c.name || 'No Name Set'}</p>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>@{c.username}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    <p>Joined: {new Date(c.joiningDate).toLocaleDateString()}</p>
                    <p style={{ color: 'var(--color-primary)' }}>Articles Written: {c.articles?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
