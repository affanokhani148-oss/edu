import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

// GET — get leaderboard for a quiz or all published leaderboards
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get('quizId');

  if (quizId) {
    const lb = await prisma.leaderboard.findFirst({
      where: { quizId: parseInt(quizId) },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json(lb);
  }

  // Public: get all published leaderboards (latest)
  const today = new Date().toISOString().split('T')[0];
  const leaderboards = await prisma.leaderboard.findMany({
    where: { isPublished: true },
    include: {
      quiz: { include: { communities: true } },
      user: { select: { name: true, username: true } }
    },
    orderBy: { publishedAt: 'desc' },
    take: 5,
  });
  return NextResponse.json(leaderboards);
}

// POST — admin publishes leaderboard for a quiz
export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { quizId, isPublished } = await request.json();

    // Calculate top 3 from quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: parseInt(quizId) },
      include: { user: { select: { name: true, username: true } } },
      orderBy: [{ score: 'desc' }, { completedAt: 'asc' }],
      take: 3,
    });

    const topJson = JSON.stringify(
      attempts.map((a, i) => ({
        rank: i + 1,
        name: a.user?.name || a.user?.username || 'Anonymous',
        score: a.score,
        totalScore: a.totalScore,
        percentage: Math.round((a.score / a.totalScore) * 100),
      }))
    );

    const today = new Date().toISOString().split('T')[0];
    const leaderboard = await prisma.leaderboard.upsert({
      where: { id: 0 },
      create: {
        quizId: parseInt(quizId),
        date: today,
        topJson,
        isPublished: isPublished ?? true,
      },
      update: {
        topJson,
        isPublished: isPublished ?? true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, leaderboard });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to publish leaderboard' }, { status: 500 });
  }
}
