'use client';
import { useState, useEffect } from 'react';
import ImageUploader from '../../components/ImageUploader';

export default function ColumnistDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('');
  const [myArticles, setMyArticles] = useState([]);

  useEffect(() => {
    fetchMyArticles();
  }, []);

  const fetchMyArticles = async () => {
    try {
      const res = await fetch('/api/columnist/articles');
      if (res.ok) {
        const data = await res.json();
        setMyArticles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const res = await fetch('/api/columnist/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          contentHtml,
          imageUrl
        }),
      });

      if (res.ok) {
        setStatus('Article submitted successfully! Awaiting Admin approval.');
        setTitle('');
        setDescription('');
        setContentHtml('');
        setImageUrl('');
        fetchMyArticles();
      } else {
        const err = await res.json();
        setStatus(err.error || 'Failed to submit article.');
      }
    } catch (error) {
      setStatus('An error occurred.');
    }
  };

  return (
    <div className="news-grid">
      <div>
        <h2 className="news-section-header">Write an Article</h2>
        <form onSubmit={handleSubmit} className="classified-box" style={{ background: 'var(--color-card)', padding: '2rem' }}>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Headline (Title)</label>
            <input 
              type="text" 
              className="form-input" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              placeholder="Enter a captivating headline..."
              style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', padding: '0.5rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Short Description</label>
            <textarea 
              className="form-textarea" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              rows={2}
              placeholder="A brief summary of the article..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Article Content</label>
            <textarea 
              className="form-textarea" 
              value={contentHtml} 
              onChange={e => setContentHtml(e.target.value)} 
              required 
              rows={15}
              placeholder="Write your article here..."
              style={{ fontFamily: 'var(--font-main)' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>You can use simple text formatting.</p>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Article Image (Optional)</label>
            <ImageUploader value={imageUrl} onChange={setImageUrl} placeholder="Upload or Paste (Ctrl+V) an image" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0 2rem', height: '48px' }}>
            Submit for Review
          </button>
          
          {status && (
            <p style={{ marginTop: '1rem', fontWeight: 700, color: status.includes('success') ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {status}
            </p>
          )}
        </form>
      </div>

      <aside>
        <h2 className="news-section-header">My Submissions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myArticles.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>You haven't submitted any articles yet.</p>
          ) : (
            myArticles.map(a => (
              <div key={a.id} className="classified-box" style={{ padding: '1rem', marginBottom: 0 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{a.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '0.2rem 0.5rem', 
                    background: a.isApproved ? 'var(--color-success)' : 'var(--color-warning)', 
                    color: '#fff' 
                  }}>
                    {a.isApproved ? 'PUBLISHED' : 'PENDING'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
