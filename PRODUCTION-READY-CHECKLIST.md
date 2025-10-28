# wohoo.ai Production Deployment Checklist

Complete guide to make wohoo.ai production-ready with all necessary configurations for Supabase, Resend, Google Analytics, and deployment.

---

## 🔐 Security & Environment Setup

### 1. Supabase Configuration (CRITICAL)

**Current State:** Placeholder values in [index.html:506-507](index.html#L506-L507)

#### Tasks:
- [ ] Log into your [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Navigate to **Settings** → **API**
- [ ] Copy your **Project URL** (format: `https://xxxxxxxxxxxxx.supabase.co`)
- [ ] Copy your **anon/public** key (starts with `eyJ...`)
- [ ] Copy your **service_role** key (keep this secret!)
- [ ] Open [index.html](index.html) and replace lines 506-507:
  ```javascript
  const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  ```
- [ ] **Important:** NEVER commit the service_role key to git

#### Verify:
```bash
# Test that credentials work by opening index.html and checking console
# Should see no Supabase connection errors
```

---

### 2. Database Setup

**Current State:** SQL schema exists in [setup-database.sql](setup-database.sql)

#### Tasks:
- [ ] Go to Supabase Dashboard → **SQL Editor**
- [ ] Click **New Query**
- [ ] Copy entire contents of `setup-database.sql`
- [ ] Paste and click **Run**
- [ ] Verify no errors in output
- [ ] Navigate to **Database** → **Tables**
- [ ] Confirm `waitlist` table exists with these columns:
  - id (uuid)
  - name (text)
  - email (text, unique)
  - phone (text)
  - referral_source (text)
  - metadata (jsonb)
  - email_sent (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)

#### Verify:
- [ ] Row Level Security (RLS) is enabled on waitlist table
- [ ] Policy `Allow public inserts` exists and is enabled
- [ ] Indexes exist: `idx_waitlist_email`, `idx_waitlist_created_at`

---

### 3. Resend Email Service Setup

**Current State:** API key needed in Edge Function environment

#### Option A: Quick Start (Testing)
- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Go to **API Keys** in dashboard
- [ ] Click **Create API Key**
- [ ] Name it: `wohoo-production`
- [ ] Copy the key (starts with `re_...`)
- [ ] Use sender: `onboarding@resend.dev` (Resend's test domain)

#### Option B: Production (Custom Domain - RECOMMENDED)
- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Go to **Domains** → **Add Domain**
- [ ] Enter your domain: `wohoo.ai`
- [ ] Add these DNS records at your domain registrar:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | @ | feedback-smtp.us-east-1.amazonses.com | 10 |
| TXT | @ | v=spf1 include:amazonses.com ~all | - |
| CNAME | resend._domainkey | resend._domainkey.resend.com | - |

- [ ] Wait for verification (5-30 minutes)
- [ ] Status shows **Verified** in Resend dashboard
- [ ] Create API key as in Option A
- [ ] Choose sender email: `hello@wohoo.ai` or `team@wohoo.ai`

#### Critical Notes:
- Resend free tier: 100 emails/day, 3,000/month
- Production domain improves deliverability significantly
- Keep API key secret - never commit to git

---

### 4. Deploy Supabase Edge Function

**Current State:** Function code exists in [supabase/functions/send-welcome-email/index.ts](supabase/functions/send-welcome-email/index.ts)

#### Prerequisites:
```bash
# Install Supabase CLI
npm install -g supabase

# Or with Homebrew (Mac)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

#### Tasks:
```bash
# 1. Login to Supabase
supabase login

# 2. Get your project ref from dashboard URL:
# https://supabase.com/dashboard/project/YOUR_PROJECT_REF

# 3. Link your project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Set environment secrets (CRITICAL)
supabase secrets set RESEND_API_KEY=re_your_actual_key_here
supabase secrets set FROM_EMAIL=hello@wohoo.ai

# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-set
# But verify they exist:
supabase secrets list

# 5. Deploy the function
cd /Users/robot/Downloads/wohooai
supabase functions deploy send-welcome-email

# 6. Verify deployment
# Should see: "Deployed Function send-welcome-email version X"
```

#### Checklist:
- [ ] Supabase CLI installed
- [ ] Logged in (`supabase login`)
- [ ] Project linked
- [ ] `RESEND_API_KEY` secret set
- [ ] `FROM_EMAIL` secret set
- [ ] Function deployed successfully
- [ ] No errors in deployment output

#### Verify:
```bash
# Check function logs
supabase functions logs send-welcome-email

# Test function manually
curl -i --location --request POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"record":{"id":"test-id","name":"Test User","email":"your-email@example.com","email_sent":false}}'
```

---

### 5. Create Database Webhook Trigger

**Current State:** Needs manual setup in Supabase Dashboard

#### Tasks:
- [ ] Go to Supabase Dashboard → **Database** → **Webhooks**
- [ ] Click **Enable Webhooks** (if not already enabled)
- [ ] Click **Create a new hook**
- [ ] Fill in the form:

  **Name:** `send-welcome-email-trigger`

  **Table:** `waitlist`

  **Events:** Check **Insert** only

  **Type:** Select **Supabase Edge Function**

  **Edge Function:** Select `send-welcome-email`

  **HTTP Headers:** Leave default

  **Timeout:** 5000 (5 seconds)

- [ ] Click **Create webhook**
- [ ] Status should show **Active**

#### Verify:
- [ ] Webhook appears in list with status **Active**
- [ ] Event shows **INSERT**
- [ ] Function shows **send-welcome-email**

---

### 6. Google Analytics Setup

**Current State:** No analytics configured in [index.html](index.html)

#### Get GA4 Measurement ID:
- [ ] Go to [analytics.google.com](https://analytics.google.com)
- [ ] Create account (if needed)
- [ ] Click **Admin** (bottom left)
- [ ] Click **Create Property**
- [ ] Property name: `wohoo.ai`
- [ ] Select timezone and currency
- [ ] Click **Next** → **Create**
- [ ] Choose **Web** platform
- [ ] Website URL: `https://wohoo.ai`
- [ ] Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

#### Add to Website:
- [ ] Open [index.html](index.html)
- [ ] Add this code in the `<head>` section (after line 12):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

- [ ] Replace `G-XXXXXXXXXX` with your actual Measurement ID (both occurrences)

#### Optional: Enhanced Event Tracking
Add custom events for better insights:

```javascript
// Add after the supabase client initialization (around line 508)

// Track form field interactions
document.getElementById('name').addEventListener('focus', () => {
  gtag('event', 'form_start', {
    'event_category': 'engagement',
    'event_label': 'name_field'
  });
});

// Track successful signups
// Modify the success handler in form submission (around line 631)
gtag('event', 'signup', {
  'event_category': 'conversion',
  'event_label': 'waitlist_join'
});
```

#### Verify:
- [ ] Open [Google Analytics Realtime Report](https://analytics.google.com/analytics/web/#/realtime)
- [ ] Open your website in another tab
- [ ] Should see 1 active user in GA Realtime
- [ ] Submit test form
- [ ] Should see `signup` event in Events tab

---

### 7. Environment Variables & Secrets Summary

Create a `.env.example` file for documentation (DO NOT commit actual values):

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=hello@wohoo.ai

# Google Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Domain
PRODUCTION_URL=https://wohoo.ai
```

#### Security Checklist:
- [ ] `.gitignore` includes `.env` and `.env.local`
- [ ] Service role key is NEVER in frontend code
- [ ] Only anon key is in [index.html](index.html)
- [ ] Resend API key is only in Supabase secrets
- [ ] All secrets stored in Supabase Edge Function secrets

---

## 🧪 Testing Everything

### End-to-End Test

#### Local Testing:
- [ ] Open [index.html](index.html) in browser
- [ ] Open browser console (F12) - should see no errors
- [ ] Fill out waitlist form:
  - Name: "Test User"
  - Email: your-actual-email@example.com
  - Phone: "+1234567890" (optional)
- [ ] Click **Join Waitlist**
- [ ] Should see success message: "You're on the list!"
- [ ] Form should clear

#### Backend Verification:
- [ ] Go to Supabase Dashboard → **Database** → **Table Editor** → **waitlist**
- [ ] Should see new row with your test data
- [ ] `email_sent` should be `true`
- [ ] Check your email inbox (and spam folder)
- [ ] Should receive welcome email with correct branding

#### Edge Function Logs:
- [ ] Go to Supabase Dashboard → **Edge Functions** → **send-welcome-email** → **Logs**
- [ ] Should see log entry like:
  ```
  Email sent successfully: { id: '...' }
  Successfully marked email as sent for user: ...
  ```

#### Error Testing:
- [ ] Try submitting same email again
- [ ] Should see error: "This email is already on the waitlist!"
- [ ] Try invalid email format
- [ ] Should see validation error

### Email Deliverability Test

- [ ] Send test email to yourself
- [ ] Check if it lands in inbox (not spam)
- [ ] If in spam, test with [mail-tester.com](https://www.mail-tester.com):
  - Get test address from mail-tester
  - Add to waitlist
  - Check score (should be 8+/10)
  - Fix any issues shown

---

## 🚀 Production Deployment

### Choose Your Hosting Provider

#### Option A: Netlify (RECOMMENDED - Easiest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (from project directory)
cd /Users/robot/Downloads/wohooai
netlify deploy --prod

# Follow prompts:
# - Create new site: Yes
# - Site name: wohoo-ai (or leave blank for random)
# - Publish directory: . (current directory)
```

**Checklist:**
- [ ] Netlify CLI installed
- [ ] Logged in to Netlify
- [ ] Site deployed successfully
- [ ] Copy deployment URL (format: `https://wohoo-ai.netlify.app`)
- [ ] Test site is live and working
- [ ] Forms submit successfully

**Custom Domain Setup:**
- [ ] Go to Netlify Dashboard → **Domain Settings**
- [ ] Click **Add custom domain**
- [ ] Enter: `wohoo.ai`
- [ ] Follow DNS setup instructions
- [ ] Add CNAME record at your registrar:
  ```
  CNAME @ wohoo-ai.netlify.app
  ```
- [ ] Wait for SSL certificate (automatic, ~1 hour)
- [ ] Test `https://wohoo.ai` loads correctly

---

#### Option B: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd /Users/robot/Downloads/wohooai
vercel --prod
```

**Custom Domain:**
- [ ] Go to Vercel Dashboard → **Settings** → **Domains**
- [ ] Add domain: `wohoo.ai`
- [ ] Add CNAME: `cname.vercel-dns.com`
- [ ] Verify and wait for SSL

---

#### Option C: Cloudflare Pages

- [ ] Go to [pages.cloudflare.com](https://pages.cloudflare.com)
- [ ] Connect GitHub repository (or upload directly)
- [ ] Set build command: (leave empty)
- [ ] Set output directory: (leave empty)
- [ ] Deploy
- [ ] Add custom domain in Pages settings

---

#### Option D: GitHub Pages (Free)

```bash
# Initialize git (if not already)
cd /Users/robot/Downloads/wohooai
git init

# Add files
git add .

# Commit
git commit -m "Production ready: wohoo.ai landing page"

# Create GitHub repo (do this on GitHub.com first)
# Then link it:
git remote add origin https://github.com/yourusername/wohooai.git

# Push
git branch -M main
git push -u origin main
```

**Enable GitHub Pages:**
- [ ] Go to repository **Settings** → **Pages**
- [ ] Source: **Deploy from a branch**
- [ ] Branch: **main** / **root**
- [ ] Click **Save**
- [ ] Wait 2-5 minutes
- [ ] Site available at: `https://yourusername.github.io/wohooai/`

**Custom Domain:**
- [ ] In Pages settings, add custom domain: `wohoo.ai`
- [ ] Create CNAME file in repo root:
  ```bash
  echo "wohoo.ai" > CNAME
  git add CNAME
  git commit -m "Add custom domain"
  git push
  ```
- [ ] Add DNS record at registrar:
  ```
  CNAME www yourusername.github.io
  A @ 185.199.108.153
  A @ 185.199.109.153
  A @ 185.199.110.153
  A @ 185.199.111.153
  ```

---

### DNS Configuration (All Providers)

#### At Your Domain Registrar (GoDaddy, Namecheap, etc.):

**For Netlify:**
```
Type  Name  Value
CNAME @     your-site.netlify.app
CNAME www   your-site.netlify.app
```

**For Vercel:**
```
Type  Name  Value
CNAME @     cname.vercel-dns.com
CNAME www   cname.vercel-dns.com
```

**For Cloudflare Pages:**
```
Use Cloudflare's nameservers (provided during setup)
```

**For GitHub Pages:**
```
Type  Name  Value
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   yourusername.github.io
```

#### Verification:
- [ ] Wait 1-24 hours for DNS propagation
- [ ] Check DNS with: `dig wohoo.ai`
- [ ] SSL certificate issued automatically
- [ ] `https://wohoo.ai` loads correctly
- [ ] `https://www.wohoo.ai` redirects to main domain

---

## 🔍 Post-Deployment Verification

### Functionality Checklist

- [ ] **Homepage loads:** `https://wohoo.ai`
- [ ] **Privacy page:** `https://wohoo.ai/privacy.html`
- [ ] **Terms page:** `https://wohoo.ai/terms.html`
- [ ] **SSL certificate valid** (green lock icon)
- [ ] **Form submission works**
- [ ] **Welcome emails send**
- [ ] **No console errors** (F12 → Console)
- [ ] **No network errors** (F12 → Network)
- [ ] **Google Analytics tracking** (check GA Realtime)

### Mobile Testing

- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Form works on mobile
- [ ] All text readable (no tiny fonts)
- [ ] Buttons easily tappable
- [ ] Stars animation performs well
- [ ] No horizontal scrolling

### Browser Testing

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Performance Testing

- [ ] Run [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Score should be 90+ on all metrics
- [ ] Run [Lighthouse](https://developers.google.com/web/tools/lighthouse) audit
- [ ] Check loading time < 3 seconds

### SEO Verification

- [ ] Title tag exists: "wohoo.ai - Boarding Pass. Delivered."
- [ ] Meta description exists
- [ ] Open Graph tags (for social sharing)
- [ ] Favicon present
- [ ] Sitemap.xml (optional)
- [ ] robots.txt (optional)

---

## 📊 Analytics & Monitoring

### Google Analytics Setup Complete

- [ ] Real-time tracking works
- [ ] Events tracked: `signup`, `form_start`
- [ ] Goals configured for conversions
- [ ] Referral sources tracked

### Monitoring Setup (Recommended)

#### UptimeRobot (Free tier: 50 monitors)
- [ ] Sign up at [uptimerobot.com](https://uptimerobot.com)
- [ ] Add monitor for: `https://wohoo.ai`
- [ ] Check interval: 5 minutes
- [ ] Alert via email if down

#### Supabase Monitoring
- [ ] Set up email alerts in Supabase Dashboard
- [ ] Monitor Edge Function errors
- [ ] Set up log retention

### Weekly Monitoring Tasks

**Check these weekly:**
- [ ] Total waitlist signups: `SELECT COUNT(*) FROM waitlist;`
- [ ] Email delivery rate: Check `email_sent` column
- [ ] Resend email logs: Any bounces/spam reports?
- [ ] Google Analytics: Traffic sources, bounce rate
- [ ] Supabase usage: API calls, storage
- [ ] Resend usage: Email count (stay under limits)

---

## 🛡️ Security Hardening

### Supabase Security

- [ ] Row Level Security (RLS) enabled on waitlist table
- [ ] Only INSERT policy enabled for public
- [ ] Service role key secured (not in frontend)
- [ ] Anon key has minimal permissions
- [ ] API rate limiting enabled (Supabase Dashboard → Settings → API)

### Content Security

- [ ] HTTPS enforced (no mixed content)
- [ ] No sensitive data in JavaScript
- [ ] Forms sanitized (Supabase handles this)
- [ ] SQL injection protected (Supabase handles this)

### Resend Security

- [ ] API key not exposed in frontend
- [ ] SPF, DKIM, DMARC records configured (if custom domain)
- [ ] Email rate limiting (Resend free tier)

### Rate Limiting (Optional but Recommended)

Add Cloudflare in front of your site:
- [ ] Add site to Cloudflare
- [ ] Enable **Under Attack Mode** if getting spam
- [ ] Set up **Rate Limiting** rules (5 requests/minute per IP to form)
- [ ] Enable **Bot Fight Mode**

---

## 📋 Pre-Launch Final Checklist

### Code & Configuration

- [x] UI matches design requirements (blue theme)
- [ ] Supabase credentials in [index.html](index.html)
- [ ] Database created with all tables
- [ ] Edge function deployed
- [ ] Webhook configured and active
- [ ] Resend API key set
- [ ] Google Analytics installed
- [ ] Privacy & Terms pages complete
- [ ] No `TODO` or `FIXME` comments in code
- [ ] No console.log in production code (or commented out)

### Testing

- [ ] Form submission works
- [ ] Welcome email received
- [ ] Duplicate email prevention works
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Analytics tracking confirmed
- [ ] All links work (social, privacy, terms)
- [ ] Email deliverability tested (not spam)

### Deployment

- [ ] Site deployed to hosting provider
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS propagated
- [ ] Redirects working (www → non-www or vice versa)

### Monitoring

- [ ] Uptime monitoring configured
- [ ] Google Analytics real-time shows data
- [ ] Error logging configured
- [ ] Email alerts configured

---

## 🚦 Go-Live Checklist

**On Launch Day:**

1. **Final Test** (Morning of Launch)
   - [ ] Submit test form
   - [ ] Receive welcome email
   - [ ] Check all links work

2. **Announce** (Social Media)
   - [ ] Post on X (Twitter): Share link
   - [ ] Post on Instagram: Link in bio
   - [ ] Update LinkedIn
   - [ ] Email existing contacts

3. **Monitor** (First 24 Hours)
   - [ ] Check Google Analytics every 2 hours
   - [ ] Monitor Supabase function logs
   - [ ] Check Resend email logs
   - [ ] Watch for errors

4. **Respond**
   - [ ] Reply to comments/questions
   - [ ] Fix any urgent bugs immediately
   - [ ] Thank early adopters

---

## 🔧 Maintenance & Optimization

### Daily (First Week)
- [ ] Check signups count
- [ ] Monitor email delivery rate
- [ ] Review any error logs
- [ ] Respond to user emails at hello@wohoo.ai

### Weekly
- [ ] Export waitlist data: `SELECT * FROM export_waitlist_csv();`
- [ ] Review analytics: Traffic sources, conversion rate
- [ ] Check uptime reports
- [ ] Plan improvements based on feedback

### Monthly
- [ ] Review hosting costs (should be $0 or near $0)
- [ ] Check Supabase usage (free tier limits)
- [ ] Review Resend usage (3,000/month limit)
- [ ] Update content if needed
- [ ] A/B test CTA copy

### Quarterly
- [ ] Major feature updates based on feedback
- [ ] SEO optimization
- [ ] Performance audit
- [ ] Security review

---

## 📞 Support & Resources

### Key Services Dashboard Links
- **Supabase:** https://supabase.com/dashboard
- **Resend:** https://resend.com/emails
- **Google Analytics:** https://analytics.google.com
- **Hosting Provider:** (Netlify/Vercel/etc.)

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Google Analytics 4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)

### Troubleshooting

**Issue: Form not submitting**
```javascript
// Check console for errors
// Verify Supabase credentials:
console.log('URL:', SUPABASE_URL);
console.log('Key prefix:', SUPABASE_ANON_KEY.substring(0, 20));
```

**Issue: Emails not sending**
```bash
# Check Edge Function logs
supabase functions logs send-welcome-email --tail

# Check secrets are set
supabase secrets list
```

**Issue: High spam rate**
- Verify domain in Resend
- Add SPF, DKIM, DMARC DNS records
- Test with mail-tester.com
- Warm up sending (start slow, ramp up)

---

## ✅ Success Criteria

**You're production-ready when:**

1. ✅ Landing page loads on `https://wohoo.ai` with SSL
2. ✅ Users can submit form and see success message
3. ✅ Welcome emails arrive in inbox (not spam)
4. ✅ Google Analytics shows real-time traffic
5. ✅ Monitoring alerts configured
6. ✅ Mobile works perfectly
7. ✅ All tests pass
8. ✅ No errors in logs
9. ✅ Privacy & Terms accessible
10. ✅ Social links work

---

## 🎉 Launch!

When all checkboxes above are complete:

1. Share on social media
2. Add to bio links
3. Start marketing campaigns
4. Monitor closely for first 48 hours
5. Iterate based on feedback

**Good luck with your launch! 🚀**

---

**Questions or Issues?**
- Email: hello@wohoo.ai
- Check logs: Supabase Dashboard → Edge Functions → Logs
- Review this checklist for missed steps
