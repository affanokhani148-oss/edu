'use client';
import { useState, useEffect } from 'react';
import ImageUploader from '../../../components/ImageUploader';

export default function ColumnistProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/columnist/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
        setProfilePic(data.profilePic || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus('Updating...');
    try {
      const res = await fetch('/api/columnist/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profilePic, password: password || undefined })
      });
      if (res.ok) {
        setStatus('Profile updated successfully.');
        setPassword('');
        fetchProfile();
      } else {
        const err = await res.json();
        setStatus(err.error || 'Update failed.');
      }
    } catch (e) {
      setStatus('An error occurred.');
    }
  };

  if (loading) return <div>Loading...</div>;

  const totalArticles = profile?.articles?.length || 0;
  const approvedArticles = profile?.articles?.filter(a => a.isApproved)?.length || 0;

  return (
    <div className="news-grid">
      <div>
        <h2 className="news-section-header">My Profile</h2>
        <form onSubmit={handleUpdate} className="classified-box" style={{ background: 'var(--color-card)', padding: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
            <img 
              src={profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || profile?.username || 'C') + '&background=random&size=128'} 
              alt="Profile" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>@{profile?.username}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Joined {new Date(profile?.joiningDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Display Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              style={{ fontSize: '1rem', padding: '0.5rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Profile Picture</label>
            <ImageUploader value={profilePic} onChange={setProfilePic} placeholder="Upload or Paste (Ctrl+V) a picture" />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Change Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Leave blank to keep current password"
              style={{ fontSize: '1rem', padding: '0.5rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0 2rem', height: '48px' }}>
            Save Changes
          </button>
          
          {status && (
            <p style={{ marginTop: '1rem', fontWeight: 700, color: status.includes('success') ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {status}
            </p>
          )}
        </form>
      </div>

      <aside>
        <h2 className="news-section-header">Statistics</h2>
        <div className="classified-box" style={{ padding: '1.5rem', marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Total Articles:</span>
              <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>{totalArticles}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Approved & Published:</span>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-success)' }}>{approvedArticles}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Pending Review:</span>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-warning)' }}>{totalArticles - approvedArticles}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
