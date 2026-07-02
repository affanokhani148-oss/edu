import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboard() {
  // 1. Fetch Global Traffic History
  const trafficLog = await prisma.siteTraffic.findMany({
    orderBy: { date: 'desc' },
    take: 30, // Last 30 days
  });

  const totalViewsEver = trafficLog.reduce((sum, day) => sum + day.views, 0);

  // 2. Fetch Top Viewed Articles
  const topArticles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { views: 'desc' },
    take: 10,
    include: { author: true }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Site Traffic & Analytics</h2>
        <div style={{ background: 'var(--color-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700 }}>
          {totalViewsEver.toLocaleString()} Total Views (Last 30 Days)
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Daily Traffic Log */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            Daily Global Traffic
          </h3>
          {trafficLog.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No traffic recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {trafficLog.map((day) => (
                <div key={day.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{day.views.toLocaleString()} visits</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Articles List */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            Top Articles (All Time)
          </h3>
          {topArticles.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No articles published yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topArticles.map((article, index) => (
                <div key={article.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-border-dark)', width: '30px', textAlign: 'center' }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      By {article.author?.name || 'Admin'}
                    </p>
                  </div>
                  <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)', fontWeight: 800, padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.9rem' }}>
                    {article.views.toLocaleString()} 👁️
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
