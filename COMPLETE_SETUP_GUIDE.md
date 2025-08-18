# Complete Cloudflare Setup Guide for flong.dev

## Step 1: Push Your Code to GitHub

```bash
# In your project directory (/Users/flong/Developer/flong.dev)
git add .
git commit -m "Setup Cloudflare deployment with email functionality"
git push origin main
```

## Step 2: Set Up Cloudflare Pages

### 2.1 Connect Your Repository
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages** in the left sidebar
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select **GitHub** and authorize Cloudflare
6. Select your repository: `flongstaff/flong.dev`
7. Click **Begin setup**

### 2.2 Configure Build Settings
- **Project name**: `flong-dev`
- **Production branch**: `main`
- **Framework preset**: `None`
- **Build command**: (leave empty)
- **Build output directory**: `/`
- **Root directory**: `/`
- Click **Save and Deploy**

### 2.3 Add Custom Domain
1. After deployment completes, click **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `flong.dev`
4. Follow the DNS setup instructions (if your domain isn't already on Cloudflare)

## Step 3: Set Up Email Routing

### 3.1 Enable Email Routing
1. In Cloudflare Dashboard, go to **Email** > **Email Routing**
2. If `flong.dev` isn't listed, click **Add domain** and add it
3. Click **Enable Email Routing** for flong.dev

### 3.2 Add Destination Address
1. Click **Destination addresses**
2. Click **Add destination address**
3. Enter your personal email (where you want to receive messages)
4. Click **Send** and check your email for verification
5. Click the verification link in the email

### 3.3 Create Email Addresses
1. Go to **Routing rules**
2. Click **Create address**

**First Address:**
- **Custom address**: `hello`
- **Domain**: `flong.dev`  
- **Destination**: Select your verified personal email
- Click **Save**

**Second Address:**
- **Custom address**: `info`
- **Domain**: `flong.dev`
- **Destination**: Select your verified personal email  
- Click **Save**

### 3.4 Test Email Routing
Send test emails to both:
- hello@flong.dev
- info@flong.dev

You should receive them at your personal email.

## Step 4: Set Up Cloudflare Worker for Contact Form

### 4.1 Install Wrangler CLI
```bash
# Install globally
npm install -g wrangler

# Or if you prefer using npx
npx wrangler --version
```

### 4.2 Login to Cloudflare
```bash
wrangler login
```
This will open a browser window - click **Allow** to authorize.

### 4.3 Create API Token
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Custom token** template
4. **Token name**: `flong-dev-worker`
5. **Permissions**:
   - Account - Cloudflare Workers:Edit
   - Zone - Zone Settings:Read
   - Zone - Zone:Read
6. **Account Resources**: Include - All accounts
7. **Zone Resources**: Include - Specific zone - flong.dev
8. Click **Continue to summary** then **Create Token**
9. **SAVE THIS TOKEN** - you'll need it later

### 4.4 Deploy the Worker
```bash
# In your project directory
cd /Users/flong/Developer/flong.dev

# Install dependencies
npm install

# Deploy the worker
wrangler publish
```

### 4.5 Configure Worker Environment
1. Go to **Workers & Pages** in Cloudflare Dashboard
2. Click on `flong-dev-contact-form`
3. Go to **Settings** > **Variables**

**Add Environment Variables:**
- Click **Add variable**
- Name: `FROM_EMAIL`, Value: `noreply@flong.dev`
- Click **Save**
- Add another: Name: `TO_EMAIL`, Value: `hello@flong.dev`
- Click **Save**

**Add Secret (Encrypted Variable):**
- Click **Add variable**
- Name: `CF_API_TOKEN`
- Value: (paste the API token you created earlier)
- Check **Encrypt** box
- Click **Save**

### 4.6 Set Up Worker Route
1. Still in the Worker settings, go to **Triggers**
2. Click **Add route**
3. Route: `flong.dev/api/*`
4. Zone: `flong.dev`
5. Click **Save**

## Step 5: Test Everything

### 5.1 Test Website
1. Visit https://flong.dev
2. Check that the site loads correctly
3. Test the dark/light mode toggle
4. Check responsive design on mobile

### 5.2 Test Contact Form
1. Go to https://flong.dev#contact
2. Fill out the contact form completely
3. Click **Send Message**
4. You should see the success message
5. Check your personal email for the form submission

### 5.3 Test Direct Email
Send emails directly to:
- hello@flong.dev
- info@flong.dev

Both should forward to your personal email.

## Step 6: Optional - Set Up KV Storage

If you want to store form submissions:

```bash
# Create KV namespace
wrangler kv:namespace create "CONTACT_FORMS" --env production

# This will output something like:
# Add the following to your wrangler.toml:
# [[env.production.kv_namespaces]]
# binding = "CONTACT_FORMS"  
# id = "your-actual-id-here"
```

Copy the ID and update `wrangler.toml`, then redeploy:
```bash
wrangler publish
```

## Troubleshooting

### Website Not Loading
- Check Cloudflare Pages deployment status
- Verify custom domain DNS is pointing to Cloudflare

### Email Not Working
- Check Email Routing dashboard for delivery status
- Verify destination email is confirmed
- Check spam folder
- Wait up to 30 minutes for DNS propagation

### Contact Form Not Working
- Check Worker logs: `wrangler tail`
- Verify environment variables are set correctly
- Check browser console for errors
- Test the worker route directly: https://flong.dev/api/contact

### Worker Deployment Issues
```bash
# If deployment fails, try:
wrangler whoami  # Verify you're logged in
wrangler publish --compatibility-date 2024-01-01
```

## Security Checklist

- ✅ CORS restricted to flong.dev
- ✅ Form validation on server side
- ✅ API token with minimal required permissions
- ✅ Email addresses protected by Cloudflare
- ✅ No sensitive data exposed in client-side code

## Final URLs

After setup, these will work:
- **Website**: https://flong.dev
- **Contact Form**: https://flong.dev#contact
- **Email**: hello@flong.dev, info@flong.dev
- **GitHub**: https://github.com/flongstaff/flong.dev

Your professional IT portfolio is now live with full email functionality! 🚀