import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function verifyAdmin() {
  const session = await getSession();
  if (session && session.role === 'ADMIN') {
    return true;
  }
  return false;
}

export async function GET(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const columnists = await prisma.user.findMany({
      where: { role: 'COLUMNIST' },
      include: {
        articles: { select: { id: true } }
      },
      orderBy: { joiningDate: 'desc' }
    });
    return NextResponse.json(columnists);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { username, password, name } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const safeUsername = String(username);
    const safePassword = String(password);
    const safeName = name ? String(name) : null;

    console.log('Finding existing user:', safeUsername);
    const existingUser = await prisma.user.findUnique({ where: { username: safeUsername } });
    
    if (existingUser) {
      console.log('User exists, updating:', safeUsername);
      const updatedUser = await prisma.user.update({
        where: { username: safeUsername },
        data: { role: 'COLUMNIST', name: safeName || existingUser.name }
      });
      console.log('Updated successfully');
      return NextResponse.json(updatedUser);
    }

    console.log('Creating new user:', safeUsername);
    const newUser = await prisma.user.create({
      data: {
        username: safeUsername,
        password: hashPassword(safePassword),
        role: 'COLUMNIST',
        name: safeName
      }
    });
    console.log('Created successfully');
    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
