#!/bin/bash
set -e

echo "🚀 DallasPuram Santha CRM - Complete Setup Script"
echo "=================================================="
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Create .env.local
echo "📝 Setting up environment variables..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ Created .env.local - PLEASE UPDATE WITH YOUR CREDENTIALS"
else
  echo "⚠️  .env.local already exists, skipping..."
fi

# Step 3: Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Step 4: Run migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Step 5: Seed database
echo "🌱 Seeding database with initial data..."
npx prisma db seed

# Step 6: Build Next.js
echo "🏗️  Building Next.js application..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Update .env.local with your Wave API token"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3000"
echo ""
