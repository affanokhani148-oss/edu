import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get('quizId');
  const studentName = searchParams.get('studentName');

  if (!quizId || !studentName) {
    return NextResponse.json({ error: 'quizId and studentName are required' }, { status: 400 });
  }

  // Find the quiz to ensure results are published
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(quizId) }
  });

  if (!quiz || !quiz.isResultPublished) {
    return NextResponse.json({ error: 'Results for this quiz are not public' }, { status: 403 });
  }

  // Find attempt for this student by matching User name or username
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quizId: parseInt(quizId),
      user: {
        OR: [
          { name: { contains: studentName } }, // Sqlite case-insensitivity depends on collation, but we'll try this
          { username: { contains: studentName } }
        ]
      }
    },
    include: {
      user: { select: { name: true, username: true } }
    },
    orderBy: { score: 'desc' },
    take: 5
  });

  return NextResponse.json(attempts);
}
