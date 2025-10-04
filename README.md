# 🌐 flong.dev - Professional IT Portfolio

> **Live Website**: [https://flong.dev](https://flong.dev)

Professional portfolio website for **Franco Longstaff** - IT Systems Administrator, DevOps Expert, and Web Administrator based in Perth, Australia.

## About This Project

A modern, responsive portfolio showcasing my expertise in IT systems administration, cloud infrastructure, and DevOps practices. Built with performance, accessibility, and professional presentation in mind.

### Key Features

- **Modern Design**: Clean, professional interface with dark/light mode toggle
- **Fully Responsive**: Optimized for all devices from mobile to desktop
- **High Performance**: Fast loading with **optimized** assets and lazy loading
- **SEO Optimized**: Complete meta tags, sitemap, and structured data
- **Working Contact Form**: Real-time email notifications via Cloudflare Workers
- **Professional Focus**: Showcases real IT projects and achievements

## Technical Implementation

### Frontend Stack
- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern features including CSS Grid, Flexbox, and Custom Properties
- **Vanilla JavaScript** - Progressive enhancement without framework dependencies
- **Responsive Design** - Mobile-first approach with fluid layouts

### Infrastructure & DevOps
- **Cloudflare Pages** - Static site hosting with global CDN
- **Cloudflare Workers** - Serverless contact form processing
- **Email Routing** - Professional email handling (hello@flong.dev)
- **CI/CD** - Automatic deployment from GitHub
- **DNS Management** - Complete domain configuration

### Performance Features
- **Lazy Loading** - Images and sections load as needed
- **Critical CSS** - Inline critical styles for faster rendering
- **Preloading** - Strategic resource preloading for better UX
- **Optimized Images** - SVG icons and optimized graphics
- **Minimal Dependencies** - Pure vanilla JavaScript approach

## Professional Highlights

This portfolio demonstrates my expertise in:

- **System Administration**: Proxmox virtualization, Windows Server environments
- **Cloud Infrastructure**: Microsoft Azure, Office 365, containerization
- **DevOps Practices**: Automation, monitoring, infrastructure as code
- **Web Technologies**: Modern frontend development and serverless architecture
- **IT Support**: Enterprise-level support with 95%+ satisfaction rates

## 🔧 Local Development

```bash
# Clone the repository
git clone https://github.com/flongstaff/flong.dev.git
cd flong.dev

# Install Cloudflare Workers dependencies
npm install

# Deploy worker (requires Cloudflare account)
wrangler deploy

```

## 📊 Analytics Setup

To query analytics data from your Cloudflare Analytics Engine:

1. Get your Cloudflare Account ID from the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Create an API token with "Account Analytics Read" permissions
3. Set environment variables:
   ```bash
   export CLOUDFLARE_ACCOUNT_ID="your_account_id"
   export CLOUDFLARE_API_TOKEN="your_api_token"
   ```

4. Run queries:
   ```bash
   # Get summary of last 24 hours
   ./query-analytics.sh summary
   
   # Get contact form submissions (last 7 days)
   ./query-analytics.sh contact
   
   # Get geographic distribution
   ./query-analytics.sh countries
   
   # Get error statistics
   ./query-analytics.sh errors
   
   # Get performance metrics (last hour)
   ./query-analytics.sh performance
   ```

5. For security best practices, you can also use a .env file:
   ```bash
   # Create .env file in project root
   echo 'CLOUDFLARE_ACCOUNT_ID="your_account_id"' > .env
   echo 'CLOUDFLARE_API_TOKEN="your_api_token"' >> .env
   
   # Source the environment variables
   source .env
   
   # Or run queries with environment variables set inline
   CLOUDFLARE_ACCOUNT_ID="your_account_id" CLOUDFLARE_API_TOKEN="your_api_token" ./query-analytics.sh summary
   ```

## 💼 Professional Contact

- **Website**: [flong.dev](https://flong.dev)
- **Email**: [hello@flong.dev](mailto:hello@flong.dev)
- **LinkedIn**: [franco-longstaff](https://www.linkedin.com/in/franco-longstaff)
- **GitHub**: [flongstaff](https://github.com/flongstaff)

---

**🔍 Hiring?** This project demonstrates my full-stack capabilities, from frontend development to cloud infrastructure and DevOps practices. View the live site and get in touch through the contact form!
