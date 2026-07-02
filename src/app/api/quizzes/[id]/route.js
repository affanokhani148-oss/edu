import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(resolvedParams.id) },
    include: { questions: true, communities: true }
  });

  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Do not expose correctIndex in GET response for students to prevent cheating
  if (session.role === 'STUDENT') {
    quiz.questions = quiz.questions.map(q => {
      const { correctIndex, ...safeQuestion } = q;
      return safeQuestion;
    });

    if (!quiz.isResultPublished) {
      quiz.questions = quiz.questions.map(q => {
        const { explanation, ...safeQuestion } = q;
        return safeQuestion;
      });
    }
  }

  return NextResponse.json(quiz);
}

export async function PATCH(request, { params }) {
  const resolvedParams = await params;
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { isResultPublished } = await request.json();

  const quiz = await prisma.quiz.update({
    where: { id: parseInt(resolvedParams.id) },
    data: { isResultPublished }
  });

  return NextResponse.json(quiz);
}
