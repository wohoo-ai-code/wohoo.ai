# wohoo.ai Setup Checklist

Use this checklist to get your landing page live in ~15 minutes.

## ✅ Pre-Launch Checklist

### 1. Database Setup (5 minutes)

- [ ] Open Supabase dashboard
- [ ] Go to SQL Editor
- [ ] Copy contents of `setup-database.sql`
- [ ] Run the SQL script
- [ ] Verify `waitlist` table exists in Database > Tables

### 2. Configure Landing Page (2 minutes)

- [ ] Open `index.html`
- [ ] Find line ~220-221 (search for `YOUR_SUPABASE`)
- [ ] Replace `YOUR_SUPABASE_PROJECT_URL` with your Supabase project URL
- [ ] Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anon key
- [ ] Save the file

### 3. Resend Email Setup (3 minutes)

- [ ] Log into Resend.com
- [ ] Get your API key from Settings
- [ ] (Optional) Add and verify your custom domain
- [ ] Note your sender email (e.g., `hello@wohoo.ai` or `onboarding@resend.dev`)

### 4. Deploy Edge Function (5 minutes)

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login
supabase login

# Link your project (replace with your project ref)
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set FROM_EMAIL=hello@wohoo.ai

# Deploy the function
supabase functions deploy send-welcome-email
```

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Secrets set (RESEND_API_KEY, FROM_EMAIL)
- [ ] Edge function deployed

### 5. Create Database Webhook (2 minutes)

- [ ] Go to Supabase Dashboard > Database > Webhooks
- [ ] Click "Create a new hook"
- [ ] Fill in:
  - Name: `send-welcome-email-trigger`
  - Table: `waitlist`
  - Events: Check "Insert"
  - Type: Edge Function
  - Edge Function: `send-welcome-email`
- [ ] Click "Create webhook"

### 6. Test Everything (3 minutes)

- [ ] Open `index.html` in browser
- [ ] Fill out form with test email
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Check Supabase > Database > waitlist table for new row
- [ ] Check your email (including spam) for welcome email
- [ ] Verify `email_sent` column is `true` in database

### 7. Analytics Setup (Optional, 2 minutes)

#### Google Analytics
- [ ] Create GA4 property
- [ ] Get Measurement ID (G-XXXXXXXXXX)
- [ ] Uncomment analytics code in `index.html` (lines 189-197)
- [ ] Replace `YOUR_GA_ID` with your Measurement ID

#### OR Plausible
- [ ] Sign up at plausible.io
- [ ] Add domain
- [ ] Add script tag to `index.html` head section

### 8. Deploy to Production (5 minutes)

#### Choose one:

**Netlify (Recommended)**
```bash
npm install -g netlify-cli
netlify deploy --dir=. --prod
```
- [ ] Netlify CLI installed
- [ ] Site deployed
- [ ] Custom domain configured (optional)

**Vercel**
```bash
npm install -g vercel
vercel --prod
```
- [ ] Vercel CLI installed
- [ ] Site deployed
- [ ] Custom domain configured (optional)

**GitHub Pages**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/wohooai.git
git push -u origin main
```
- [ ] Repository created
- [ ] Code pushed
- [ ] Pages enabled in Settings > Pages
- [ ] Custom domain configured (optional)

### 9. Domain Configuration (Optional, 10 minutes)

- [ ] DNS records updated at domain registrar
- [ ] CNAME pointing to hosting provider
- [ ] SSL certificate issued (automatic on most platforms)
- [ ] Test `https://wohoo.ai` loads correctly

### 10. Final Checks

- [ ] Landing page loads without errors
- [ ] Form submission works
- [ ] Welcome emails are being sent
- [ ] Privacy and Terms pages load correctly
- [ ] All links work (social media, privacy, terms)
- [ ] Mobile responsive (test on phone)
- [ ] Analytics tracking (if enabled)

## 🎉 You're Live!

### Post-Launch Tasks

- [ ] Share on social media (X, Instagram)
- [ ] Add link to social media bios
- [ ] Monitor Supabase logs for errors
- [ ] Check email deliverability (not going to spam)
- [ ] Set up monitoring/uptime checks

### Ongoing Maintenance

**Weekly:**
- [ ] Check Supabase waitlist table for new signups
- [ ] Review analytics for traffic sources
- [ ] Monitor email delivery success rate

**Monthly:**
- [ ] Export waitlist data (use `export_waitlist_csv()` function)
- [ ] Review referral sources (`get_referral_breakdown()`)
- [ ] Update content/copy based on feedback

## 📊 Useful Queries

**View total signups:**
```sql
SELECT COUNT(*) FROM waitlist;
```

**View recent signups:**
```sql
SELECT name, email, created_at
FROM waitlist
ORDER BY created_at DESC
LIMIT 10;
```

**View analytics:**
```sql
SELECT * FROM waitlist_analytics;
```

**View referral sources:**
```sql
SELECT * FROM get_referral_breakdown();
```

**Export all data:**
```sql
SELECT * FROM export_waitlist_csv();
```

## 🆘 Troubleshooting

**Form not submitting?**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify Supabase credentials in `index.html`

**No welcome emails?**
1. Check Supabase > Functions > send-welcome-email > Logs
2. Verify webhook is triggered (Database > Webhooks)
3. Check Resend dashboard for email logs
4. Verify secrets are set (`supabase secrets list`)

**Email going to spam?**
1. Verify domain in Resend
2. Add SPF, DKIM, DMARC records
3. Test with [mail-tester.com](https://www.mail-tester.com)

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs
- **Tailwind Docs:** https://tailwindcss.com/docs

---

**Questions?** Email hello@wohoo.ai