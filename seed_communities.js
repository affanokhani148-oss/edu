const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const comms = await prisma.community.findMany();
  
  for (const c of comms) {
    let updates = {};
    if (c.name.includes('Dawn')) {
      updates = {
        icon: '📰',
        color: '#6366f1',
        featuresJson: JSON.stringify([
          'Daily Editorials & Opinions',
          'Urdu Translation included',
          'Summary & Key Points',
          'Vocabulary & Important Facts',
          'GRE Words Notes',
          'Daily Quiz Attempt',
          'Performance Tracking',
          'Student Dashboard Access'
        ])
      };
    } else if (c.name.includes('Express')) {
      updates = {
        icon: '🗞️',
        color: '#06b6d4',
        featuresJson: JSON.stringify([
          'Daily Editorials & Opinions',
          'Urdu Translation included',
          'Summary & Key Points',
          'Idioms & Pair of Words',
          'GRE Words Notes',
          'Daily Quiz Attempt',
          'Performance Tracking',
          'Student Dashboard Access'
        ])
      };
    } else if (c.name.includes('Essay')) {
      updates = {
        icon: '✍️',
        color: '#f59e0b',
        featuresJson: JSON.stringify([
          'Daily Complete Essay',
          'Urdu Translation included',
          'Essay Summary & Key Points',
          'Important Facts & Vocabulary',
          'Idioms Explanation',
          'Daily Quiz Attempt',
          'Performance Tracking',
          'Student Dashboard Access'
        ])
      };
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.community.update({
        where: { id: c.id },
        data: updates
      });
      console.log(`Updated ${c.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
