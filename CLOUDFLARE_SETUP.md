# Cloudflare Setup Instructions

## Email Routing Setup

### 1. Enable Email Routing
1. Go to Cloudflare Dashboard > Email > Email Routing
2. Add your domain `flong.dev` if not already added
3. Create destination addresses:
   - Add your personal email as a destination
   - Verify the destination email

### 2. Create Email Addresses
Create these email addresses with routing:

**hello@flong.dev**
- Route to: your-personal-email@example.com
- Used for: General inquiries, contact form submissions

**info@flong.dev**
- Route to: your-personal-email@example.com
- Used for: Business inquiries, additional contact option

### 3. MX Records (Auto-configured by Cloudflare)
Cloudflare will automatically add these MX records:
```
flong.dev MX 10 route1.mx.cloudflare.net
flong.dev MX 10 route2.mx.cloudflare.net
flong.dev MX 10 route3.mx.cloudflare.net
```

## Workers Setup for Contact Form

### 1. Deploy the Contact Form Worker
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Install dependencies
npm install

# Deploy the worker
wrangler publish
```

### 2. Environment Variables
Set these in Cloudflare Dashboard > Workers > flong-dev-contact-form > Settings > Variables:

**Environment Variables:**
- `CF_API_TOKEN`: Your Cloudflare API token with Email:Edit permissions
- `FROM_EMAIL`: noreply@flong.dev
- `TO_EMAIL`: hello@flong.dev

**Secrets (encrypted):**
- `CF_API_TOKEN`: Your Cloudflare API token

### 3. KV Namespace (Optional)
1. Create a KV namespace: `wrangler kv:namespace create "CONTACT_FORMS"`
2. Update the namespace ID in `wrangler.toml`

### 4. Routes Configuration
The worker is configured to handle:
- `flong.dev/api/contact` (POST) - Contact form submissions
- CORS handling for the domain

## Testing

### 1. Test Email Routing
Send a test email to:
- hello@flong.dev
- info@flong.dev

Both should forward to your personal email.

### 2. Test Contact Form
1. Visit https://flong.dev
2. Fill out the contact form
3. Submit and verify you receive the email

## Troubleshooting

### Email Not Receiving
1. Check Cloudflare Email Routing dashboard for delivery status
2. Verify MX records are pointing to Cloudflare
3. Check spam folder

### Contact Form Not Working
1. Check Worker logs: `wrangler tail`
2. Verify environment variables are set
3. Check browser console for JavaScript errors

### DNS Propagation
- MX records may take up to 24 hours to propagate globally
- Use `dig MX flong.dev` to verify MX records

## Security Notes

- The Worker validates all form inputs
- CORS is restricted to https://flong.dev
- All submissions are logged with timestamp and IP
- Consider rate limiting for production use

## Rate Limiting (Recommended)
Add rate limiting to prevent spam:
```javascript
// Add to Worker before form processing
const clientIP = request.headers.get('CF-Connecting-IP');
const rateLimitKey = `rate_limit_${clientIP}`;
const rateLimitCount = await env.CONTACT_FORMS.get(rateLimitKey);

if (rateLimitCount && parseInt(rateLimitCount) > 5) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```