# Deployment Guide

This guide will walk you through deploying HOA Scout to Vercel (recommended) or other platforms.

## Deploy to Vercel (Recommended)

Vercel is the recommended deployment platform as it's built by the creators of Next.js and provides optimal performance.

### Prerequisites

- GitHub account
- Vercel account (free tier works great)
- All API keys ready (Supabase, Anthropic, Yelp, Google Maps)

### Step 1: Push to GitHub

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub and push
git remote add origin https://github.com/yourusername/hoa-scout.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### Step 3: Configure Environment Variables

Add these environment variables in Vercel:

#### Supabase Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### API Keys
```
ANTHROPIC_API_KEY=your_anthropic_api_key
YELP_API_KEY=your_yelp_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Important**: Make sure to add these to ALL environments (Production, Preview, Development)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Set Up Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

### Step 6: Verify Deployment

Test your deployment:

1. Visit your deployed URL
2. Try searching for an HOA using the demo addresses
3. Check that all features work:
   - Address search
   - Report generation
   - Yelp neighborhood data
   - Score displays

## Environment-Specific Configuration

### Production

- Ensure all API keys are production keys
- Enable error logging/monitoring
- Set up analytics (Vercel Analytics is built-in)

### Preview (Staging)

- Vercel automatically creates preview deployments for pull requests
- Use the same environment variables as production
- Great for testing before merging

## Post-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] Supabase RLS policies are active
- [ ] Test search functionality
- [ ] Test report generation
- [ ] Verify Yelp integration works
- [ ] Check mobile responsiveness
- [ ] Test all navigation links
- [ ] Verify error pages (404, 500)
- [ ] Run Lighthouse audit (should score 90+)

## Monitoring and Maintenance

### Vercel Analytics

Vercel provides built-in analytics:
- Page views
- Unique visitors
- Performance metrics

Access at: `https://vercel.com/[your-username]/[your-project]/analytics`

### Error Monitoring

For production, consider adding:
- [Sentry](https://sentry.io/) for error tracking
- Supabase database logs
- API usage monitoring (already tracked in `api_usage` table)

### Cost Monitoring

Keep an eye on:
- **Vercel**: Free tier includes 100GB bandwidth
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth
- **Anthropic Claude**: Pay per token (~$0.003/1K tokens)
- **Yelp**: Free tier includes 5,000 requests/day
- **Google Maps**: $200 free credit/month

Our caching strategy minimizes API costs:
- Yelp data cached for 7 days
- HOA reports cached for 30 days

### Database Backups

Supabase automatically backs up your database, but you can also:

```bash
# Export your database manually
pg_dump -h [your-supabase-host] -U postgres -d postgres > backup.sql
```

## Troubleshooting Deployment Issues

### Build Fails

**Error: Missing environment variables**
- Ensure all required env vars are set in Vercel
- Check for typos in variable names

**Error: Module not found**
- Run `npm install` locally to verify dependencies
- Check that all imports use correct paths

### Runtime Errors

**500 Error on API calls**
- Check Vercel Function Logs
- Verify API keys are correct
- Check Supabase connection

**Supabase Connection Failed**
- Verify Supabase project is not paused
- Check RLS policies are set up
- Verify environment variables

### Performance Issues

**Slow page loads**
- Check Vercel Analytics for bottlenecks
- Verify images are optimized
- Check for large bundle sizes

**API timeouts**
- Increase function timeout in `next.config.js`
- Optimize database queries
- Add more caching

## Alternative Deployment Platforms

### Deploy to Netlify

1. Push to GitHub
2. Import project to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables

### Deploy to Railway

1. Create new project in Railway
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically on push

### Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Continuous Deployment

Vercel automatically deploys:
- **Main branch** → Production
- **Pull requests** → Preview deployments
- **Other branches** → Preview deployments

To disable auto-deployment:
1. Go to Project Settings
2. Git → Deployment Protection
3. Configure as needed

## Rolling Back

If you need to rollback a deployment:

1. Go to Deployments in Vercel
2. Find the previous successful deployment
3. Click "..." → "Promote to Production"

## Support

If you encounter issues:
- Check Vercel's deployment logs
- Review Supabase logs
- Open an issue on GitHub
- Contact Vercel support (if using paid plan)

---

**Ready to deploy?** Just run through Steps 1-4 above and you'll be live in minutes! 🚀