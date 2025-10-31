# 🚀 Deployment Guide - deploy.sh

Quick guide for using the automated deployment script.

---

## 📋 Quick Start

### First Time Deployment

```bash
./deploy.sh
```

This will:
1. ✅ Check if Supabase CLI is installed
2. ✅ Login to Supabase (if needed)
3. ✅ Link your project (if needed)
4. ✅ Check existing secrets
5. ✅ Only ask for secrets that aren't set
6. ✅ Deploy the Edge Function

### Subsequent Deployments

After the first deployment, secrets are already configured, so just run:

```bash
./deploy.sh --skip-secrets
```

This will skip the secrets check and deploy immediately.

---

## 🎯 Usage Options

### Normal Deployment (Smart Check)
```bash
./deploy.sh
```
- Checks if secrets exist
- Only asks for missing secrets
- Deploys function

**Use when:** First time setup or if you're not sure secrets are set

---

### Quick Deploy (Skip Secrets)
```bash
./deploy.sh --skip-secrets
```
- Skips all secrets checks
- Deploys function immediately
- Fastest option

**Use when:**
- Updating email template
- Fixing bugs in function code
- Secrets are already configured

---

### Update Secrets
```bash
./deploy.sh --update-secrets
```
- Forces re-entry of all secrets
- Useful if keys changed or were incorrect
- Deploys function after updating

**Use when:**
- Resend API key changed
- Switching email address
- Need to fix incorrect secrets

---

### Show Help
```bash
./deploy.sh --help
```
Shows all available options and usage

---

## 📝 What Secrets Are Configured?

The script configures these environment variables in Supabase:

| Secret | Description | Example |
|--------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_123abc...` |
| `FROM_EMAIL` | Email sender address | `hello@wohoo.ai` |

**Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically set by Supabase.

---

## 🔍 Check Current Secrets

View what secrets are currently set:

```bash
supabase secrets list
```

---

## 🔧 Troubleshooting

### "Supabase CLI not found"

**Install Supabase CLI:**

```bash
# Mac with Homebrew
brew install supabase/tap/supabase

# OR with npm
npm install -g supabase
```

---

### "Not logged in"

The script will prompt you to login automatically, or run:

```bash
supabase login
```

---

### "Project not linked"

The script will ask for your project ref. Find it in:
- Supabase Dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

Or link manually:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

---

### Secrets Not Taking Effect

After updating secrets, the Edge Function needs to be redeployed:

```bash
./deploy.sh --skip-secrets
```

---

### Want to See Function Logs?

```bash
# View real-time logs
supabase functions logs send-welcome-email --tail

# View recent logs
supabase functions logs send-welcome-email
```

---

## 📊 Typical Workflow

### First Time Setup

```bash
# 1. Deploy with full setup
./deploy.sh

# 2. Create webhook in Supabase Dashboard
# (follow on-screen instructions)

# 3. Test the form
# Submit a test signup on your website

# 4. Check logs
supabase functions logs send-welcome-email --tail
```

### Making Updates to Email Template

```bash
# 1. Edit the email template
# Modify: supabase/functions/send-welcome-email/index.ts

# 2. Deploy (skip secrets check)
./deploy.sh --skip-secrets

# 3. Test
# Submit another test signup

# 4. Verify changes
# Check email received matches new template
```

### Changing Email Sender

```bash
# 1. Update secrets
./deploy.sh --update-secrets

# 2. Enter new FROM_EMAIL when prompted

# 3. Deploy will happen automatically
```

---

## ⚡ Performance Tips

### Speed Up Deployments

**First deployment:**
```bash
./deploy.sh
```
Time: ~30 seconds (includes secrets setup)

**Subsequent deployments:**
```bash
./deploy.sh --skip-secrets
```
Time: ~10 seconds (skips secrets check)

---

## 🎯 Common Scenarios

### Scenario 1: Updating Welcome Email Text

**What changed:** Email template content

**Command:**
```bash
./deploy.sh --skip-secrets
```

**Why:** Secrets don't need to change, just deploy new code

---

### Scenario 2: Switching from Test to Production Email

**What changed:** FROM_EMAIL from `onboarding@resend.dev` to `hello@wohoo.ai`

**Command:**
```bash
./deploy.sh --update-secrets
```

**Why:** Need to update the FROM_EMAIL secret

---

### Scenario 3: Resend API Key Expired

**What changed:** RESEND_API_KEY needs updating

**Command:**
```bash
./deploy.sh --update-secrets
```

**Why:** Need to update the RESEND_API_KEY secret

---

### Scenario 4: Just Checking if Everything Works

**What changed:** Nothing, just want to redeploy

**Command:**
```bash
./deploy.sh --skip-secrets
```

**Why:** Fastest way to redeploy and verify

---

## 📋 Checklist Before Running

- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged into Supabase (`supabase projects list`)
- [ ] Have Resend API key ready (if first time)
- [ ] Have sender email ready (if first time)
- [ ] In project directory: `/Users/robot/Downloads/wohooai`

---

## 🎉 Success Indicators

After successful deployment, you should see:

```
✅ Supabase CLI found
✅ Logged in to Supabase
✅ Project linked
✅ RESEND_API_KEY already set (or newly set)
✅ FROM_EMAIL already set (or newly set)
✅ Edge Function deployed successfully!

🎉 Deployment Complete!
```

---

## 🆘 Getting Help

**View script help:**
```bash
./deploy.sh --help
```

**Check Supabase status:**
```bash
supabase status
```

**View all projects:**
```bash
supabase projects list
```

**View function details:**
```bash
supabase functions list
```

---

## 📚 Related Documentation

- [PRODUCTION-READY-CHECKLIST.md](PRODUCTION-READY-CHECKLIST.md) - Complete production setup
- [QUICK-START.md](QUICK-START.md) - Fast deployment guide
- [START-HERE.md](START-HERE.md) - Navigation hub

---

**Happy Deploying! 🚀**
