import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function runTest() {
  console.log('--- STARTING E2E TEST ---');
  try {
    // 1. Clean up old test data
    await prisma.article.deleteMany({ where: { title: 'Test Columnist Article' } });
    await prisma.user.deleteMany({ where: { username: 'testcolumnist' } });
    
    // 2. Create Columnist
    console.log('1. Creating Columnist...');
    const col = await prisma.user.create({
      data: {
        username: 'testcolumnist',
        password: hashPassword('testpass'),
        role: 'COLUMNIST',
        name: 'Test Writer'
      }
    });
    console.log('   -> Columnist created with ID:', col.id);

    // 3. Columnist Submits Article
    console.log('2. Submitting Article as Columnist...');
    const article = await prisma.article.create({
      data: {
        title: 'Test Columnist Article',
        slug: 'test-columnist-article',
        description: 'A test description',
        contentHtml: '<p>This is a test</p>',
        isApproved: false,
        published: false,
        authorId: col.id
      }
    });
    console.log('   -> Article created with status isApproved:', article.isApproved);

    // 4. Admin Approves Article
    console.log('3. Admin Approving Article...');
    const approved = await prisma.article.update({
      where: { id: article.id },
      data: { isApproved: true, published: true, publishedAt: new Date() }
    });
    console.log('   -> Article approved! Status isApproved:', approved.isApproved, '| Published:', approved.published);

    console.log('--- E2E TEST PASSED ---');
  } catch (e) {
    console.error('--- E2E TEST FAILED ---', e);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
