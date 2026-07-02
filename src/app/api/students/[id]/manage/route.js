import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

// PATCH — renew subscription
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const { accessId, expiresAt } = await request.json();

  try {
    await prisma.userAccess.update({
      where: { id: parseInt(accessId) },
      data: { expiresAt: new Date(expiresAt) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to renew' }, { status: 500 });
  }
}

// DELETE — remove student
export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  try {
    await prisma.user.delete({ where: { id: parseInt(resolvedParams.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
