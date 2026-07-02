import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: { accesses: { include: { community: true } } },
    orderBy: { joiningDate: 'desc' },
  });
  return NextResponse.json(students);
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();

    const student = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashPassword(data.password),
        phone: data.phone,
        role: 'STUDENT',
      },
    });

    // Grant community accesses with expiry and content date range
    if (data.communityAccesses && data.communityAccesses.length > 0) {
      await prisma.userAccess.createMany({
        data: data.communityAccesses.map(a => ({
          userId: student.id,
          communityId: parseInt(a.communityId),
          expiresAt: a.expiresAt ? new Date(a.expiresAt) : null,
          accessFrom: a.accessFrom ? new Date(a.accessFrom) : null,
        })),
      });
    }

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create student. Ensure email is unique.' }, { status: 500 });
  }
}
