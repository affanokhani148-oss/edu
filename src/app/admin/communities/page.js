'use client';
import { useState, useEffect } from 'react';

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const emptyForm = {
    name: '',
    description: '',
    icon: '📰',
    price: 500,
    color: '#6366f1',
    isPublic: true,
    featuresText: ''
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setLoading(true);
    const res = await fetch('/api/communities');
    const data = await res.json();
    setCommunities(data);
    setLoading(false);
  };

  const handleEdit = (c) => {
    setEditing(c.id);
    let featuresArray = [];
    try { featuresArray = JSON.parse(c.featuresJson || '[]'); } catch(e) {}
    setForm({
      ...c,
      featuresText: featuresArray.join('\n')
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      id: editing,
      features: form.featuresText.split('\n').map(s => s.trim()).filter(s => s)
    };

    const res = await fetch('/api/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      handleCancel();
      fetchCommunities();
    } else {
      alert('Failed to save community');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this community? This will affect associated articles and quizzes!')) return;
    
    const res = await fetch('/api/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    });
    
    if (res.ok) fetchCommunities();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>💼 Manage Communities</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and edit subscription communities, prices, and features.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing('new')} className="btn btn-primary">
            + New Community
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{editing === 'new' ? 'Create New Community' : 'Edit Community'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Icon (Emoji)</label>
              <input type="text" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Price (Rs/Month)</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Brand Color</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{ width: '50px', height: '40px', padding: 0 }} />
                <input type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Features (One per line)</label>
            <textarea value={form.featuresText} onChange={e => setForm({...form, featuresText: e.target.value})} className="form-textarea" placeholder="Daily Editorials&#10;Urdu Translation" />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} />
              <span>Show on Homepage Pricing Section</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">Save Community</button>
            <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      ) : null}

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Community Name</th>
                <th>Price</th>
                <th>Public</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {communities.map(c => (
                <tr key={c.id}>
                  <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: c.color }}>Rs. {c.price}/mo</td>
                  <td>{c.isPublic ? <span className="badge badge-success">Yes</span> : <span className="badge badge-default">Hidden</span>}</td>
                  <td>
                    <button onClick={() => handleEdit(c)} className="btn btn-sm btn-secondary" style={{ marginRight: '0.5rem' }}>Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
              {communities.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No communities found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
