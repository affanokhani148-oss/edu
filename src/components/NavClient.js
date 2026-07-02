'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

export default function NavClient() {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  if (pathname.startsWith('/admin') || pathname.startsWith('/student')) {
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
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>LOGIN</Link>
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
