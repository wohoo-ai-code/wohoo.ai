# wohoo.ai - Quick Production Setup (15 Minutes)

**Fast track to get wohoo.ai live. For detailed instructions, see [PRODUCTION-READY-CHECKLIST.md](PRODUCTION-READY-CHECKLIST.md)**

---

## ⚡ 5-Minute Setup

### 1. Database (2 min)
```bash
# Go to: https://supabase.com/dashboard
# SQL Editor → New Query → Paste setup-database.sql → Run
```

### 2. Configure Frontend (1 min)
Edit [index.html](index.html) lines 506-507:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbG...YOUR_KEY';
```

### 3. Resend Email (2 min)
```bash
# Sign up: https://resend.com
# Copy API key (starts with re_...)
# Use sender: onboarding@resend.dev (for testing)
```

### 4. Deploy Edge Function (3 min)
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set FROM_EMAIL=onboarding@resend.dev
supabase functions deploy send-welcome-email
```

### 5. Create Webhook (1 min)
```
Dashboard → Database → Webhooks → Create:
- Name: send-welcome-email-trigger
- Table: waitlist
- Event: Insert
- Type: Edge Function
- Function: send-welcome-email
```

---

## ✅ Test It

1. Open `index.html` in browser
2. Fill form with your email
3. Submit
4. Check email (including spam)
5. Verify data in Supabase → Database → waitlist

---

## 🚀 Deploy (Pick One)

### Netlify (Easiest)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages (Free)
```bash
git init
git add .
git commit -m "Launch wohoo.ai"
git remote add origin https://github.com/USERNAME/wohooai.git
git push -u origin main
# Then: Settings → Pages → Enable
```

---

## 📊 Google Analytics (Optional, 2 min)

1. Get GA4 Measurement ID from [analytics.google.com](https://analytics.google.com)
2. Add to [index.html](index.html) in `<head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔐 Security Checklist

- [ ] `.env` files in `.gitignore`
- [ ] Service role key NOT in frontend code
- [ ] Only anon key in [index.html](index.html)
- [ ] RLS enabled on waitlist table
- [ ] HTTPS enabled on production

---

## 🎯 Production Checklist

**Before going live:**
- [ ] Supabase credentials configured
- [ ] Database setup complete
- [ ] Edge function deployed
- [ ] Webhook active
- [ ] Resend API key set
- [ ] Test form submission works
- [ ] Test email received
- [ ] Site deployed with SSL
- [ ] Mobile tested
- [ ] Google Analytics installed

---

## 🆘 Troubleshooting

**Form doesn't work:**
- Check browser console (F12)
- Verify Supabase URL/key in index.html

**No emails:**
```bash
supabase functions logs send-welcome-email
supabase secrets list
```

**Still stuck?**
- See detailed guide: [PRODUCTION-READY-CHECKLIST.md](PRODUCTION-READY-CHECKLIST.md)
- Check Supabase Dashboard → Logs

---

## 📈 Next Steps

After launch:
1. Share on social media
2. Monitor analytics daily
3. Check email delivery rate
4. Export waitlist weekly: `SELECT * FROM export_waitlist_csv();`

---

**Need custom domain?** See [PRODUCTION-READY-CHECKLIST.md](PRODUCTION-READY-CHECKLIST.md) → DNS Configuration

**Ready to launch? 🚀**
