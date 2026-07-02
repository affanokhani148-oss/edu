'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import DarkModeToggle from '../../components/DarkModeToggle';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/communities', label: 'Communities', icon: '🏢' },
  { href: '/admin/students', label: 'Students', icon: '🎓' },
  { href: '/admin/quizzes', label: 'Quizzes', icon: '❓' },
  { href: '/admin/articles', label: 'Articles', icon: '📝' },
  { href: '/admin/approvals', label: 'Approvals', icon: '✅' },
  { href: '/admin/columnists', label: 'Columnists', icon: '✍️' },
  { href: '/admin/analytics', label: 'Traffic & Analytics', icon: '📈' },
  { href: '/admin/messages', label: 'Messages', icon: '✉️' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/login');
  };

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Top Navbar */}
      <header style={{
        height: '64px',
        background: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-primary)' }}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <Link href="/admin" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', textDecoration: 'none' }}>
            Edu<span style={{ color: 'var(--color-primary)' }}>Pro</span> <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginLeft: '0.5rem', textTransform: 'uppercase' }}>Admin</span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <DarkModeToggle />
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            A
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
        
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 90
            }}
          />
        )}

        {/* Collapsible Sidebar */}
        <aside style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: 'var(--color-card)',
          borderRight: '1px solid var(--color-border)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: sidebarOpen ? 'var(--shadow-lg)' : 'none'
        }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Menu</span>
            <button 
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}
            >
              ✕
            </button>
          </div>
          
          <nav style={{ padding: '1.5rem 1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.5rem 0.5rem' }}>Main</p>
            {navItems.slice(0, 3).map(item => (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: isActive(item) ? 'var(--color-primary)' : 'var(--color-text-secondary)', backgroundColor: isActive(item) ? 'var(--color-hover)' : 'transparent', fontWeight: isActive(item) ? 600 : 500, fontSize: '0.95rem', borderRadius: 'var(--radius-md)', transition: 'all 0.2s', textDecoration: 'none' }}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '1.5rem 0 0.5rem 0.5rem' }}>Content</p>
            {navItems.slice(3, 7).map(item => (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: isActive(item) ? 'var(--color-primary)' : 'var(--color-text-secondary)', backgroundColor: isActive(item) ? 'var(--color-hover)' : 'transparent', fontWeight: isActive(item) ? 600 : 500, fontSize: '0.95rem', borderRadius: 'var(--radius-md)', transition: 'all 0.2s', textDecoration: 'none' }}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: '1.5rem 0 0.5rem 0.5rem' }}>Interactions</p>
            {navItems.slice(7).map(item => (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: isActive(item) ? 'var(--color-primary)' : 'var(--color-text-secondary)', backgroundColor: isActive(item) ? 'var(--color-hover)' : 'transparent', fontWeight: isActive(item) ? 600 : 500, fontSize: '0.95rem', borderRadius: 'var(--radius-md)', transition: 'all 0.2s', textDecoration: 'none' }}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <Link href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>
              <span>🌐</span> View Public Site
            </Link>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.7rem',
                background: 'rgba(239,68,68,0.08)',
                color: 'var(--color-danger)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: 'var(--font-main)',
                fontSize: '0.9rem',
                transition: 'all 0.25s',
              }}
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto', minWidth: 0, width: '100%' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
