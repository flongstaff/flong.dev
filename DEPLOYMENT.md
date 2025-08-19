# Deployment Guide for flong.dev

## 🎯 **Overview**
Professional IT portfolio with Cloudflare Workers API, advanced security, and analytics.

## 📋 **Prerequisites**

### GitHub Secrets Required:
```
CLOUDFLARE_API_TOKEN - Cloudflare API token with permissions:
  - Zone:Zone Settings:Read, Zone:Read  
  - Account:Cloudflare Pages:Edit, Workers:Edit
  - Zone Resources: Include flong.dev

CLOUDFLARE_ACCOUNT_ID - Found in Cloudflare dashboard sidebar

RESEND_API_KEY - Resend.com API key for contact form emails
```

### Cloudflare Resources:
- Domain: flong.dev configured in Cloudflare
- Pages Project: Created in dashboard (auto-deploys from GitHub)
- Workers: Deployed via GitHub Actions
- KV Namespaces: Optional but recommended (see setup-kv.md)

## 🚀 **Deployment Process**

### Automated (Recommended):
1. Push to main branch
2. GitHub Actions validates everything
3. Deploys Workers if secrets configured
4. Runs comprehensive verification
5. Generates deployment report

### Manual Deployment:
```bash
# Deploy Workers only
npm run deploy

# Local development
npm run dev
```

## 🔍 **Verification Checklist**

After deployment:
- [ ] https://flong.dev loads correctly
- [ ] https://www.flong.dev redirects properly  
- [ ] Contact form works (if RESEND_API_KEY set)
- [ ] API endpoints respond (/health, /api/*)
- [ ] Security headers present
- [ ] Performance < 2 seconds
- [ ] Mobile responsive
- [ ] Analytics tracking

## 📊 **Monitoring**

### GitHub Actions:
- Workflow runs on every push
- Detailed deployment reports
- Performance monitoring
- Security validation

### Cloudflare Dashboard:
- Worker logs and metrics
- Analytics and traffic
- Security events
- Performance insights

### External Monitoring:
- Google Analytics: G-L08C395YSY
- Microsoft Clarity: o8m5n9p1q2
- Google Search Console
- Bing Webmaster Tools

## 🛠 **Troubleshooting**

### Common Issues:
1. **Workers not deploying**: Check API token permissions
2. **Contact form not working**: Verify RESEND_API_KEY
3. **Performance issues**: Check Cloudflare cache settings
4. **Security errors**: Review CSP headers in _headers

### Debug Commands:
```bash
# Test configuration
npx wrangler config validate

# View logs
npx wrangler tail

# Test deployment
npx wrangler deploy --dry-run
```

## 🔄 **Rollback Process**

If deployment fails:
1. GitHub Actions will prevent bad deployments
2. Cloudflare Pages: Use dashboard to revert
3. Workers: Redeploy previous version
4. DNS: Issues resolve in 5-10 minutes

## 📈 **Performance Expectations**

- **Load Time**: < 1 second
- **Lighthouse Score**: 95+
- **Uptime**: 99.9% (Cloudflare SLA)
- **Global Edge**: < 50ms response time
- **Mobile Score**: 90+

## 🔐 **Security Features**

- Enterprise-grade SSL/TLS
- Comprehensive CSP headers
- Rate limiting and spam protection
- Input validation and sanitization
- Bot protection via Cloudflare
- Regular security scanning