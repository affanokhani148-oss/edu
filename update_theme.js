const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updates = {
    colorPrimary: '#2563eb',   // Premium Stripe Blue
    bgPrimary: '#ffffff',      // Pure White
    bgSecondary: '#f8fafc',    // Very light slate
  };

  const upsertPromises = Object.entries(updates).map(([key, value]) => {
    return prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  });

  await Promise.all(upsertPromises);
  console.log('SiteSettings successfully updated to Light SaaS Theme.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
