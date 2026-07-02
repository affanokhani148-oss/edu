import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSession } from '../../../lib/auth';

export async function GET() {
  const settings = await prisma.siteSetting.findMany();
  // Convert array of {key, value} into a single object {key: value}
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  // Default settings
  const defaults = {
    heroTitle: 'Master CSS & PMS with Daily Premium Content',
    heroSubtitle: 'Daily editorials, GRE words, idioms, pair of words, essay notes & interactive quizzes — all in one private student dashboard.',
    colorPrimary: '#6366f1',
    colorSecondary: '#4f46e5',
    bgPrimary: '#09090b',
    bgSecondary: '#18181b',
    logoText: 'EduPro'
  };

  return NextResponse.json({ ...defaults, ...settingsMap });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await request.json();

  // updates is an object of { key: value }
  const upsertPromises = Object.entries(updates).map(([key, value]) => {
    return prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  });

  await Promise.all(upsertPromises);

  return NextResponse.json({ success: true });
}
