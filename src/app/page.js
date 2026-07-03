import Link from 'next/link';
import { prisma } from '../lib/prisma';
import PublicResultSearch from '../components/PublicResultSearch';
import AdPlaceholder from '../components/AdPlaceholder';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'EduPro — Latest CSS/PMS News & Notes',
  description: 'Daily editorials, GRE words, idioms, pair of words, essay notes & daily quizzes.',
};

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  let authorFilter = null;
  if (resolvedSearchParams?.author) {
    const parsed = parseInt(resolvedSearchParams.author, 10);
    if (!isNaN(parsed)) {
      authorFilter = parsed;
    }
  }

  const whereClause = { published: true, isPublic: true, isApproved: true };
  if (authorFilter) {
    whereClause.authorId = authorFilter;
  }

  const publicArticles = await prisma.article.findMany({
    where: whereClause,
    include: { community: true, author: true },
    orderBy: [
      { sequence: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: 6,
  });

  // Fetch unique authors for the filter
  const allAuthors = await prisma.user.findMany({
    where: { articles: { some: { isApproved: true, published: true } } },
    select: { id: true, name: true, username: true }
  });

  const publishedQuizzes = await prisma.quiz.findMany({
    where: { isResultPublished: true },
    include: {
      attempts: {
        include: { user: { select: { name: true, username: true } } },
        orderBy: { score: 'desc' } 
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const leaderboards = publishedQuizzes.map(quiz => {
    const bestAttempts = {};
    quiz.attempts.forEach(attempt => {
      const userId = attempt.user.username;
      if (!bestAttempts[userId] || bestAttempts[userId].score < attempt.score) {
        bestAttempts[userId] = attempt;
      }
    });

    const sortedAttempts = Object.values(bestAttempts).sort((a, b) => b.score - a.score);
    const top3 = sortedAttempts.slice(0, 3).map((att, i) => ({
      name: att.user.name || att.user.username,
      score: att.score,
      totalScore: att.totalScore,
      percentage: Math.round((att.score / att.totalScore) * 100),
      rank: i + 1
    }));
    return { id: quiz.id, title: quiz.title, top3 };
  }).filter(lb => lb.top3.length > 0);

  const dbCommunities = await prisma.community.findMany({
    where: { isPublic: true },
    orderBy: { price: 'desc' }
  });

  // Pick a "Headline" article
  const headlineArticle = publicArticles.length > 0 ? publicArticles[0] : null;
  const secondaryArticles = publicArticles.length > 1 ? publicArticles.slice(1, 4) : [];

  return (
    <div className="container">

      {/* Author Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Filter by Columnist:</span>
        <Link href="/" style={{ fontSize: '0.85rem', fontWeight: !authorFilter ? 700 : 400, color: !authorFilter ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
          All
        </Link>
        {allAuthors.map(author => (
          <Link 
            key={author.id} 
            href={`/?author=${author.id}`} 
            style={{ fontSize: '0.85rem', fontWeight: authorFilter === author.id ? 700 : 400, color: authorFilter === author.id ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
          >
            {author.name || author.username}
          </Link>
        ))}
      </div>

      <div className="news-grid" style={{ marginTop: '2rem' }}>
        
        {/* Left Column - Main Content */}
        <div>
          <h2 className="news-section-header" id="latest">{authorFilter ? 'Author Archives' : 'Top Story'}</h2>
          
          {headlineArticle ? (
            <div className="news-article-card" style={{ borderBottom: 'none' }}>
              {headlineArticle.imageUrl && (
                <img src={headlineArticle.imageUrl} alt={headlineArticle.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
              )}
              <h1 className="news-article-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                <Link href={`/articles/${headlineArticle.slug}`}>{headlineArticle.title}</Link>
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <img 
                  src={headlineArticle.author?.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(headlineArticle.author?.name || 'EduPro') + '&background=random'} 
                  alt="Author" 
                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
                <span className="news-meta" style={{ margin: 0 }}>
                  By <strong>{headlineArticle.author?.name || headlineArticle.author?.username || 'EduPro Editorial'}</strong> | {new Date(headlineArticle.publishedAt || headlineArticle.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="news-article-desc" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                {headlineArticle.description || "The definitive guide and analysis for today's CSS preparation."}
              </p>
            </div>
          ) : (
            <div className="news-article-card">
              <h1 className="news-article-title">No Articles Found</h1>
              <p className="news-article-desc">We couldn't find any articles matching this filter.</p>
            </div>
          )}

          <div style={{ height: '2px', background: 'var(--color-border)', margin: '2rem 0' }} />

          <h2 className="news-section-header" id="editorials">More Editorials & Notes</h2>
          
          {Object.entries(
            secondaryArticles.reduce((acc, article) => {
              const dateObj = new Date(article.publishedAt);
              let dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              
              // Helper to check if date is today or yesterday
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (dateObj.toDateString() === today.toDateString()) {
                dateStr = 'Today';
              } else if (dateObj.toDateString() === yesterday.toDateString()) {
                dateStr = 'Yesterday';
              }

              if (!acc[dateStr]) acc[dateStr] = [];
              acc[dateStr].push(article);
              return acc;
            }, {})
          ).map(([dateLabel, groupArticles]) => (
            <div key={dateLabel} style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-primary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {dateLabel}
                </h2>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border-light)' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {groupArticles.map(article => (
                  <div key={article.id} className="news-article-card" dir="auto">
                    <h3 className="news-article-title" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <img 
                        src={article.author?.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(article.author?.name || 'EduPro') + '&background=random'} 
                        alt="Author" 
                        style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span className="news-meta" style={{ margin: 0, fontSize: '0.7rem' }}>
                        {article.author?.name || article.author?.username || 'EduPro'}
                      </span>
                    </div>
                    <p className="news-article-desc" style={{ fontSize: '0.9rem' }}>{article.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* Right Column - Sidebar */}
        <aside>
          <div style={{ marginBottom: '2rem' }}>
            <AdPlaceholder slotId="SIDEBAR_TOP" />
          </div>

          <h2 className="news-section-header">Breaking Quizzes</h2>
          {leaderboards.map(lb => (
            <div key={lb.id} className="classified-box">
              <h3 className="classified-title" style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>{lb.title}</h3>
              <span className="news-meta">Top Performers</span>
              <table className="data-table" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <tbody>
                  {lb.top3.map((student, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, width: '30px' }}>{student.rank}</td>
                      <td>{student.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{student.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <h2 className="news-section-header" id="communities" style={{ marginTop: '3rem' }}>Classifieds / Subscriptions</h2>
          
          {dbCommunities.map((c, i) => {
            let featuresArray = [];
            try { featuresArray = JSON.parse(c.featuresJson || '[]'); } catch(e) {}
            return (
              <div key={c.id} className="classified-box">
                <h3 className="classified-title">{c.name}</h3>
                <div className="classified-price">Rs. {c.price} / mo</div>
                <ul className="classified-features">
                  {featuresArray.map(f => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <Link href="/login" className="btn btn-secondary btn-block">Subscribe Now</Link>
              </div>
            );
          })}
        </aside>

      </div>
    </div>
  );
}
