import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============ CREATE 3 BUSINESSES ============
  const businesses = await Promise.all([
    prisma.business.upsert({
      where: { name: 'pestle' },
      update: {},
      create: {
        name: 'pestle',
        displayName: 'Pestle Wholesale Distributor',
        businessType: 'b2b',
        taxId: 'TAX-001',
        waveBusinessId: 'wave-pestle-001',
        email: 'pestle@dallaspuramsantha.com',
        phone: '+1-555-0001',
        address: {
          street: '123 Wholesale Ave',
          city: 'Dallas',
          state: 'TX',
          zip: '75201',
          country: 'USA',
        },
      },
    }),
    prisma.business.upsert({
      where: { name: 'dallaspuram_santha' },
      update: {},
      create: {
        name: 'dallaspuram_santha',
        displayName: 'DallasPuram Santha Online Grocery',
        businessType: 'b2c',
        taxId: 'TAX-002',
        waveBusinessId: 'wave-dps-001',
        email: 'dps@dallaspuramsantha.com',
        phone: '+1-555-0002',
        address: {
          street: '456 Retail Blvd',
          city: 'Dallas',
          state: 'TX',
          zip: '75202',
          country: 'USA',
        },
      },
    }),
    prisma.business.upsert({
      where: { name: 'sloka' },
      update: {},
      create: {
        name: 'sloka',
        displayName: 'Sloka Specialty Foods',
        businessType: 'mixed',
        taxId: 'TAX-003',
        waveBusinessId: 'wave-sloka-001',
        email: 'sloka@dallaspuramsantha.com',
        phone: '+1-555-0003',
        address: {
          street: '789 Specialty Lane',
          city: 'Dallas',
          state: 'TX',
          zip: '75203',
          country: 'USA',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${businesses.length} businesses`);

  // ============ CREATE ADMIN USER PROFILE ============
  const adminProfile = await prisma.profile.upsert({
    where: { id: 'admin-user-001' },
    update: {},
    create: {
      id: 'admin-user-001',
      businessId: businesses[0].id,
      fullName: 'Admin User',
      role: 'admin',
      email: 'admin@dallaspuramsantha.com',
    },
  });

  // Grant admin access to all businesses
  await Promise.all(
    businesses.map((business) =>
      prisma.userBusinessAccess.upsert({
        where: {
          userId_businessId: {
            userId: adminProfile.id,
            businessId: business.id,
          },
        },
        update: {},
        create: {
          userId: adminProfile.id,
          businessId: business.id,
        },
      })
    )
  );

  console.log('✅ Created admin user with access to all businesses');

  // ============ CREATE PRODUCT CATEGORIES ============
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { name: 'Produce' },
      update: {},
      create: { name: 'Produce', description: 'Fresh vegetables and fruits' },
    }),
    prisma.productCategory.upsert({
      where: { name: 'Dairy & Eggs' },
      update: {},
      create: { name: 'Dairy & Eggs', description: 'Milk, cheese, eggs' },
    }),
    prisma.productCategory.upsert({
      where: { name: 'Meat & Seafood' },
      update: {},
      create: { name: 'Meat & Seafood', description: 'Fresh meats and fish' },
    }),
    prisma.productCategory.upsert({
      where: { name: 'Pantry' },
      update: {},
      create: { name: 'Pantry', description: 'Dry goods and staples' },
    }),
  ]);

  console.log(`✅ Created ${categories.length} product categories`);

  // ============ CREATE SAMPLE PRODUCTS ============
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'PROD-TOMATO-001' },
      update: {},
      create: {
        sku: 'PROD-TOMATO-001',
        name: 'Fresh Tomatoes',
        categoryId: categories[0].id,
        unitOfMeasure: 'lb',
        isPerishable: true,
        minStockLevel: 50,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PROD-ONION-001' },
      update: {},
      create: {
        sku: 'PROD-ONION-001',
        name: 'Yellow Onions',
        categoryId: categories[0].id,
        unitOfMeasure: 'lb',
        isPerishable: true,
        minStockLevel: 60,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PROD-LETTUCE-001' },
      update: {},
      create: {
        sku: 'PROD-LETTUCE-001',
        name: 'Romaine Lettuce',
        categoryId: categories[0].id,
        unitOfMeasure: 'each',
        isPerishable: true,
        minStockLevel: 30,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PROD-MILK-001' },
      update: {},
      create: {
        sku: 'PROD-MILK-001',
        name: 'Whole Milk 1L',
        categoryId: categories[1].id,
        unitOfMeasure: 'each',
        isPerishable: true,
        minStockLevel: 40,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} sample products`);

  // ============ CREATE EXPENSE CATEGORIES ============
  const expenseCategories = await Promise.all([
    prisma.expenseCategory.upsert({
      where: { name: 'Utilities & Power' },
      update: {},
      create: {
        name: 'Utilities & Power',
        waveAccountId: 'wave-acc-utilities',
      },
    }),
    prisma.expenseCategory.upsert({
      where: { name: 'Labor & Wages' },
      update: {},
      create: {
        name: 'Labor & Wages',
        waveAccountId: 'wave-acc-labor',
      },
    }),
    prisma.expenseCategory.upsert({
      where: { name: 'Rent & Facilities' },
      update: {},
      create: {
        name: 'Rent & Facilities',
        waveAccountId: 'wave-acc-rent',
      },
    }),
    prisma.expenseCategory.upsert({
      where: { name: 'Delivery & Shipping' },
      update: {},
      create: {
        name: 'Delivery & Shipping',
        waveAccountId: 'wave-acc-delivery',
      },
    }),
    prisma.expenseCategory.upsert({
      where: { name: 'Marketing & Advertising' },
      update: {},
      create: {
        name: 'Marketing & Advertising',
        waveAccountId: 'wave-acc-marketing',
      },
    }),
  ]);

  console.log(`✅ Created ${expenseCategories.length} expense categories`);

  // ============ CREATE SAMPLE VENDORS ============
  const vendors = await Promise.all(
    businesses.map((business) =>
      prisma.vendor.upsert({
        where: {
          id: `vendor-${business.name}`,
        },
        update: {},
        create: {
          id: `vendor-${business.name}`,
          businessId: business.id,
          name: `Fresh Farms Distributor - ${business.displayName}`,
          vendorType: 'wholesale',
          paymentTerms: 'net30',
          preferredPayment: 'ach',
          waveVendorId: `wave-vendor-${business.name}`,
          email: `vendor@freshfarms.com`,
          phone: '+1-555-9999',
        },
      })
    )
  );

  console.log(`✅ Created ${vendors.length} sample vendors`);

  // ============ CREATE SAMPLE CUSTOMERS ============
  const customers = await Promise.all(
    businesses.map((business) =>
      prisma.customer.upsert({
        where: {
          id: `customer-${business.name}`,
        },
        update: {},
        create: {
          id: `customer-${business.name}`,
          businessId: business.id,
          name: `ABC Restaurant (${business.displayName})`,
          customerType: business.businessType === 'b2c' ? 'b2c' : 'b2b',
          email: 'contact@abcrestaurant.com',
          phone: '+1-555-8888',
          creditLimit: 5000,
          paymentTerms: 'net30',
          waveCustomerId: `wave-cust-${business.name}`,
        },
      })
    )
  );

  console.log(`✅ Created ${customers.length} sample customers`);

  // ============ CREATE SAMPLE PRODUCT BATCHES ============
  for (const product of products) {
    await prisma.productBatch.create({
      data: {
        productId: product.id,
        batchNumber: `LOT-2026-05-${Math.floor(Math.random() * 1000)}`,
        supplierId: vendors[0].id,
        receivedDate: new Date('2026-05-01'),
        expirationDate: new Date('2026-06-01'),
        quantityReceived: 100,
        unitCostAtReceipt: Math.random() * 5,
      },
    });
  }

  console.log(`✅ Created ${products.length} product batches`);

  // ============ CREATE SAMPLE INVENTORY ============
  for (const business of businesses) {
    for (const product of products) {
      await prisma.inventory.upsert({
        where: {
          productId_businessId: {
            productId: product.id,
            businessId: business.id,
          },
        },
        update: {},
        create: {
          productId: product.id,
          businessId: business.id,
          quantityOnHand: Math.floor(Math.random() * 200) + 50,
          quantityReserved: Math.floor(Math.random() * 30),
          costPerUnit: Math.random() * 3 + 0.5,
          retailPrice: Math.random() * 5 + 2,
          wholesalePrice: Math.random() * 2.5 + 1,
        },
      });
    }
  }

  console.log(`✅ Created inventory for all businesses and products`);

  console.log('');
  console.log('✅ Database seeding complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - ${businesses.length} businesses created`);
  console.log(`   - ${products.length} products created`);
  console.log(`   - ${categories.length} categories created`);
  console.log(`   - ${expenseCategories.length} expense categories created`);
  console.log(`   - ${vendors.length} vendors created`);
  console.log(`   - ${customers.length} customers created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
