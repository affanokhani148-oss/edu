import { prisma } from '../../lib/prisma';
import { getSession } from '../../lib/auth';
import Link from 'next/link';
import SubmitReview from './SubmitReview';

export const dynamic = 'force-dynamic';

function daysRemaining(expiresAt) {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt) - Date.now()) / 86400000);
}

export default async function StudentDashboard() {
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { accesses: { include: { community: true } } },
  });

  const now = new Date();

  // Separate active and expired accesses
  const activeAccesses = user.accesses.filter(a => !a.expiresAt || new Date(a.expiresAt) > now);
  const expiredAccesses = user.accesses.filter(a => a.expiresAt && new Date(a.expiresAt) <= now);

  // Build article query — only communities with active access, with date ranges
  let articles = [];
  if (activeAccesses.length > 0) {
    articles = await prisma.article.findMany({
      where: {
        published: true,
        communityId: { in: activeAccesses.map(a => a.communityId) },
      },
      include: { community: true },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    });

    // Filter by accessFrom date per community
    articles = articles.filter(article => {
      const access = activeAccesses.find(a => a.communityId === article.communityId);
      if (!access || !access.accessFrom) return true;
      return new Date(article.publishedAt) >= new Date(access.accessFrom);
    });
  }

  // Recent quiz attempts
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: session.userId },
    include: { quiz: { include: { communities: true } } },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900 }}>
          Welcome back, {user.name || user.username}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Subscription Status Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          My Subscriptions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {user.accesses.map(a => {
            const days = daysRemaining(a.expiresAt);
            const isExpired = days !== null && days < 0;
            const isWarning = days !== null && days >= 0 && days <= 7;
            const pct = days !== null && !isExpired ? Math.min(100, (days / 30) * 100) : 0;

            return (
              <div key={a.id} className={`subscription-card ${isExpired ? 'subscription-expired' : 'subscription-active'}`}>
                <div>
                  <div className="subscription-name">{a.community?.name}</div>
                  <div className="subscription-days">
                    {days === null ? '∞ Unlimited' :
                     isExpired ? '🔒 Expired' :
                     isWarning ? `⚠️ ${days} days left` :
                     `${days} days left`}
                  </div>
                  {!isExpired && days !== null && (
                    <div className="progress-bar" style={{ marginTop: '0.4rem' }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: isWarning ? 'var(--accent-gold)' : undefined }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expired Community Warnings */}
      {expiredAccesses.length > 0 && (
        <div className="lock-card" style={{ marginBottom: '2rem' }}>
          <div className="lock-icon">🔒</div>
          <p className="lock-title">Subscription Expired</p>
          <p className="lock-message">
            Your access to <strong>{expiredAccesses.map(a => a.community?.name).join(', ')}</strong> has expired.
            To continue accessing daily notes and quizzes, please renew your subscription.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            💳 <strong>Easypaisa:</strong> 0333985267 (Syed Azam Shah)
          </p>
          <Link href="/contact" className="btn btn-primary btn-sm">
            Contact Admin to Renew
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Articles */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Latest Study Materials</h2>
            {activeAccesses.length > 0 && (
              <span className="badge badge-success">{articles.length} available</span>
            )}
          </div>

          {activeAccesses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</p>
              <p>No active subscriptions. Contact admin to get access.</p>
            </div>
          ) : articles.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No articles available yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {articles.map(article => (
                <Link href={`/articles/${article.slug}`} key={article.id} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s',
                    alignItems: 'flex-start',
                  }} className="student-article-card">
                    {article.imageUrl ? (
                      <img src={article.imageUrl} alt="" style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>
                        📄
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="community-badge" style={{ marginBottom: '0.3rem' }}>{article.community?.name}</span>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Take Quiz CTA */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))', borderColor: 'rgba(99,102,241,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎯</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Daily Quiz</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              New quiz available every night at 9 PM. Test your knowledge!
            </p>
            <Link href="/student/quizzes" className="btn btn-primary btn-block btn-sm">
              Attempt Today&apos;s Quiz →
            </Link>
          </div>

          {/* Quiz History */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📊 Recent Quiz Scores</h3>
            {attempts.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                No attempts yet. Try your first quiz!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {attempts.map(attempt => {
                  const pct = Math.round((attempt.score / attempt.totalScore) * 100);
                  const color = pct >= 80 ? 'var(--accent-success)' : pct >= 50 ? 'var(--accent-gold)' : 'var(--accent-danger)';
                  return (
                    <div key={attempt.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1, paddingRight: '0.5rem' }}>{attempt.quiz?.title}</span>
                        <span style={{ fontWeight: 800, color, fontSize: '0.9rem', flexShrink: 0 }}>{pct}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{attempt.score}/{attempt.totalScore}</span>
                      </div>
                      <div className="progress-bar" style={{ marginTop: '0.4rem' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
                <Link href="/student/quizzes" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'block', marginTop: '0.5rem' }}>
                  View all quizzes →
                </Link>
              </div>
            )}
          </div>
          
          {/* Submit Review Card */}
          <SubmitReview />
        </div>
      </div>
    </div>
  );
}
