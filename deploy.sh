#!/bin/bash

# wohoo.ai Deployment Script
# This script helps you deploy the Edge Function to Supabase
# Make sure you have Supabase CLI installed: npm install -g supabase

set -e  # Exit on error

echo "🚀 wohoo.ai Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    echo "Or with Homebrew: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo "Logging in..."
    supabase login
fi

echo -e "${GREEN}✅ Logged in to Supabase${NC}"
echo ""

# Ask for project ref if not linked
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Project not linked${NC}"
    echo ""
    echo "Find your project ref in your Supabase dashboard URL:"
    echo "https://supabase.com/dashboard/project/YOUR_PROJECT_REF"
    echo ""
    read -p "Enter your project ref: " PROJECT_REF

    if [ -z "$PROJECT_REF" ]; then
        echo -e "${RED}❌ Project ref cannot be empty${NC}"
        exit 1
    fi

    echo ""
    echo "Linking project..."
    supabase link --project-ref "$PROJECT_REF"
fi

echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# Ask for secrets
echo "Setting up secrets..."
echo ""

read -p "Enter your RESEND_API_KEY (starts with re_): " RESEND_KEY
if [ -z "$RESEND_KEY" ]; then
    echo -e "${RED}❌ RESEND_API_KEY cannot be empty${NC}"
    exit 1
fi

read -p "Enter your FROM_EMAIL (e.g., hello@wohoo.ai): " FROM_EMAIL
if [ -z "$FROM_EMAIL" ]; then
    echo -e "${RED}❌ FROM_EMAIL cannot be empty${NC}"
    exit 1
fi

echo ""
echo "Setting secrets in Supabase..."
supabase secrets set RESEND_API_KEY="$RESEND_KEY"
supabase secrets set FROM_EMAIL="$FROM_EMAIL"

echo -e "${GREEN}✅ Secrets set successfully${NC}"
echo ""

# Deploy Edge Function
echo "Deploying Edge Function: send-welcome-email..."
echo ""
supabase functions deploy send-welcome-email

echo ""
echo -e "${GREEN}✅ Edge Function deployed successfully!${NC}"
echo ""

# Verify secrets
echo "Verifying secrets..."
supabase secrets list

echo ""
echo "================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to Supabase Dashboard → Database → Webhooks"
echo "2. Create a webhook:"
echo "   - Name: send-welcome-email-trigger"
echo "   - Table: waitlist"
echo "   - Event: Insert"
echo "   - Type: Edge Function"
echo "   - Function: send-welcome-email"
echo "3. Test by submitting your waitlist form"
echo ""
echo "View logs: supabase functions logs send-welcome-email --tail"
echo ""
