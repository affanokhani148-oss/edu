import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET(req) {
  const session = await getSession();
  if (!session || (session.role !== 'COLUMNIST' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        articles: { select: { id: true, isApproved: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Exclude password from the returned data
    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = await getSession();
  if (!session || (session.role !== 'COLUMNIST' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, profilePic, password } = body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = String(name);
    if (profilePic !== undefined) dataToUpdate.profilePic = String(profilePic);
    if (password) dataToUpdate.password = hashPassword(String(password));

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: dataToUpdate
    });

    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
