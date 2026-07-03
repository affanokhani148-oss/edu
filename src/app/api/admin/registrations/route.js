import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch messages that start with "New Registration Request!"
    const regMessages = await prisma.message.findMany({
      where: { content: { startsWith: 'New Registration Request!' } },
      include: { user: true },
      orderBy: { sentAt: 'desc' },
    });

    const pendingUsers = regMessages.map(msg => {
      // Parse content to get whatsapp and requestedCommunities
      const parts = msg.content.split('\n');
      const whatsapp = parts[1]?.replace('WhatsApp: ', '');
      const reqCommRaw = parts[2]?.replace('Requested Communities: ', '');
      
      return {
        id: msg.userId,
        messageId: msg.id,
        name: msg.guestName,
        username: msg.guestEmail,
        whatsapp,
        requestedCommunities: reqCommRaw,
        joiningDate: msg.sentAt,
      };
    });

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, action, messageId } = await request.json();

    if (action === 'approve') {
      const msg = await prisma.message.findUnique({ where: { id: messageId } });
      if (!msg) return NextResponse.json({ error: 'Message not found' });

      const parts = msg.content.split('\n');
      const reqCommRaw = parts[2]?.replace('Requested Communities: ', '');
      
      let requestedCommunityIds = [];
      try {
        requestedCommunityIds = JSON.parse(reqCommRaw || '[]');
      } catch (e) {}

      if (requestedCommunityIds.length > 0) {
        const accessData = requestedCommunityIds.map(communityId => ({
          userId: parseInt(userId, 10),
          communityId: parseInt(communityId, 10),
        }));

        await prisma.userAccess.createMany({
          data: accessData,
          skipDuplicates: true,
        });
      }

      await prisma.message.delete({ where: { id: messageId } });
      return NextResponse.json({ success: true, message: 'User approved and access granted.' });
    }

    if (action === 'reject') {
      await prisma.message.delete({ where: { id: messageId } });
      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ success: true, message: 'User rejected and deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
