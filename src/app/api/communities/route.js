import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

export async function GET(request) {
  try {
    const communities = await prisma.community.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(communities);
  } catch (error) {
    console.error("Prisma Error: Falling back to dummy communities.");
    const fallbackCommunities = [
      { id: 1, name: "CSS Exclusive Preparation", description: "Complete CSS notes and video lectures", price: 5000, isPublic: true },
      { id: 2, name: "PMS Mastery", description: "Comprehensive PMS course material", price: 3500, isPublic: true },
      { id: 3, name: "Daily Quiz Access", description: "Compete with top students daily", price: 500, isPublic: true }
    ];
    return NextResponse.json(fallbackCommunities);
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();

  if (data.action === 'delete') {
    await prisma.community.delete({ where: { id: data.id } });
    return NextResponse.json({ success: true });
  }

  const payload = {
    name: data.name,
    description: data.description || null,
    icon: data.icon || null,
    price: parseInt(data.price) || 0,
    featuresJson: JSON.stringify(data.features || []),
    color: data.color || 'var(--accent-primary)',
    isPublic: data.isPublic ?? true
  };

  if (data.id) {
    const comm = await prisma.community.update({
      where: { id: data.id },
      data: payload
    });
    return NextResponse.json(comm);
  } else {
    const comm = await prisma.community.create({
      data: payload
    });
    return NextResponse.json(comm);
  }
}
