# Git Push Helper - wohoo.ai

## Quick Guide to Push to GitHub

### Current Status
- ✅ Git repo initialized
- ✅ Remote configured: `https://github.com/wohoo-ai-code/wohoo.ai.git`
- ✅ All files committed
- ⏳ Need to authenticate to push

---

## Option 1: Use Personal Access Token (Recommended)

### Step 1: Create Token
1. Go to: https://github.com/settings/tokens/new
2. Configure:
   - **Note**: `wohoo.ai deployment`
   - **Expiration**: 90 days (or No expiration)
   - **Scopes**: Check `repo` (Full control of private repositories)
3. Click **"Generate token"**
4. **COPY THE TOKEN** (format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxx`)
   - You won't see it again!

### Step 2: Push with Token

```bash
git push origin main
```

**When prompted:**
- **Username**: `wohoo-ai-code`
- **Password**: `ghp_xxxxxxxxxx` (paste your token here)

macOS Keychain will save this, so you only need to do it once.

---

## Option 2: Use GitHub CLI (Alternative)

If you prefer not to deal with tokens:

### Install GitHub CLI
```bash
brew install gh
```

### Authenticate
```bash
gh auth login
```

Follow the prompts - it will open your browser to authenticate.

### Push
```bash
git push origin main
```

---

## Option 3: Use SSH Keys (Advanced)

If you want to set up SSH keys for the long term:

### Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Press Enter to accept defaults.

### Add to SSH Agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Copy Public Key
```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

### Add to GitHub
1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Paste the key (already in clipboard)
4. Click **"Add SSH key"**

### Update Remote to SSH
```bash
git remote set-url origin git@github.com:wohoo-ai-code/wohoo.ai.git
git push origin main
```

---

## Troubleshooting

### "Could not read Username"
✅ Fixed by using Personal Access Token (Option 1)

### "Authentication failed"
- Verify your token has `repo` scope
- Make sure you're using the token as password, not your GitHub password
- Check token hasn't expired

### "Permission denied"
- For SSH: Make sure you added the public key to GitHub
- For HTTPS: Verify you're using the correct token

---

## What Happens After Push?

Once you successfully push:

1. ✅ Code will be on GitHub
2. ✅ Ready to deploy to Vercel
3. ✅ Automatic deployments on future commits

---

## Next Step: Deploy to Vercel

After pushing to GitHub:

```bash
npm install -g vercel
vercel --prod
```

Or use Vercel Dashboard:
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub: `wohoo-ai-code/wohoo.ai`
4. Click "Deploy"

---

## Quick Reference

**Current repo**: https://github.com/wohoo-ai-code/wohoo.ai

**To push**:
```bash
git push origin main
```

**To check status**:
```bash
git status
git remote -v
```

**To view what will be pushed**:
```bash
git log origin/main..main
```
