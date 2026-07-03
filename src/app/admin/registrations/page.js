'use client';
import { useState, useEffect } from 'react';

export default function RegistrationsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/registrations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAction = async (userId, messageId, action) => {
    if (action === 'reject' && !confirm('Are you sure you want to completely delete this user registration?')) return;
    
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, messageId, action })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
  };

  return (
    <div>
      <h1 className="news-article-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pending Registrations</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Approve students after you verify their payment screenshots via WhatsApp. Approving them will automatically grant them access to their requested communities.
      </p>

      {loading ? (
        <p>Loading pending registrations...</p>
      ) : users.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <h2>All caught up!</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>No pending registrations.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map(user => {
            let requested = [];
            try { requested = JSON.parse(user.requestedCommunities || '[]'); } catch(e) {}

            return (
              <div key={user.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user.name || 'No Name'} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>({user.username})</span></h3>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '2rem' }}>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--color-text-secondary)' }}>WhatsApp:</strong> <br/>
                      {user.whatsapp || 'Not provided'}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--color-text-secondary)' }}>Requested Community IDs:</strong> <br/>
                      {requested.length > 0 ? requested.join(', ') : 'None'}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--color-text-secondary)' }}>Joined:</strong> <br/>
                      {new Date(user.joiningDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleAction(user.id, user.messageId, 'approve')} className="btn btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                    ✅ Approve
                  </button>
                  <button onClick={() => handleAction(user.id, user.messageId, 'reject')} className="btn" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
