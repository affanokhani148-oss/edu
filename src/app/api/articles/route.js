import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

export async function POST(request) {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'COLUMNIST')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Admins are auto-approved. Columnists require admin approval.
    const isApproved = session.role === 'ADMIN' ? true : false;
    const published = session.role === 'ADMIN' ? (data.published || false) : false;
    
    // Admin can specify authorId, Columnist automatically uses their own ID
    let authorId = session.role === 'COLUMNIST' ? session.userId : null;
    if (session.role === 'ADMIN' && data.authorId) {
      authorId = parseInt(data.authorId);
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        contentHtml: data.contentHtml,
        imageUrl: data.imageUrl || null,
        published,
        isPublic: data.isPublic || false,
        isApproved,
        authorId,
        communityId: data.communityId ? parseInt(data.communityId) : null,
      },
    });
    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const articles = await prisma.article.findMany({
    include: { community: true },
    orderBy: { publishedAt: 'desc' },
  });
  return NextResponse.json(articles);
}
