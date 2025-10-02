# Deployment Guide - MyClinic Admin

This guide will walk you through deploying MyClinic Admin to Vercel with Supabase as the backend.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Your code pushed to a GitHub repository

## Step 1: Set Up Supabase Project

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name**: myclinic-admin (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to finish setting up (2-3 minutes)

### 1.2 Set Up Database Schema

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Open the file `supabase/schema.sql` from your project
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click "Run" to execute the script
6. You should see success messages for all tables, indexes, and policies

### 1.3 Get Your Supabase Credentials

1. In Supabase dashboard, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (long string)
3. Keep these values handy for the next step

## Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/myclinic-admin.git
git push -u origin main
```

### 2.2 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:
     ```
     Name: NEXT_PUBLIC_SUPABASE_URL
     Value: [Your Supabase Project URL]
     
     Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
     Value: [Your Supabase anon public key]
     ```
   - Make sure to select "Production", "Preview", and "Development" for both

6. Click "Deploy"
7. Wait for deployment to complete (1-2 minutes)

### 2.3 Verify Deployment

1. Once deployed, Vercel will provide you with a URL (e.g., `https://myclinic-admin.vercel.app`)
2. Click on the URL to open your application
3. You should see the login page
4. Try creating an account to verify everything works

## Step 3: Configure Custom Domain (Optional)

### 3.1 Add Custom Domain in Vercel

1. In your Vercel project, go to "Settings" → "Domains"
2. Enter your custom domain (e.g., `clinic.yourdomain.com`)
3. Click "Add"
4. Vercel will provide DNS configuration instructions

### 3.2 Update DNS Records

1. Go to your domain provider (GoDaddy, Namecheap, etc.)
2. Add the DNS records as instructed by Vercel:
   - **Type**: A or CNAME
   - **Name**: `@` or your subdomain
   - **Value**: Provided by Vercel
3. Wait for DNS propagation (can take up to 24 hours, usually faster)

### 3.3 Update Supabase Allowed URLs

1. Go to Supabase dashboard → "Authentication" → "URL Configuration"
2. Add your custom domain to:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: `https://yourdomain.com/**`

## Step 4: Post-Deployment Configuration

### 4.1 Test All Features

1. Sign up for a new account
2. Create a test patient
3. Schedule a test appointment
4. Upload a test attachment
5. Export data to Excel/PDF
6. Update your profile
7. Change your password

### 4.2 Set Up Supabase Storage

The schema already created the storage bucket, but verify:

1. In Supabase dashboard, go to "Storage"
2. You should see a bucket named `patient-attachments`
3. If not, create it manually:
   - Click "New bucket"
   - Name: `patient-attachments`
   - Public: No (keep it private)

## Step 5: Monitoring and Maintenance

### 5.1 Monitor Vercel Deployment

- Go to your Vercel project dashboard
- Check the "Analytics" tab for:
  - Page views
  - Performance metrics
  - Error rates

### 5.2 Monitor Supabase Usage

- Go to Supabase dashboard → "Home"
- Check:
  - Database size
  - API requests
  - Storage usage
  - Active users

### 5.3 Set Up Backups

Supabase automatically backs up your database, but you can also:

1. Go to Supabase → "Database" → "Backups"
2. Enable daily backups
3. Configure backup retention period

## Troubleshooting

### Issue: "Failed to fetch" errors

**Solution**: Check that your environment variables are correctly set in Vercel.

```bash
# In Vercel dashboard → Settings → Environment Variables
# Verify both variables are present and correct
```

### Issue: "Not authenticated" errors

**Solution**: Clear browser cache and cookies, then try logging in again.

### Issue: RLS policy errors

**Solution**: Make sure you ran the complete `schema.sql` script in Supabase.

### Issue: Deployment fails

**Solution**: Check Vercel build logs:
1. Go to your project in Vercel
2. Click on the failed deployment
3. Check the "Build Logs" for errors
4. Common fixes:
   - Run `npm install` locally to verify dependencies
   - Check for TypeScript errors: `npm run build`
   - Verify all environment variables are set

### Issue: Slow performance

**Solution**: 
1. Enable Vercel Edge Functions for faster response times
2. Check Supabase query performance in the database dashboard
3. Consider adding database indexes for frequently queried columns

## Alternative Deployment: Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate your Supabase keys** periodically
3. **Enable 2FA** on both Vercel and Supabase accounts
4. **Use strong passwords** for your application accounts
5. **Regularly update dependencies**: `npm audit fix`
6. **Monitor for security alerts** in GitHub

## Scaling Considerations

As your clinic grows:

1. **Supabase**: Upgrade to Pro plan for:
   - More storage (8GB → 100GB)
   - More database size
   - Better support

2. **Vercel**: Upgrade to Pro plan for:
   - Better performance
   - More team members
   - Advanced analytics

3. **Database Optimization**:
   - Add indexes for frequently queried fields
   - Archive old appointments/records
   - Enable database connection pooling

## Support

If you encounter issues:

1. Check the [README.md](./README.md) for basic setup
2. Review Vercel deployment logs
3. Check Supabase dashboard for errors
4. Open an issue on GitHub

## Next Steps

- Set up automated backups
- Configure monitoring alerts
- Add custom branding (logo, colors)
- Set up email notifications (using Supabase functions)
- Implement appointment reminders

---

Congratulations! Your MyClinic Admin application is now live! 🎉
