import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

// PATCH — approve/reject review (admin)
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const { isApproved } = await request.json();

  const review = await prisma.review.update({
    where: { id: parseInt(resolvedParams.id) },
    data: { isApproved },
  });
  return NextResponse.json(review);
}

// DELETE — admin deletes review
export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  await prisma.review.delete({ where: { id: parseInt(resolvedParams.id) } });
  return NextResponse.json({ success: true });
}
