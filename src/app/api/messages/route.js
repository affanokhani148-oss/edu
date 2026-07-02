import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

// GET all messages (admin) or own messages (student)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.role === 'ADMIN') {
    // Admin gets all conversations, grouped by user.
    // For a simple approach, we can fetch all messages, but it's better to fetch users who have messages
    const usersWithMessages = await prisma.user.findMany({
      where: { messages: { some: {} } },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' }
        }
      }
    });
    return NextResponse.json(usersWithMessages);
  }

  // Student gets their own messages
  const messages = await prisma.message.findMany({
    where: { userId: session.userId },
    orderBy: { sentAt: 'asc' },
  });
  return NextResponse.json(messages);
}

// POST — send a message to admin
export async function POST(request) {
  try {
    const data = await request.json();
    const session = await getSession();

    const message = await prisma.message.create({
      data: {
        userId: data.userId || session?.userId || null, // Allow admin to specify userId
        guestName: data.guestName || null,
        guestEmail: data.guestEmail || null,
        content: data.content || null,
        imageUrl: data.imageUrl || null,
        senderRole: session?.role || 'STUDENT',
      },
    });
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
