import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const columnists = await prisma.user.findMany({
    where: { role: 'COLUMNIST' },
    include: {
      articles: { select: { id: true } }
    },
    orderBy: { joiningDate: 'desc' }
  });
  console.log(columnists);
}

main().catch(console.error).finally(() => prisma.$disconnect());
