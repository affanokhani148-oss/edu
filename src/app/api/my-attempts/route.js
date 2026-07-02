import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

// GET — student's full quiz history
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: session.userId },
    include: {
      quiz: { include: { communities: true } },
    },
    orderBy: { completedAt: 'desc' },
  });

  // Enrich with question details for review
  const enriched = await Promise.all(
    attempts.map(async (attempt) => {
      const quiz = await prisma.quiz.findUnique({
        where: { id: attempt.quizId },
        include: { questions: true },
      });
      const answers = JSON.parse(attempt.answersJson || '{}');
      return {
        ...attempt,
        quizWithQuestions: quiz,
        answers,
      };
    })
  );

  return NextResponse.json(enriched);
}
