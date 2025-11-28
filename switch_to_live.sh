#!/bin/bash

echo "⚠️  Switching Clean Check to PayPal LIVE Mode"
echo "=============================================="
echo ""
echo "⚠️  WARNING: This will enable REAL PAYMENTS with real money!"
echo ""

read -p "Are you sure you want to switch to LIVE mode? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Cancelled. Staying in current mode."
    exit 0
fi

# Check if .env exists
if [ ! -f "/app/backend/.env" ]; then
    echo "❌ Error: /app/backend/.env not found"
    exit 1
fi

echo ""
echo "📝 Instructions:"
echo ""
echo "1. Go to https://developer.paypal.com/dashboard/"
echo "2. Make sure 'Live' toggle is ON"
echo "3. Click 'Apps & Credentials'"
echo "4. Copy your LIVE Client ID and Secret"
echo ""
echo "Enter your LIVE credentials:"
echo ""

read -p "LIVE Client ID: " LIVE_CLIENT_ID
read -p "LIVE Secret: " LIVE_SECRET

if [ -z "$LIVE_CLIENT_ID" ] || [ -z "$LIVE_SECRET" ]; then
    echo "❌ Error: Both Client ID and Secret are required"
    exit 1
fi

echo ""
echo "🔄 Updating .env file..."

# Backup current .env
cp /app/backend/.env /app/backend/.env.backup
echo "✅ Backup created: /app/backend/.env.backup"

# Update .env
sed -i "s/^PAYPAL_MODE=.*/PAYPAL_MODE=\"live\"/" /app/backend/.env
sed -i "s/^PAYPAL_CLIENT_ID=.*/PAYPAL_CLIENT_ID=\"$LIVE_CLIENT_ID\"/" /app/backend/.env
sed -i "s/^PAYPAL_SECRET=.*/PAYPAL_SECRET=\"$LIVE_SECRET\"/" /app/backend/.env

echo "✅ Updated PAYPAL_MODE to 'live'"
echo "✅ Updated PAYPAL_CLIENT_ID"
echo "✅ Updated PAYPAL_SECRET"

echo ""
echo "🔄 Restarting backend..."
sudo supervisorctl restart backend

sleep 3

echo ""
echo "✅ LIVE MODE ACTIVATED!"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • All payments are now REAL"
echo "   • Real money will be charged"
echo "   • Test one transaction yourself first"
echo "   • Monitor PayPal dashboard closely"
echo ""
echo "💰 Your Live PayPal Business Account:"
echo "   https://www.paypal.com/businessmanage"
echo ""
echo "🔙 To switch back to sandbox, run:"
echo "   bash /app/switch_to_sandbox.sh"
echo ""
