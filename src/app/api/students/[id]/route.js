import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

// GET — full record of a specific student
export async function GET(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const studentId = parseInt(resolvedParams.id);

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      accesses: { include: { community: true } },
      attempts: {
        include: { quiz: { include: { communities: true } } },
        orderBy: { completedAt: 'desc' },
      },
      messages: { orderBy: { sentAt: 'desc' } },
    },
  });

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json(student);
}
