# Vercel Deployment Guide - wohoo.ai

Complete guide for deploying your wohoo.ai landing page to Vercel.

---

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Git installed locally

---

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub

If not already done, initialize git and push your code:

```bash
cd /Users/robot/Downloads/wohooai

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: wohoo.ai landing page"

# Create a new GitHub repository at https://github.com/new
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/wohooai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`wohooai`)
4. Configure project:
   - **Framework Preset**: Other (or None)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: `./` (leave as default)
5. Click **"Deploy"**

That's it! Vercel will deploy your site in ~30 seconds.

---

## Method 2: Deploy via Vercel CLI (Advanced)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy

```bash
cd /Users/robot/Downloads/wohooai

# First deployment (follow prompts)
vercel

# Production deployment
vercel --prod
```

---

## Project Configuration

Create a `vercel.json` file for optimal configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/(.+\\.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your domain: `wohoo.ai`

### Step 2: Configure DNS

Vercel will show you DNS records to add. Typically:

**For root domain (wohoo.ai):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for DNS Propagation

- Usually takes 5-60 minutes
- Vercel will auto-issue SSL certificate once DNS is verified

---

## Environment Variables (If Needed)

While your Supabase keys are in `index.html` (which is fine for the anon key), if you ever want to move them:

1. Go to **Project Settings** → **Environment Variables**
2. Add variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GA_MEASUREMENT_ID`

Note: For static HTML sites, environment variables don't work the same way as in frameworks like Next.js. You'd need to use a build step or keep them in the HTML file.

---

## Automatic Deployments

Once connected to GitHub:

- **Push to main branch** → Automatic production deployment
- **Push to other branches** → Automatic preview deployment
- **Pull requests** → Preview deployment with unique URL

---

## Performance Optimization

Vercel automatically provides:

- ✅ Global CDN (edge network)
- ✅ Automatic HTTPS/SSL
- ✅ HTTP/2 and HTTP/3
- ✅ Brotli compression
- ✅ Image optimization (for `<img>` tags)
- ✅ DDoS protection
- ✅ 100/100 Lighthouse score potential

---

## Post-Deployment Checklist

### 1. Verify Deployment

Visit your Vercel URL (e.g., `https://wohooai.vercel.app`) and test:

- [ ] Page loads correctly
- [ ] Form submission works
- [ ] Google Analytics tracking fires
- [ ] Supabase connection works
- [ ] Email template triggers correctly

### 2. Update Google Analytics

If you restricted GA to specific domains:

1. Go to [Google Analytics](https://analytics.google.com)
2. Admin → Data Streams → Web
3. Add your Vercel domain to allowed referrers

### 3. Update Supabase CORS (If Needed)

If you get CORS errors:

1. Go to Supabase Dashboard
2. Settings → API → CORS
3. Add your Vercel domain: `https://wohooai.vercel.app`
4. Or use wildcard for Vercel previews: `https://*.vercel.app`

### 4. Test Welcome Email Flow

1. Submit test signup on live site
2. Check Supabase database for new entry
3. Verify welcome email arrives
4. Check Edge Function logs:
   ```bash
   supabase functions logs send-welcome-email --tail
   ```

### 5. Update Privacy Policy

Add Vercel/deployment info to your privacy policy if needed.

---

## Vercel-Specific Files

### .vercelignore

Create `.vercelignore` to exclude files from deployment:

```
# Supabase
supabase/

# Documentation
*.md
!README.md

# Git
.git/
.gitignore

# Scripts
deploy.sh

# Environment
.env*

# Temporary
.temp/
.DS_Store
```

### vercel.json

Already covered above - this is optional but recommended for:
- Security headers
- Cache control
- Routing rules

---

## Deployment Commands

### Deploy to Preview

```bash
vercel
```

This creates a preview deployment with a unique URL.

### Deploy to Production

```bash
vercel --prod
```

This deploys to your production domain.

### Redeploy Latest

```bash
vercel --prod --force
```

Force redeploy without changes.

---

## Monitoring and Analytics

### Vercel Analytics (Optional - Paid Feature)

1. Go to your project → **Analytics** tab
2. Enable Web Analytics
3. Get insights on:
   - Page views
   - Top pages
   - Referrers
   - Devices
   - Countries

**Note**: This is separate from Google Analytics and costs extra.

### Vercel Logs

View deployment and function logs:

1. Project → **Deployments**
2. Click on any deployment
3. View **Building** and **Runtime Logs**

---

## Troubleshooting

### Issue 1: 404 on Deployment

**Symptom**: Vercel deploys but shows 404

**Fix**: Ensure `index.html` is in root directory
```bash
ls -la /Users/robot/Downloads/wohooai/index.html
```

### Issue 2: Form Doesn't Work

**Symptom**: Form submission fails with CORS error

**Fix**: Add Vercel domain to Supabase CORS settings
1. Supabase Dashboard → Settings → API
2. Add: `https://*.vercel.app` and your custom domain

### Issue 3: Email Not Sending

**Symptom**: Form submits but no email received

**Fix**: Check Edge Function logs
```bash
supabase functions logs send-welcome-email --tail
```

Also verify webhook is created in Supabase Dashboard.

### Issue 4: Old Version Showing

**Symptom**: Made changes but old version still live

**Fix 1**: Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

**Fix 2**: Check deployment status in Vercel Dashboard

**Fix 3**: Force redeploy
```bash
vercel --prod --force
```

### Issue 5: Slow Performance

**Symptom**: Page loads slowly

**Fix**:
- Check Vercel Analytics for insights
- Optimize images (use WebP format)
- Ensure `vercel.json` has proper caching headers
- Check Google PageSpeed Insights

---

## Cost

Vercel Free Tier includes:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth per month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Custom domains
- ✅ Edge network

**Your static site will stay on free tier indefinitely.**

---

## Quick Reference Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# View logs
vercel logs <deployment-url>

# Open project in browser
vercel --open
```

---

## Integration with Existing Workflow

### Current Setup
- Supabase Edge Function: Deployed via `./deploy.sh`
- Landing page: Will be on Vercel

### Workflow
1. **Update email template**:
   ```bash
   # Edit supabase/functions/send-welcome-email/index.ts
   ./deploy.sh --skip-secrets
   ```

2. **Update landing page**:
   ```bash
   # Edit index.html
   git add index.html
   git commit -m "Update landing page"
   git push origin main
   # Vercel auto-deploys
   ```

3. **Update both**:
   ```bash
   # Make changes to both files
   ./deploy.sh --skip-secrets  # Deploy Edge Function
   git add .
   git commit -m "Update email and landing page"
   git push origin main        # Auto-deploy to Vercel
   ```

---

## Next Steps After Deployment

1. **Set up monitoring**: Enable Vercel Analytics or use Google Analytics
2. **Configure alerts**: Set up Supabase alerts for database errors
3. **Performance testing**: Run Lighthouse audit
4. **SEO optimization**: Submit sitemap to Google Search Console
5. **Social preview**: Test Open Graph tags (Twitter, Facebook)

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Custom Domains Guide](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Your deployment should be live within 2 minutes of pushing to GitHub!**
