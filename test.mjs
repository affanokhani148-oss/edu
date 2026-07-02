import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = 'ali';
  const name = 'ALI';
  const password = 'pass';
  
  console.log('Finding user...');
  const existingUser = await prisma.user.findUnique({ where: { username } });
  
  if (existingUser) {
    console.log('User exists. Updating...');
    const updated = await prisma.user.update({
      where: { username },
      data: { role: 'COLUMNIST', name: name || existingUser.name }
    });
    console.log('Updated:', updated);
  } else {
    console.log('Creating new user...');
    const newUser = await prisma.user.create({
      data: { username, password, role: 'COLUMNIST', name }
    });
    console.log('Created:', newUser);
  }
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
