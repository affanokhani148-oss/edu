'use client';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    heroTitle: '',
    heroSubtitle: '',
    colorPrimary: '',
    bgPrimary: '',
    bgSecondary: '',
    logoText: '',
    customHeadHtml: '',
    customBodyHtml: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    alert('Settings saved! Reload the page to see changes globally.');
  };

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>🎨 Site Settings & Appearance</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Modify the global text and colors. These changes apply immediately site-wide.</p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Text & Content</h3>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Navbar Logo Text</label>
            <input type="text" name="logoText" value={settings.logoText} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Hero Title (Homepage)</label>
            <input type="text" name="heroTitle" value={settings.heroTitle} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Subtitle (Homepage)</label>
            <textarea name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className="form-textarea" required />
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Brand Colors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            <div className="form-group">
              <label className="form-label">Primary Accent (Indigo/Brand)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="color" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} style={{ width: '50px', height: '40px', padding: 0, cursor: 'pointer' }} />
                <input type="text" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} className="form-input" style={{ flex: 1 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Background Primary</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="color" name="bgPrimary" value={settings.bgPrimary} onChange={handleChange} style={{ width: '50px', height: '40px', padding: 0, cursor: 'pointer' }} />
                <input type="text" name="bgPrimary" value={settings.bgPrimary} onChange={handleChange} className="form-input" style={{ flex: 1 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Background Secondary</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="color" name="bgSecondary" value={settings.bgSecondary} onChange={handleChange} style={{ width: '50px', height: '40px', padding: 0, cursor: 'pointer' }} />
                <input type="text" name="bgSecondary" value={settings.bgSecondary} onChange={handleChange} className="form-input" style={{ flex: 1 }} />
              </div>
            </div>

          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>Analytics & Tracking (Pixels)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Easily connect Meta Pixel, Google Analytics, or any other tracking scripts by pasting the code below.</p>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Custom &lt;HEAD&gt; Scripts</label>
            <textarea name="customHeadHtml" value={settings.customHeadHtml || ''} onChange={handleChange} className="form-textarea" placeholder="<!-- Paste Meta Pixel Code Here -->" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Custom &lt;BODY&gt; Scripts</label>
            <textarea name="customBodyHtml" value={settings.customBodyHtml || ''} onChange={handleChange} className="form-textarea" placeholder="<!-- Paste Body Tracking Codes Here -->" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
