'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [communities, setCommunities] = useState([]);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCommunityIds, setSelectedCommunityIds] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    fetch('/api/communities')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCommunities(data.filter(c => c.isPublic));
      })
      .catch(() => {});
  }, []);

  const handleToggleCommunity = (id) => {
    if (selectedCommunityIds.includes(id)) {
      setSelectedCommunityIds(selectedCommunityIds.filter(cid => cid !== id));
    } else {
      setSelectedCommunityIds([...selectedCommunityIds, id]);
    }
  };

  const totalFee = selectedCommunityIds.reduce((sum, id) => {
    const comm = communities.find(c => c.id === id);
    return sum + (comm ? comm.price : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCommunityIds.length === 0) {
      setError('Please select at least one community to join.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'register', 
        name, 
        username, 
        password, 
        whatsapp, 
        requestedCommunities: selectedCommunityIds 
      }),
    });

    if (res.ok) {
      setSuccessData({ totalFee, selectedIds: selectedCommunityIds });
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed.');
    }
    setLoading(false);
  };

  if (successData) {
    const selectedNames = communities.filter(c => successData.selectedIds.includes(c.id)).map(c => c.name).join(', ');
    const whatsappMessage = encodeURIComponent(`Hi Admin, I just registered on EduPro.\nName: ${name}\nEmail: ${username}\nCommunities: ${selectedNames}\nTotal Fee: Rs. ${successData.totalFee}\n\nHere is my payment screenshot for verification:`);
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', padding: '2rem 1rem' }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem', color: 'var(--color-primary)' }}>Registration Almost Complete!</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Your account has been created successfully, but it is pending payment verification.
          </p>
          
          <div style={{ background: 'var(--color-hover)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Registration Summary</h3>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Communities:</strong> {selectedNames}</p>
            <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}><strong>Total Fee to Pay:</strong> <span style={{ color: 'var(--color-primary)' }}>Rs. {successData.totalFee}</span></p>
          </div>

          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Please send Rs. {successData.totalFee} via Easypaisa to 03339852167, then click the button below to share the screenshot.</p>

          <a 
            href={`https://wa.me/923339852167?text=${whatsappMessage}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn" 
            style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: 'var(--radius-full)', fontWeight: 800, width: '100%' }}
          >
            💬 Send Payment Screenshot via WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '3rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Left Side: Form */}
        <div className="card" style={{ flex: '1 1 400px', padding: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Create your Account</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Join EduPro and start preparing today.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
              <input type="text" className="form-input" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
              <input type="email" className="form-input" style={{ width: '100%' }} value={username} onChange={e => setUsername(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>WhatsApp Number</label>
              <input type="text" className="form-input" style={{ width: '100%' }} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="0333..." required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
              <input type="password" className="form-input" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}>
              {loading ? 'Creating Account...' : 'Continue to Payment →'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
            </div>
          </form>
        </div>

        {/* Right Side: Community Selection */}
        <div style={{ flex: '1 1 350px' }}>
          <div className="card" style={{ padding: '2rem', background: 'var(--color-card)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: 800 }}>Select Communities to Join</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {communities.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: selectedCommunityIds.includes(c.id) ? 'var(--color-hover)' : 'transparent', transition: 'all 0.2s' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedCommunityIds.includes(c.id)} 
                    onChange={() => handleToggleCommunity(c.id)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{c.description || 'Premium preparation materials'}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                    Rs. {c.price}
                  </div>
                </label>
              ))}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total Fee:</span>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>Rs. {totalFee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
