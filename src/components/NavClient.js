'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

export default function NavClient({ userSession }) {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    window.location.reload();
  };

  if (pathname.startsWith('/admin') || pathname.startsWith('/student') || pathname.startsWith('/columnist')) {
    return null;
  }

  return (
    <header className="news-header">
      <div className="container">
        {/* Tier 1: Utility Top Bar */}
        <div className="news-topbar">
          <div>{currentDate || 'Loading date...'}</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <DarkModeToggle />
            {userSession ? (
              <>
                <Link href={userSession.role === 'ADMIN' ? '/admin' : (userSession.role === 'COLUMNIST' ? '/columnist' : '/student')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>
                  📊 Dashboard
                </Link>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 700, padding: '0.4rem 1rem', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-full)', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-danger)'; }}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, padding: '0.4rem 1rem', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-full)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}>
                👤 Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Tier 2: Brand / Logo Area */}
        <div className="news-brand-area">
          <Link href="/" className="news-brand">
            Edu<span>Pro</span>
          </Link>
        </div>

        {/* Tier 3: Main Navigation Categories */}
        <nav className="news-nav">
          <Link href="/" className="news-nav-link">Home</Link>
          <Link href="#latest" className="news-nav-link">Latest Notes</Link>
          <Link href="#editorials" className="news-nav-link">Editorials</Link>
          <Link href="#communities" className="news-nav-link">Communities</Link>
          <Link href="/about" className="news-nav-link">About</Link>
          <Link href="/contact" className="news-nav-link">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
