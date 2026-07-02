'use client';
import { useState, useRef, useEffect } from 'react';

export default function ImageUploader({ value, onChange, placeholder = "Drag & Drop, Paste (Ctrl+V), or Browse" }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle Ctrl+V Paste anywhere on document if this component is active
  // Actually, better to just bind onPaste to the container to avoid capturing global pastes unintentionally,
  // but we can make the container focusable.
  
  const handleFile = (file) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please provide a valid image file.');
      return;
    }
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    } else {
      // Check for URL drop
      const url = e.dataTransfer.getData('text/plain');
      if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        onChange(url);
      }
    }
  };

  const onPaste = (e) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleFile(e.clipboardData.files[0]);
    } else {
      // Check for URL paste
      const text = e.clipboardData.getData('text/plain');
      if (text && (text.startsWith('http') || text.startsWith('data:'))) {
        e.preventDefault();
        onChange(text);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div 
        tabIndex="0"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: dragging ? 'rgba(99,102,241,0.05)' : 'var(--color-card)',
          padding: '2rem 1rem',
          textAlign: 'center',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
          📸
        </div>
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{placeholder}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          Supports URL, Base64, and local files (auto-converted)
        </p>
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }} 
        />
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 600 }}>{error}</p>}
      
      {/* Manual URL Input fallback */}
      <input 
        type="text" 
        className="form-input" 
        placeholder="Or paste an image URL here manually..." 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />

      {/* Preview */}
      {value && (
        <div style={{ position: 'relative', marginTop: '1rem', display: 'inline-block', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <img src={value} alt="Preview" style={{ display: 'block', maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
              borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
