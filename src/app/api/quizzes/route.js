import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let roleWhere = {};
  if (session.role === 'STUDENT') {
    const now = new Date();
    roleWhere = {
      communities: {
        some: {
          userAccess: { some: { userId: session.userId } }
        }
      },
      AND: [
        { OR: [{ activeFrom: null }, { activeFrom: { lte: now } }] },
        { OR: [{ activeTo: null }, { activeTo: { gte: now } }] },
        { attempts: { none: { userId: session.userId } } }
      ]
    };
  }

  const quizzes = await prisma.quiz.findMany({
    where: roleWhere,
    include: { communities: true, questions: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(quizzes);
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
        activeFrom: data.activeFrom ? new Date(data.activeFrom) : null,
        activeTo: data.activeTo ? new Date(data.activeTo) : null,
        communities: {
          connect: data.communityIds.map(id => ({ id: parseInt(id) }))
        },
        questions: {
          create: data.questions.map(q => ({
            text: q.text,
            optionsJson: JSON.stringify(q.options),
            correctIndex: parseInt(q.correctIndex),
            explanation: q.explanation
          }))
        }
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
