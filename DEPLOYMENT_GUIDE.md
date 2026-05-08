# DallasPuram Santha CRM - Complete Deployment Guide

## Overview

This guide will get your AI-powered CRM system running in production on Vercel + Supabase with full automation.

**Estimated time**: 30-45 minutes  
**Cost**: Free tier available (scales as you grow)

---

## Phase 1: Create Cloud Accounts (15 minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email: **dallaspuramsantha@gmail.com**
4. Create new project:
   - **Project name**: `DallasPuramSantha-CRM`
   - **Database password**: Generate secure password (save it!)
   - **Region**: Choose closest to Dallas, TX (us-east-1 recommended)
   - **Plan**: Free tier (starts free, scales as needed)

5. Wait for project to initialize (~2 minutes)
6. Once ready, click **"Connection Pooling"** in left sidebar
7. Enable connection pooling (reduces costs)

### Step 2: Get Supabase Credentials
In Supabase dashboard, go to **Settings → Database**:
- Copy **Connection string** → This is your `DATABASE_URL`
- Go to **Project Settings → API**:
  - Copy **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
  - Copy **anon public key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copy **service_role key** → This is your `SUPABASE_SERVICE_ROLE_KEY`

Save all these in a secure file (password manager).

### Step 3: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account (recommended)
3. Connect to GitHub repo: `https://github.com/dkrishnakishor/DallasPuramSantha`

---

## Phase 2: Set Up Database (10 minutes)

### Step 1: Clone & Setup Local Environment
```bash
cd path/to/DallasPuramSantha
cp .env.example .env.local
```

### Step 2: Update .env.local
Edit `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Setup Script
```bash
npm install
npx prisma generate
npx prisma migrate deploy  # Creates all tables
npx prisma db seed         # Fills with sample data
```

### Step 4: Verify Database
Go to Supabase dashboard → **SQL Editor**:
```sql
SELECT COUNT(*) FROM "Business";
-- Should return 3 (Pestle, DPS, Sloka)
```

---

## Phase 3: Deploy to Vercel (15 minutes)

### Step 1: Add Environment Variables to Vercel
1. Go to Vercel dashboard
2. Click your project
3. Go to **Settings → Environment Variables**
4. Add all variables from `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_APP_URL (use your Vercel domain)
```

### Step 2: Enable Auto-Deployment
Vercel automatically deploys when you push to GitHub.

**Deployment happens automatically:**
```
git add .
git commit -m "Initial CRM deployment setup"
git push origin main
```

Wait 2-3 minutes for Vercel to build & deploy.

### Step 3: Verify Deployment
- Go to your Vercel project
- Click the production deployment
- Click **"Visit"** to see live site
- You should see login page

---

## Phase 4: Set Up Anthropic API (Optional - for AI Skills)

If you want AI-powered features:

1. Go to https://console.anthropic.com
2. Sign up for Anthropic account
3. Create API key
4. Add to Vercel environment variables: `ANTHROPIC_API_KEY`
5. Re-deploy

---

## Phase 5: Set Up Wave Integration (Optional)

For invoice sync:

1. Create Wave account at https://www.waveapps.com
2. Go to **Settings → API Keys**
3. Create API token
4. In Wave, create 3 businesses matching yours
5. Add to Vercel environment:
   ```
   WAVE_API_TOKEN
   WAVE_WEBHOOK_SECRET (generate in Wave)
   WAVE_BUSINESS_ID_PESTLE
   WAVE_BUSINESS_ID_DPS
   WAVE_BUSINESS_ID_SLOKA
   ```

---

## Phase 6: First Login & Setup

### Access Your System
```
https://your-vercel-app.vercel.app
```

**Default admin user:**
- Email: admin@dallaspuramsantha.com
- Password: (You'll be prompted to set on first login)

### Initial Setup Tasks
1. ✅ Log in
2. ✅ Verify 3 businesses appear (Pestle, DPS, Sloka)
3. ✅ See sample products and inventory
4. ✅ Check sample customers and vendors
5. ✅ View dashboard

---

## Troubleshooting

### Error: "DATABASE_URL is not set"
- ✅ Check `.env.local` has all variables
- ✅ Verify Vercel environment variables match

### Error: "Could not connect to database"
- ✅ Check DATABASE_URL is correct
- ✅ Verify Supabase project is running
- ✅ Check firewall/network settings

### Error: "Prisma migration failed"
- ✅ Run `npx prisma db push --force-reset` (⚠️ deletes all data)
- ✅ Run `npx prisma migrate deploy` again

### Site is blank/white screen
- ✅ Check browser console for errors (F12)
- ✅ Check Vercel logs (Vercel dashboard → Deployments → Logs)

---

## Scaling Considerations

As you grow:

1. **Database**: Supabase auto-scales (upgrade to Pro plan ~$25/month)
2. **API**: Vercel handles 1000s of requests/month free
3. **Storage**: Supabase includes 1GB free (upload receipts, images)
4. **AI Skills**: Claude API pricing (~$0.01 per analysis)

---

## Backup & Monitoring

### Weekly Database Backup
Supabase automatically backs up daily. To export manually:
```sql
-- In Supabase SQL Editor
pg_dump -h db.supabase.co -U postgres -d postgres > backup.sql
```

### Monitor Logs
- **Vercel logs**: Vercel dashboard → Deployments → Logs
- **Database logs**: Supabase dashboard → Database → Logs
- **API errors**: Check browser console (F12)

---

## Next Steps

Once deployed:

1. **Build Skills** (Week 1-2):
   - Inventory Optimizer skill
   - Profitability Analyst skill
   - Transfer Optimizer skill
   - Expense Categorizer skill

2. **Build Dashboards** (Week 3-4):
   - Batch profitability dashboard
   - Product profitability dashboard
   - Channel profitability dashboard
   - P&L reports by business

3. **Deploy Agents** (Week 5+):
   - Autonomous inventory management
   - Automated profit optimization
   - Continuous AR management

---

## Support & Updates

**Stuck?** Check:
- Vercel logs (deployment errors)
- Browser console (frontend errors)
- Supabase Status page (infrastructure)

**New features?** Push to GitHub and Vercel auto-deploys!

---

## Deployment Checklist

- [ ] Supabase account created
- [ ] Supabase credentials saved
- [ ] Vercel account created
- [ ] GitHub repo connected to Vercel
- [ ] Environment variables added to Vercel
- [ ] Database migrations run
- [ ] Database seeded
- [ ] Vercel deployment successful
- [ ] Site loads in browser
- [ ] Admin user can log in
- [ ] Sample data visible (3 businesses, products, customers)
- [ ] All tests pass

---

**🎉 You're ready to optimize your business!**

For questions or issues, check the error logs and update environment variables as needed.
