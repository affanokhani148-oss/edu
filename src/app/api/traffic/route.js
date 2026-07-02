import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { articleId } = body;
    
    // Get current date string in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Increment Global Site Traffic
    await prisma.siteTraffic.upsert({
      where: { date: today },
      update: { views: { increment: 1 } },
      create: { date: today, views: 1 },
    });

    // Increment Article views if articleId is provided
    if (articleId) {
      await prisma.article.update({
        where: { id: parseInt(articleId) },
        data: { views: { increment: 1 } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
