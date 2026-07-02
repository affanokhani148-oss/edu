const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  // Ensure admin has ADMIN role
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { role: 'ADMIN' },
    create: {
      username: 'admin',
      password: hashPassword('admin123'),
      role: 'ADMIN',
      name: 'System Admin',
    },
  });

  // Communities
  const communitiesData = [
    { name: 'Dawn Community', description: 'Daily Dawn editorials, vocabulary, GRE words', icon: '📰' },
    { name: 'Express Tribune Community', description: 'Daily Express Tribune editorials and notes', icon: '🗞️' },
    { name: 'Essay Community', description: 'Daily essays with translation and key points', icon: '✍️' },
    { name: 'GRE Words', description: 'Daily GRE vocabulary notes', icon: '📚' },
    { name: 'Idioms', description: 'Idioms notes and explanations', icon: '💬' },
    { name: 'Pair of Words', description: 'Pair of words practice', icon: '🔤' },
  ];

  for (const c of communitiesData) {
    await prisma.community.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  const dawn = await prisma.community.findUnique({ where: { name: 'Dawn Community' } });

  // Update existing article to be public
  await prisma.article.updateMany({
    where: { slug: 'quantum-computing-future' },
    data: {
      isPublic: true,
      published: true,
      communityId: dawn.id,
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    },
  });

  console.log('✅ Database seeded successfully with LMS data');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
