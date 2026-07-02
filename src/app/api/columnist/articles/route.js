import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

async function getUserFromCookie() {
  return await getSession();
}

export async function GET(req) {
  const user = await getUserFromCookie();
  if (!user || (user.role !== 'COLUMNIST' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await prisma.article.findMany({
      where: { authorId: user.userId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const user = await getUserFromCookie();
  if (!user || (user.role !== 'COLUMNIST' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, contentHtml, imageUrl } = body;

    if (!title || !description || !contentHtml) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auto-generate slug from title
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const newArticle = await prisma.article.create({
      data: {
        title,
        description,
        contentHtml,
        imageUrl: imageUrl || null,
        slug,
        isApproved: false, // Must be approved by admin
        published: false,
        authorId: user.userId,
      }
    });

    return NextResponse.json(newArticle);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
