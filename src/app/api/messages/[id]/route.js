import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

// PATCH — admin replies to a message
export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  const { adminReply, replyImageUrl } = await request.json();

  const message = await prisma.message.update({
    where: { id: parseInt(resolvedParams.id) },
    data: { adminReply, replyImageUrl, isRead: true, isReplied: !!adminReply },
  });
  return NextResponse.json(message);
}

// DELETE — admin deletes a message
export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  await prisma.message.delete({ where: { id: parseInt(resolvedParams.id) } });
  return NextResponse.json({ success: true });
}
