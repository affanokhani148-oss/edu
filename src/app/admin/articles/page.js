'use client';
import { useState, useEffect } from 'react';

import ImageUploader from '../../../components/ImageUploader';

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [status, setStatus] = useState('');
  
  // New Article State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    fetchArticles();
    fetchCommunities();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/communities');
      if (res.ok) {
        setCommunities(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          contentHtml,
          slug,
          imageUrl,
          communityId: communityId || null,
          isPublic,
          published: true // Admin posts are published immediately
        })
      });
      if (res.ok) {
        setStatus('Article created successfully!');
        setTitle('');
        setDescription('');
        setContentHtml('');
        setSlug('');
        setImageUrl('');
        setCommunityId('');
        fetchArticles();
      } else {
        const err = await res.json();
        setStatus(err.error || 'Failed to create article');
      }
    } catch (e) {
      setStatus('An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchArticles();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSequenceUpdate = async (id, newSequence) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: parseInt(newSequence) || 0 })
      });
      if (res.ok) fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Manage Articles</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Create Form */}
        <div style={{ background: 'var(--color-card)', border: '2px solid var(--color-border)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Write New Article (Admin)</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Title</label>
              <input type="text" className="form-input" value={title} onChange={e => {
                setTitle(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
              }} required />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Slug (URL)</label>
              <input type="text" className="form-input" value={slug} onChange={e => setSlug(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Short Description</label>
              <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} required rows={2} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Content</label>
              <textarea className="form-textarea" value={contentHtml} onChange={e => setContentHtml(e.target.value)} required rows={6} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Article Image (Upload, Paste, or URL)</label>
              <ImageUploader value={imageUrl} onChange={setImageUrl} placeholder="Drag an image here, or Paste (Ctrl+V) from clipboard" />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.3rem' }}>Community (Optional)</label>
              <select className="form-input" value={communityId} onChange={e => setCommunityId(e.target.value)}>
                <option value="">Public / General</option>
                {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              Show on Homepage (isPublic)
            </label>

            <button type="submit" className="btn btn-primary">Publish Article</button>
            {status && <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{status}</p>}
          </form>
        </div>

        {/* Existing Articles */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>All Published Articles</h3>
          {articles.length === 0 ? (
            <p>No articles found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {articles.map(a => (
                <div key={a.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      {new Date(a.publishedAt).toLocaleString()} • {a.community ? a.community.name : 'Public'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Sequence:
                        <input 
                          type="number" 
                          defaultValue={a.sequence} 
                          onBlur={(e) => handleSequenceUpdate(a.id, e.target.value)}
                          style={{ width: '60px', padding: '0.2rem', border: '1px solid var(--color-border)' }}
                        />
                      </label>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: a.isApproved ? 'var(--color-success)' : 'var(--color-warning)', color: 'white', borderRadius: '4px' }}>
                        {a.isApproved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a.id)} style={{ padding: '0.5rem', background: 'var(--color-danger)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
