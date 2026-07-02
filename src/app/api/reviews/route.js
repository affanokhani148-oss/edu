import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

// GET published reviews (public) or all reviews (admin)
export async function GET(request) {
  const session = await getSession();
  const isAdmin = session?.role === 'ADMIN';

  const reviews = await prisma.review.findMany({
    where: isAdmin ? {} : { isApproved: true },
    orderBy: { createdAt: 'desc' },
    take: isAdmin ? 100 : 12,
  });
  return NextResponse.json(reviews);
}

// POST — submit a review (must be logged in as student)
export async function POST(request) {
  try {
    const data = await request.json();
    const session = await getSession();

    const review = await prisma.review.create({
      data: {
        userId: session?.userId || null,
        name: data.name,
        rating: parseInt(data.rating),
        content: data.content,
        isApproved: false,
      },
    });
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
