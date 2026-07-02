import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

export async function GET(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get('quizId');

  if (quizId) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: parseInt(quizId) },
      include: { user: { select: { name: true, username: true, phone: true } }, quiz: { select: { title: true } } },
      orderBy: [{ score: 'desc' }, { completedAt: 'asc' }],
    });
    return NextResponse.json(attempts);
  }

  const attempts = await prisma.quizAttempt.findMany({
    include: { user: { select: { name: true, username: true } }, quiz: { select: { title: true } } },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });
  return NextResponse.json(attempts);
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { quizId, answers } = await request.json(); // answers is an object: { "qIndex": selectedOptionIndex }

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: { questions: true }
    });

    let score = 0;
    const totalScore = quiz.questions.length;

    quiz.questions.forEach((q, qIndex) => {
      if (answers[qIndex] === q.correctIndex) {
        score += 1;
      }
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.userId,
        quizId: quiz.id,
        score,
        totalScore,
        answersJson: JSON.stringify(answers)
      }
    });

    return NextResponse.json(attempt);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit quiz attempt' }, { status: 500 });
  }
}
