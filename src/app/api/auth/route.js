import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { setSession, clearSession } from '../../../lib/auth';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const { action, username, password } = await request.json();

    if (action === 'logout') {
      await clearSession();
      return NextResponse.json({ success: true });
    }

    if (action === 'register') {
      const { username, password, name, whatsapp, requestedCommunities } = await request.json();
      
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return NextResponse.json({ error: 'Username/Email already exists.' }, { status: 400 });
      }

      await prisma.user.create({
        data: {
          username,
          password: hashPassword(password),
          role: 'STUDENT',
          name,
          whatsapp,
          isApproved: false,
          requestedCommunities: JSON.stringify(requestedCommunities || []),
        }
      });
      return NextResponse.json({ success: true, message: 'Registration pending approval.' });
    }

    if (action === 'login') {
      // Basic init: Create default admin if no users exist
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        await prisma.user.create({
          data: {
            username: 'admin',
            password: hashPassword('admin123'),
            role: 'ADMIN',
            isApproved: true,
          },
        });
      }

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user || user.password !== hashPassword(password)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      if (!user.isApproved) {
        return NextResponse.json({ error: 'Your account is pending payment verification. Please contact admin.' }, { status: 403 });
      }

      await setSession(user.id, user.role);
      return NextResponse.json({ success: true, role: user.role });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
