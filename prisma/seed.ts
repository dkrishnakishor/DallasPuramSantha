import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with minimal test data...');

  // Create a test business
  const business = await prisma.business.upsert({
    where: { name: 'test_business' },
    update: {},
    create: {
      name: 'test_business',
      displayName: 'Test Business',
      businessType: 'test',
      email: 'test@example.com',
    },
  });

  console.log('✅ Seeding complete');
  console.log(`Business ID: ${business.id}`);
}

main()
  .then(() => {
    console.log('Disconnecting...');
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Seeding failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
