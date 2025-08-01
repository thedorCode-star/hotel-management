# 🚀 Deployment Guide

## Prerequisites

- ✅ GitHub repository connected to Vercel
- ✅ GitHub secrets configured
- ✅ Production database ready

## Step 1: Set Up Production Database

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database"
3. Choose "Postgres"
4. Select your project: `hotel-management`
5. Copy the connection string

### Option B: Supabase (Free)

1. Go to [Supabase](https://supabase.com)
2. Create account and new project
3. Go to Settings → Database
4. Copy the connection string

### Option C: Railway (Free)

1. Go to [Railway](https://railway.app)
2. Create account and new project
3. Add PostgreSQL service
4. Copy the connection string

## Step 2: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | [Your PostgreSQL connection string] | Production |
| `JWT_SECRET` | `a79e43b2d2b5fd47f7554be7d7f85ce34e79d98fa0032b425a666877b908647f44d33261cd293676c62b441285c73975857fc55360955720995a2c716430300f` | Production |

## Step 3: Deploy Database Schema

Once you have the database URL:

```bash
# Set your database URL
export DATABASE_URL="your-postgresql-connection-string"

# Push the schema
npm run db:push
```

## Step 4: Test Deployment

1. Push to main branch to trigger deployment
2. Check GitHub Actions: https://github.com/thedorCode-star/hotel-management/actions
3. Check Vercel deployment: https://vercel.com/dashboard

## Step 5: Verify Deployment

### Health Check
- Visit: `https://your-app.vercel.app/health`

### API Test
- Visit: `https://your-app.vercel.app/api/test`

### Authentication Test
- Visit: `https://your-app.vercel.app/auth/register`
- Try registering a new user

## Troubleshooting

### Build Errors
- Check if `DATABASE_URL` is set in Vercel
- Ensure `JWT_SECRET` is configured
- Verify GitHub secrets are correct

### Database Connection Issues
- Test connection string locally
- Check database permissions
- Verify network access

### Deployment Issues
- Check GitHub Actions logs
- Verify Vercel project settings
- Ensure all environment variables are set

## Production Checklist

- ✅ Database configured
- ✅ Environment variables set
- ✅ GitHub secrets configured
- ✅ CI/CD pipeline working
- ✅ Health check passing
- ✅ API routes working
- ✅ Authentication working

## Next Steps

1. Set up monitoring (Vercel Analytics)
2. Configure custom domain
3. Set up backup strategy
4. Implement logging
5. Add error tracking (Sentry) 