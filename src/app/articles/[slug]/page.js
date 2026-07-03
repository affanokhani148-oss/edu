import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import AdPlaceholder from '../../../components/AdPlaceholder';
import Link from 'next/link';
import ViewTracker from '../../../components/ViewTracker';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const article = await prisma.article.findUnique({
    where: { slug: resolvedParams.slug },
    include: { community: true },
  });

  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} | EduPro CSS/PMS News`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const article = await prisma.article.findUnique({
    where: { slug: resolvedParams.slug },
    include: { community: true, author: true },
  });

  if (!article) notFound();

  const publishDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const authorName = article.author?.name || article.author?.username || 'EduPro Editorial Board';
  const authorPic = article.author?.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName) + '&background=random';

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div className="news-grid">
        
        {/* Main Content Area */}
        <div style={{ borderRight: '1px solid var(--color-border-light)', paddingRight: '2rem' }}>
          
          <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h1 className="news-article-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {article.title}
            </h1>
            
            <p className="news-article-desc" style={{ fontSize: '1.2rem', marginBottom: '2rem', fontStyle: 'italic' }} dir="auto">
              {article.description}
            </p>

            {/* Author Profile Block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={authorPic} 
                  alt={authorName} 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px solid var(--color-border)' }} 
                />
                <div>
                  <p style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    {authorName}
                  </p>
                  <p className="news-meta" style={{ marginBottom: 0 }}>
                    Published {publishDate}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', padding: '0.5rem 1rem', borderRadius: '50px' }}>
                <span style={{ fontSize: '1.2rem' }}>👁️</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{article.views + 1} Views</span>
              </div>
            </div>
          </div>
          
          <ViewTracker articleId={article.id} />

          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}
            />
          )}

          <div className="news-article-content" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text-primary)' }} dir="auto">
            <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
          </div>
          
          <div style={{ marginTop: '3rem', borderTop: '2px solid var(--color-border)', paddingTop: '2rem' }}>
            <Link href="/" className="btn btn-secondary">
              ← Back to Front Page
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ paddingLeft: '1rem' }}>
          <AdPlaceholder slotId="ARTICLE_SIDEBAR" />
          
          <div className="classified-box" style={{ marginTop: '2rem' }}>
            <h3 className="classified-title">About the Author</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
               <img 
                src={authorPic} 
                alt={authorName} 
                style={{ width: '60px', height: '60px', borderRadius: '50%' }} 
              />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{authorName}</span>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-main)' }}>
              Columnist and contributor at EduPro. Read more articles by this author on the front page.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
