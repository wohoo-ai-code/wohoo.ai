#!/bin/bash

# wohoo.ai Deployment Script
# This script helps you deploy the Edge Function to Supabase
# Make sure you have Supabase CLI installed: npm install -g supabase
#
# Usage:
#   ./deploy.sh                  # Normal deployment (checks existing secrets)
#   ./deploy.sh --update-secrets # Force update secrets
#   ./deploy.sh --skip-secrets   # Skip secrets check entirely

set -e  # Exit on error

echo "🚀 wohoo.ai Deployment Script"
echo "================================"
echo ""

# Parse command line arguments
UPDATE_SECRETS=false
SKIP_SECRETS=false

for arg in "$@"; do
    case $arg in
        --update-secrets)
            UPDATE_SECRETS=true
            shift
            ;;
        --skip-secrets)
            SKIP_SECRETS=true
            shift
            ;;
        --help)
            echo "Usage: ./deploy.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --update-secrets    Force update secrets even if they exist"
            echo "  --skip-secrets      Skip secrets check and only deploy function"
            echo "  --help              Show this help message"
            echo ""
            exit 0
            ;;
    esac
done

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

# Check and set secrets
if [ "$SKIP_SECRETS" = false ]; then
    echo "Checking secrets..."
    echo ""

    # Get list of existing secrets
    SECRETS_LIST=$(supabase secrets list 2>/dev/null || echo "")

    # Check if RESEND_API_KEY exists
    if echo "$SECRETS_LIST" | grep -q "RESEND_API_KEY"; then
        echo -e "${GREEN}✅ RESEND_API_KEY already set${NC}"
        RESEND_SET=true
    else
        echo -e "${YELLOW}⚠️  RESEND_API_KEY not set${NC}"
        RESEND_SET=false
    fi

    # Check if FROM_EMAIL exists
    if echo "$SECRETS_LIST" | grep -q "FROM_EMAIL"; then
        echo -e "${GREEN}✅ FROM_EMAIL already set${NC}"
        FROM_EMAIL_SET=true
    else
        echo -e "${YELLOW}⚠️  FROM_EMAIL not set${NC}"
        FROM_EMAIL_SET=false
    fi

    echo ""

    # Only ask for secrets that aren't set (or if --update-secrets is used)
    SECRETS_UPDATED=false

    if [ "$RESEND_SET" = false ] || [ "$UPDATE_SECRETS" = true ]; then
        if [ "$UPDATE_SECRETS" = true ]; then
            echo "Updating RESEND_API_KEY..."
        fi
        read -p "Enter your RESEND_API_KEY (starts with re_): " RESEND_KEY
        if [ -z "$RESEND_KEY" ]; then
            echo -e "${RED}❌ RESEND_API_KEY cannot be empty${NC}"
            exit 1
        fi
        echo "Setting RESEND_API_KEY..."
        supabase secrets set RESEND_API_KEY="$RESEND_KEY"
        SECRETS_UPDATED=true
    fi

    if [ "$FROM_EMAIL_SET" = false ] || [ "$UPDATE_SECRETS" = true ]; then
        if [ "$UPDATE_SECRETS" = true ]; then
            echo "Updating FROM_EMAIL..."
        fi
        read -p "Enter your FROM_EMAIL (e.g., hello@wohoo.ai): " FROM_EMAIL_VALUE
        if [ -z "$FROM_EMAIL_VALUE" ]; then
            echo -e "${RED}❌ FROM_EMAIL cannot be empty${NC}"
            exit 1
        fi
        echo "Setting FROM_EMAIL..."
        supabase secrets set FROM_EMAIL="$FROM_EMAIL_VALUE"
        SECRETS_UPDATED=true
    fi

    if [ "$SECRETS_UPDATED" = true ]; then
        echo -e "${GREEN}✅ Secrets updated successfully${NC}"
    else
        echo -e "${GREEN}✅ All secrets already configured${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⏭️  Skipping secrets check (--skip-secrets flag)${NC}"
    echo ""
fi

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

if [ "$SKIP_SECRETS" = false ]; then
    echo "Secrets configured:"
    supabase secrets list
    echo ""
fi

echo "Next steps:"
echo "1. Go to Supabase Dashboard → Database → Webhooks"
echo "2. Create a webhook (if not already done):"
echo "   - Name: send-welcome-email-trigger"
echo "   - Table: waitlist"
echo "   - Event: Insert"
echo "   - Type: Edge Function"
echo "   - Function: send-welcome-email"
echo "3. Test by submitting your waitlist form"
echo ""
echo "Useful commands:"
echo "  View logs:           supabase functions logs send-welcome-email --tail"
echo "  Deploy again:        ./deploy.sh --skip-secrets"
echo "  Update secrets:      ./deploy.sh --update-secrets"
echo "  Help:                ./deploy.sh --help"
echo ""
