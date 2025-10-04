#!/bin/bash

# Test script for flong.dev email routing and configuration
# Verifies DNS records, email worker, and sends a test contact form

set -e

echo "🔍 Email Routing Verification for flong.dev"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: DNS Records
echo "1️⃣  Checking DNS Records..."
echo ""

echo -n "   SPF Record: "
SPF=$(dig flong.dev TXT +short | grep "v=spf1")
if [ ! -z "$SPF" ]; then
    echo -e "${GREEN}✓${NC} Found"
    echo "      $SPF"
else
    echo -e "${RED}✗${NC} Not Found"
fi
echo ""

echo -n "   MX Records: "
MX=$(dig flong.dev MX +short)
if [ ! -z "$MX" ]; then
    echo -e "${GREEN}✓${NC} Found"
    echo "$MX" | sed 's/^/      /'
else
    echo -e "${RED}✗${NC} Not Found"
fi
echo ""

echo -n "   DMARC Record: "
DMARC=$(dig _dmarc.flong.dev TXT +short | head -1)
if [ ! -z "$DMARC" ]; then
    echo -e "${GREEN}✓${NC} Found"
    echo "      $DMARC"
else
    echo -e "${RED}✗${NC} Not Found"
fi
echo ""

# Test 2: Worker Health
echo "2️⃣  Checking Worker Health..."
echo ""

HEALTH=$(curl -s "https://flong.dev/health")
if [ ! -z "$HEALTH" ]; then
    echo -e "   ${GREEN}✓${NC} Worker is responding"
    echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
    echo -e "   ${RED}✗${NC} Worker not responding"
fi
echo ""

# Test 3: Email Configuration
echo "3️⃣  Email Configuration in wrangler.toml..."
echo ""

if grep -q "send_email" wrangler.toml; then
    echo -e "   ${GREEN}✓${NC} send_email binding found"
    grep -A 2 "send_email" wrangler.toml | sed 's/^/      /'
else
    echo -e "   ${RED}✗${NC} send_email binding not found"
fi
echo ""

# Test 4: Test Contact Form (Optional)
echo "4️⃣  Test Contact Form Submission..."
echo ""
read -p "   Send a test email? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Sending test contact form..."

    RESPONSE=$(curl -s -X POST "https://flong.dev/api/contact" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "name=Email Test Script" \
        -d "email=test@example.com" \
        -d "company=Test Co" \
        -d "project=consulting" \
        -d "message=This is a test email from the verification script.")

    if echo "$RESPONSE" | grep -q "success"; then
        echo -e "   ${GREEN}✓${NC} Test email submitted successfully"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    else
        echo -e "   ${RED}✗${NC} Test email failed"
        echo "$RESPONSE"
    fi
else
    echo "   Skipped"
fi
echo ""

# Summary
echo "============================================"
echo "📊 Summary"
echo "============================================"
echo ""
echo "DNS Configuration:"
echo "  - SPF: $([ ! -z "$SPF" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}Missing${NC}")"
echo "  - MX: $([ ! -z "$MX" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}Missing${NC}")"
echo "  - DMARC: $([ ! -z "$DMARC" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}Missing${NC}")"
echo ""
echo "Email Routing Setup:"
echo "  - MX Records: Cloudflare Email Routing (route1-3.mx.cloudflare.net)"
echo "  - Destination: hello@flong.dev → Needs Cloudflare Email Routing config"
echo "  - Worker: Sends via Cloudflare Email Workers API"
echo ""
echo "Next Steps:"
echo "  1. Check Cloudflare Dashboard → Email → Email Routing"
echo "  2. Verify hello@flong.dev is configured as destination address"
echo "  3. Check if emails forward to Gmail (franco.longstaff@gmail.com)"
echo "  4. Review worker logs: wrangler tail"
echo ""
