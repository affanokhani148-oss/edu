'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewArticle() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    contentHtml: '',
    imageUrl: '',
    published: true,
    isPublic: false,
    communityId: '',
  });

  useEffect(() => {
    fetch('/api/communities').then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : [];
      setCommunities(list);
      if (list.length > 0) setForm(prev => ({ ...prev, communityId: list[0].id }));
    });
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const name = e.target.name;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from title
      if (name === 'title') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
      }
      return updated;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(prev => ({ ...prev, contentHtml: event.target.result }));
      setMessage('✅ HTML file loaded successfully!');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push('/admin');
    } else {
      const err = await res.json();
      setMessage('❌ Error: ' + (err.error || 'Failed to save'));
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Upload New Article</h1>
          <p className="section-subtitle">Upload HTML file or paste content — assign to a community</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>Article Details</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input name="title" className="form-input" value={form.title} onChange={handleChange} required placeholder="e.g. Dawn Editorial: Climate Change Policy" />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Slug (auto-generated)</label>
                  <input name="slug" className="form-input" value={form.slug} onChange={handleChange} required placeholder="e.g. dawn-editorial-climate-change" style={{ fontFamily: 'monospace' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">SEO Description *</label>
                  <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} required rows={3} placeholder="Brief description for search engines and social sharing (150-160 chars)..." style={{ minHeight: '80px' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image URL (optional)</label>
                  <input name="imageUrl" className="form-input" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="Preview" style={{ marginTop: '0.5rem', maxHeight: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover', width: '100%' }} />
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>Content</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Upload HTML File</label>
                  <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="form-file" />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Upload your structured HTML file. It will auto-populate the content area below.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">HTML Content (paste or upload above)</label>
                  <textarea
                    name="contentHtml"
                    className="form-textarea"
                    value={form.contentHtml}
                    onChange={handleChange}
                    required
                    rows={20}
                    placeholder="<p>Paste your article HTML here, or upload a file above...</p>"
                    style={{ minHeight: '350px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>Publish Settings</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Community / Category *</label>
                  <select name="communityId" className="form-select" value={form.communityId} onChange={handleChange} required>
                    <option value="">Select Community</option>
                    {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label className="form-checkbox">
                    <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Publish Immediately</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Make visible to community members</p>
                    </div>
                  </label>

                  <div className="divider" style={{ margin: '0' }} />

                  <label className="form-checkbox">
                    <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>🌐 Show on Public Homepage</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Visible to all visitors (good for SEO & AdSense)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>💡 Tips</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'Enable "Public Homepage" for SEO/AdSense visibility',
                  'Use a clear cover image for social sharing previews',
                  'Keep SEO description under 160 characters',
                  'Articles are only visible to subscribed students unless marked public',
                ].map(tip => (
                  <li key={tip} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-block"
              style={{ padding: '1rem', fontSize: '1rem' }}
            >
              {saving ? '⏳ Saving...' : '✅ Save Article'}
            </button>

            <button type="button" onClick={() => router.push('/admin')} className="btn btn-secondary btn-block">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
