#!/bin/bash

# Setup Redis caching layer
# This script installs Upstash Redis (serverless, no local setup needed)

set -e

echo "🚀 Setting up Redis caching layer..."
echo ""

# Step 1: Install Upstash Redis SDK
echo "📦 Installing @upstash/redis..."
npm install @upstash/redis

# Step 2: Create environment variables file
echo ""
echo "🔑 Creating .env.local with Redis configuration..."

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo "⚠️  .env.local already exists. Backing up to .env.local.bak"
  cp .env.local .env.local.bak
fi

# Check if environment variables are already set
if grep -q "UPSTASH_REDIS_REST_URL" .env.local 2>/dev/null; then
  echo "✅ Redis environment variables already configured"
else
  echo ""
  echo "⏭️  To complete setup, add these to your .env.local:"
  echo ""
  echo "# Redis Caching (from Upstash.com)"
  echo "UPSTASH_REDIS_REST_URL=https://[your-database].upstash.io"
  echo "UPSTASH_REDIS_REST_TOKEN=[your-token]"
  echo ""
  echo "📍 To get these credentials:"
  echo "  1. Go to https://console.upstash.com"
  echo "  2. Create a new Redis database"
  echo "  3. Copy the REST API credentials"
  echo "  4. Add them to .env.local"
  echo ""
fi

echo ""
echo "✅ Redis dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Get Upstash credentials from https://console.upstash.com"
echo "2. Add to .env.local: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
echo "3. Add to Vercel settings the same environment variables"
echo "4. Run: npm run dev"
echo ""
