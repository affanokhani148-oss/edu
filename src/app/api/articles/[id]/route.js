import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  try {
    await prisma.article.delete({ where: { id: parseInt(resolvedParams.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  try {
    const data = await request.json();
    const article = await prisma.article.update({
      where: { id: parseInt(resolvedParams.id) },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        slug: data.slug !== undefined ? data.slug : undefined,
        description: data.description !== undefined ? data.description : undefined,
        contentHtml: data.contentHtml !== undefined ? data.contentHtml : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
        published: data.published !== undefined ? data.published : undefined,
        isPublic: data.isPublic !== undefined ? data.isPublic : undefined,
        sequence: data.sequence !== undefined ? data.sequence : undefined,
        communityId: data.communityId !== undefined ? (data.communityId ? parseInt(data.communityId) : null) : undefined,
      },
    });
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
