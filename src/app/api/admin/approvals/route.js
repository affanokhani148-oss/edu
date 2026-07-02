import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

async function verifyAdmin() {
  const session = await getSession();
  if (session && session.role === 'ADMIN') {
    return true;
  }
  return false;
}

export async function GET(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const pending = await prisma.article.findMany({
      where: { isApproved: false },
      include: { author: { select: { name: true, username: true } } },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(pending);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { articleId, action } = await req.json();

    if (action === 'approve') {
      // Find the highest sequence for the current day to put this at the end of the sequence, or we can just set it to 1 if it's the main headline
      // For simplicity, we just mark it published.
      await prisma.article.update({
        where: { id: articleId },
        data: { isApproved: true, published: true, publishedAt: new Date() }
      });
      return NextResponse.json({ success: true });
    } else if (action === 'reject') {
      await prisma.article.delete({
        where: { id: articleId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
