import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth';
import Link from 'next/link';

export const metadata = {
  title: 'Columnist Desk | EduPro',
};

export default async function ColumnistLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'COLUMNIST' && session.role !== 'ADMIN') {
    redirect('/student');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Newspaper Top Header for Columnist */}
      <header className="news-header" style={{ marginBottom: 0 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <div className="news-brand" style={{ fontSize: '2rem' }}>
            Edu<span style={{ color: 'var(--color-primary)' }}>Pro</span> <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Columnist Desk</span>
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-main)' }}>
            <Link href="/columnist" className="news-nav-link" style={{ fontSize: '0.9rem' }}>Write Article</Link>
            <Link href="/columnist/profile" className="news-nav-link" style={{ fontSize: '0.9rem' }}>My Profile</Link>
            <Link href="/" className="news-nav-link" style={{ fontSize: '0.9rem' }}>View Public Site</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ flexGrow: 1, padding: '2rem 1rem', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
