#!/bin/bash

echo "🔧 Cloudflare Analytics Setup"
echo "=============================="
echo ""

# Account ID is already known
ACCOUNT_ID="4b5b1c98580a7951ec176666896f3095"

echo "✅ Account ID: $ACCOUNT_ID"
echo ""

# Check if API token is provided
if [ -z "$1" ]; then
  echo "❌ API Token not provided"
  echo ""
  echo "📋 To create your API token:"
  echo "1. Visit: https://dash.cloudflare.com/profile/api-tokens"
  echo "2. Click 'Create Token' → 'Create Custom Token'"
  echo "3. Permissions: Account > Analytics Engine > Read"
  echo "4. Create and copy the token"
  echo ""
  echo "Then run:"
  echo "  ./setup-analytics.sh YOUR_API_TOKEN"
  echo ""
  echo "Or set manually:"
  echo "  export CLOUDFLARE_ACCOUNT_ID=\"$ACCOUNT_ID\""
  echo "  export CLOUDFLARE_API_TOKEN=\"your_token\""
  exit 1
fi

API_TOKEN="$1"

# Create .env file
cat > .env << ENVFILE
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
export CLOUDFLARE_API_TOKEN="$API_TOKEN"
ENVFILE

echo "✅ Created .env file with your credentials"
echo ""
echo "To use it, run:"
echo "  source .env"
echo ""
echo "Then test analytics:"
echo "  ./query-analytics.sh summary"
echo ""

# Also export for current session
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
export CLOUDFLARE_API_TOKEN="$API_TOKEN"

echo "✅ Environment variables set for current session"
echo ""
echo "🎉 Setup complete! You can now query analytics."
