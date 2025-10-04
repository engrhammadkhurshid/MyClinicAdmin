#!/bin/bash

# Quick Setup Script for Resend Email Service
# Run: chmod +x scripts/setup-resend.sh && ./scripts/setup-resend.sh

echo "🏥 MyClinicAdmin - Resend Email Setup"
echo "======================================"
echo ""

# Check if resend is installed
if ! npm list resend > /dev/null 2>&1; then
    echo "📦 Installing Resend package..."
    npm install resend
    echo "✅ Resend installed"
else
    echo "✅ Resend already installed"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Get your Resend API Key:"
echo "   → Go to https://resend.com"
echo "   → Sign up (free tier: 3,000 emails/month)"
echo "   → Dashboard → API Keys → Create API Key"
echo ""

echo "2️⃣  Add API Key to .env.local:"
read -p "   Paste your Resend API key (starts with re_): " RESEND_KEY

if [ -z "$RESEND_KEY" ]; then
    echo "   ⚠️  No key provided. You can add it manually to .env.local"
    echo "   Add this line: RESEND_API_KEY=re_your_key_here"
else
    if [ -f .env.local ]; then
        # Check if key already exists
        if grep -q "RESEND_API_KEY" .env.local; then
            echo "   ⚠️  RESEND_API_KEY already exists in .env.local"
            read -p "   Replace it? (y/n): " REPLACE
            if [ "$REPLACE" = "y" ]; then
                # Update existing key
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/RESEND_API_KEY=.*/RESEND_API_KEY=$RESEND_KEY/" .env.local
                else
                    sed -i "s/RESEND_API_KEY=.*/RESEND_API_KEY=$RESEND_KEY/" .env.local
                fi
                echo "   ✅ Updated RESEND_API_KEY in .env.local"
            fi
        else
            echo "RESEND_API_KEY=$RESEND_KEY" >> .env.local
            echo "   ✅ Added RESEND_API_KEY to .env.local"
        fi
    else
        echo "RESEND_API_KEY=$RESEND_KEY" > .env.local
        echo "   ✅ Created .env.local with RESEND_API_KEY"
    fi
fi

echo ""
echo "3️⃣  Enable Resend in your code:"
echo "   Opening app/api/send-invite/route.ts..."
echo ""
echo "   You need to:"
echo "   → Uncomment the RESEND block (lines ~28-40)"
echo "   → Comment out the TEMPORARY block (lines ~45-57)"
echo ""
read -p "   Press Enter to continue..."

echo ""
echo "4️⃣  Configure Supabase SMTP:"
echo "   → Go to: Supabase Dashboard → Settings → Auth → SMTP Settings"
echo "   → Enable Custom SMTP"
echo "   → Add these settings:"
echo ""
echo "      SMTP Host: smtp.resend.com"
echo "      Port: 587"
echo "      Username: resend"
echo "      Password: $RESEND_KEY"
echo "      Sender Email: onboarding@resend.dev (or your verified domain)"
echo "      Sender Name: MyClinicAdmin"
echo ""
read -p "   Press Enter when done..."

echo ""
echo "5️⃣  Add to Vercel (Production):"
echo "   → Go to: Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "   → Add: RESEND_API_KEY = $RESEND_KEY"
echo "   → Apply to: Production, Preview, Development"
echo ""
read -p "   Press Enter when done..."

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Uncomment Resend code in app/api/send-invite/route.ts"
echo "   2. Test locally: Try inviting a manager"
echo "   3. Deploy to Vercel: git add -A && git commit && git push"
echo ""
echo "📚 Full Guide: docs/RESEND_SINGLE_SERVICE_SETUP.md"
echo ""
echo "🎉 You're ready to send emails!"
