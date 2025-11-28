#!/bin/bash

echo "🔧 Switching Clean Check to PayPal Sandbox Mode"
echo "================================================"
echo ""
echo "This will enable FREE TESTING with fake PayPal money."
echo ""

# Check if .env exists
if [ ! -f "/app/backend/.env" ]; then
    echo "❌ Error: /app/backend/.env not found"
    exit 1
fi

echo "📝 Instructions:"
echo ""
echo "1. Go to https://developer.paypal.com/dashboard/"
echo "2. Make sure 'Sandbox' toggle is ON"
echo "3. Click 'Apps & Credentials'"
echo "4. Copy your Sandbox Client ID and Secret"
echo ""
echo "Enter your Sandbox credentials:"
echo ""

read -p "Sandbox Client ID: " SANDBOX_CLIENT_ID
read -p "Sandbox Secret: " SANDBOX_SECRET

if [ -z "$SANDBOX_CLIENT_ID" ] || [ -z "$SANDBOX_SECRET" ]; then
    echo "❌ Error: Both Client ID and Secret are required"
    exit 1
fi

echo ""
echo "🔄 Updating .env file..."

# Backup current .env
cp /app/backend/.env /app/backend/.env.backup
echo "✅ Backup created: /app/backend/.env.backup"

# Update .env
sed -i "s/^PAYPAL_MODE=.*/PAYPAL_MODE=\"sandbox\"/" /app/backend/.env
sed -i "s/^PAYPAL_CLIENT_ID=.*/PAYPAL_CLIENT_ID=\"$SANDBOX_CLIENT_ID\"/" /app/backend/.env
sed -i "s/^PAYPAL_SECRET=.*/PAYPAL_SECRET=\"$SANDBOX_SECRET\"/" /app/backend/.env

echo "✅ Updated PAYPAL_MODE to 'sandbox'"
echo "✅ Updated PAYPAL_CLIENT_ID"
echo "✅ Updated PAYPAL_SECRET"

echo ""
echo "🔄 Restarting backend..."
sudo supervisorctl restart backend

sleep 3

echo ""
echo "✅ SANDBOX MODE ACTIVATED!"
echo ""
echo "📋 Next Steps:"
echo "1. Open https://developer.paypal.com/dashboard/"
echo "2. Go to 'Sandbox' → 'Accounts'"
echo "3. Note your test buyer account email & password"
echo "4. Visit your app and test payments (NO REAL MONEY)"
echo ""
echo "🧪 Test Accounts:"
echo "   Buyer: Use sandbox personal account"
echo "   Seller (You): Use sandbox business account"
echo ""
echo "📖 Full Testing Guide: /app/TESTING_GUIDE_FREE.md"
echo ""
echo "⚠️  To switch back to LIVE mode later, run:"
echo "   bash /app/switch_to_live.sh"
echo ""
