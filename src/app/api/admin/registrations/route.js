import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pendingUsers = await prisma.user.findMany({
      where: { isApproved: false },
      orderBy: { joiningDate: 'desc' },
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
    const { userId, action } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'approve') {
      let requestedCommunityIds = [];
      try {
        requestedCommunityIds = JSON.parse(user.requestedCommunities || '[]');
      } catch (e) {
        // invalid JSON
      }

      // Create access for each requested community
      if (requestedCommunityIds.length > 0) {
        const accessData = requestedCommunityIds.map(communityId => ({
          userId: user.id,
          communityId: parseInt(communityId, 10),
        }));

        await prisma.userAccess.createMany({
          data: accessData,
          skipDuplicates: true, // Just in case
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          isApproved: true,
          requestedCommunities: null, // clear it out
        },
      });

      return NextResponse.json({ success: true, message: 'User approved and access granted.' });
    }

    if (action === 'reject') {
      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ success: true, message: 'User rejected and deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
