import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with 3 test companies...\n');

  // Company 1: Pestle (Food & Beverage)
  const pestle = await prisma.business.upsert({
    where: { name: 'pestle' },
    update: {},
    create: {
      name: 'pestle',
      displayName: 'Pestle Foods',
      businessType: 'food_beverage',
      email: 'contact@pestle.com',
      phone: '+1-555-0001',
      address: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA',
      },
    },
  });
  console.log('✅ Company 1 Created: Pestle Foods');
  console.log(`   ID: ${pestle.id}`);
  console.log(`   Email: ${pestle.email}\n`);

  // Company 2: DallasPuram Santha (Specialty Spices)
  const dallasPuram = await prisma.business.upsert({
    where: { name: 'dallaspuram_santha' },
    update: {},
    create: {
      name: 'dallaspuram_santha',
      displayName: 'DallasPuram Santha',
      businessType: 'specialty_retail',
      email: 'hello@dallaspuramsantha.com',
      phone: '+1-555-0002',
      address: {
        street: '456 Oak Ave',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        country: 'USA',
      },
    },
  });
  console.log('✅ Company 2 Created: DallasPuram Santha');
  console.log(`   ID: ${dallasPuram.id}`);
  console.log(`   Email: ${dallasPuram.email}\n`);

  // Company 3: Sloka (Wellness Products)
  const sloka = await prisma.business.upsert({
    where: { name: 'sloka' },
    update: {},
    create: {
      name: 'sloka',
      displayName: 'Sloka Wellness',
      businessType: 'wellness',
      email: 'info@sloka.com',
      phone: '+1-555-0003',
      address: {
        street: '789 Pine Rd',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        country: 'USA',
      },
    },
  });
  console.log('✅ Company 3 Created: Sloka Wellness');
  console.log(`   ID: ${sloka.id}`);
  console.log(`   Email: ${sloka.email}\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 Seeding Complete! 3 Companies Created');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('📋 Company IDs for Testing:');
  console.log(`  1. Pestle Foods:        ${pestle.id}`);
  console.log(`  2. DallasPuram Santha:  ${dallasPuram.id}`);
  console.log(`  3. Sloka Wellness:      ${sloka.id}\n`);
  console.log('🧪 Use these IDs in API calls:');
  console.log('  curl -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('    http://localhost:3000/api/analytics/batch-profitability?business_id=<ID>');
}

main()
  .then(() => {
    console.log('\n✓ Database seeding successful!');
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
