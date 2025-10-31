# GoDaddy DNS Configuration for Vercel - wohoo.ai

## Issue: "Record name www conflicts with another record"

This means GoDaddy already has a `www` record configured. You need to replace it with Vercel's.

---

## Step-by-Step Fix

### 1. Access DNS Settings

1. Login to [GoDaddy](https://www.godaddy.com)
2. Go to **My Products**
3. Find `wohoo.ai` domain
4. Click **DNS** button (or **Manage DNS**)

### 2. Find Conflicting Record

Look in the DNS records list for:

```
Type: CNAME
Name: www
Points to: (probably @ or some parking page)
```

### 3. Delete the Old Record

- Click the **trash/delete icon** next to the `www` record
- Confirm deletion
- Wait 30 seconds for the page to refresh

### 4. Add Vercel's CNAME Record

Click **Add** and enter:

| Field | Value |
|-------|-------|
| Type | CNAME |
| Name | www |
| Value | cname.vercel-dns.com |
| TTL | 600 seconds (or 1 hour) |

Click **Save**

---

## Complete DNS Configuration for Vercel

### Required Records:

#### For Root Domain (wohoo.ai)

**Option A: A Record (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600
```

**Option B: ANAME/ALIAS (if GoDaddy supports it)**
```
Type: ANAME
Name: @
Value: cname.vercel-dns.com
TTL: 600
```

#### For WWW Subdomain (www.wohoo.ai)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 600
```

---

## Alternative: Use Only Root Domain

If you want to skip the www subdomain entirely:

1. **Skip the www CNAME** - don't add it
2. **In Vercel Dashboard**:
   - Go to your project → Settings → Domains
   - Only add `wohoo.ai` (without www)
   - Vercel will auto-redirect www → non-www if someone types it

---

## Troubleshooting

### Issue: "A record already exists for @"

**Solution**: GoDaddy has a default parking A record. You need to:

1. Find the existing A record with Name `@`
2. **Edit** it (don't delete and create new)
3. Change the IP to `76.76.21.21`
4. Save

### Issue: Multiple A Records for @

GoDaddy sometimes creates multiple A records. You should:

1. **Delete ALL existing A records** with Name `@`
2. Create **ONE new A record**:
   - Name: `@`
   - Value: `76.76.21.21`

### Issue: DNS Changes Not Taking Effect

**Wait Time**: DNS propagation can take:
- Minimum: 5-10 minutes
- Typical: 30-60 minutes
- Maximum: 24-48 hours (rare)

**Check propagation**:
```bash
# Check current DNS
dig wohoo.ai
dig www.wohoo.ai

# Or use online tool
# https://www.whatsmydns.net/#A/wohoo.ai
```

### Issue: GoDaddy "Domain Forwarding" is Enabled

If you have "Domain Forwarding" turned on, it will conflict with Vercel:

1. Go to GoDaddy → Domain Settings
2. Find **Forwarding** section
3. **Delete** or **Disable** any forwarding rules
4. Now add the A and CNAME records

---

## What Each Record Does

### A Record (@)
- Points root domain `wohoo.ai` directly to Vercel's server
- IP: `76.76.21.21` is Vercel's Anycast IP
- Users visiting `wohoo.ai` will reach your site

### CNAME Record (www)
- Points `www.wohoo.ai` to Vercel's CDN
- `cname.vercel-dns.com` automatically routes to your deployment
- Users visiting `www.wohoo.ai` will reach your site

---

## Final DNS Configuration (Summary)

After setup, your DNS should look like this:

```
Type    Name    Value                       TTL
----    ----    -----                       ---
A       @       76.76.21.21                 600
CNAME   www     cname.vercel-dns.com        600
```

**Optional records** (if you have them, keep them):
```
MX      @       Your email provider         Priority 10
TXT     @       SPF/DKIM records           600
```

---

## Verification

### 1. In Vercel Dashboard

After DNS is configured:

1. Go to Vercel → Your Project → Settings → Domains
2. You should see:
   - `wohoo.ai` - ✅ Valid Configuration
   - `www.wohoo.ai` - ✅ Valid Configuration

### 2. Test in Browser

```
https://wohoo.ai        → Should load your site
https://www.wohoo.ai    → Should load your site
```

### 3. Check SSL Certificate

Vercel auto-issues SSL within 5-30 minutes of DNS validation.

---

## Common GoDaddy-Specific Notes

### Default Records to Keep

GoDaddy adds these by default - **keep them**:
- NS records (nameservers)
- SOA record

### Records to Delete/Replace

- A record pointing to GoDaddy parking (replace with Vercel's)
- CNAME www pointing to @ (replace with Vercel's)
- Any forwarding rules (delete)

### GoDaddy UI Tips

- **Pencil icon** = Edit
- **Trash icon** = Delete
- **Add** button = Create new record
- Changes save automatically (no "Apply" button needed)

---

## Quick Reference

**Vercel DNS Requirements:**
- Root domain: `76.76.21.21` (A record)
- WWW subdomain: `cname.vercel-dns.com` (CNAME)

**DNS Propagation Check:**
- https://www.whatsmydns.net

**Vercel Status:**
- https://vercel.com/[your-username]/wohoo-ai/settings/domains

---

## Need Help?

If you're still stuck:

1. Take a screenshot of your GoDaddy DNS records
2. Share with Vercel support or check:
   - [Vercel DNS Docs](https://vercel.com/docs/concepts/projects/domains)
   - [GoDaddy Support](https://www.godaddy.com/help/add-a-cname-record-19236)
