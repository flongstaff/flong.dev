/**
 * Enhanced Cloudflare Worker for flong.dev
 * Handles API routes, security, and additional functionality
 */

// Rate limiting configuration
const RATE_LIMITS = {
  contact: { requests: 5, window: 300 }, // 5 requests per 5 minutes
  api: { requests: 100, window: 3600 },   // 100 requests per hour
  booking: { requests: 3, window: 900 }   // 3 booking requests per 15 minutes
};

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=(), web-share=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://www.clarity.ms https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.resend.com https://www.google-analytics.com https://region1.google-analytics.com https://www.clarity.ms; frame-ancestors 'none'; upgrade-insecure-requests;"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Add security headers to all responses
    const addSecurityHeaders = (response) => {
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    };

    try {
      // Route handling
      if (pathname.startsWith('/api/')) {
        return handleApiRoutes(request, env, url);
      }
      
      if (pathname === '/health') {
        return handleHealthCheck();
      }
      
      if (pathname === '/analytics') {
        return handleAnalytics(request, env);
      }
      
      if (pathname.startsWith('/redirect/')) {
        return handleRedirects(url);
      }

      // Default: Pass through to origin
      const response = await fetch(request);
      return addSecurityHeaders(response);
      
    } catch (error) {
      console.error('Worker error:', error);
      return addSecurityHeaders(new Response('Internal Server Error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      }));
    }
  }
};

/**
 * Handle API routes
 */
async function handleApiRoutes(request, env, url) {
  const path = url.pathname.replace('/api', '');
  
  switch (path) {
    case '/contact':
      return handleContactSubmission(request, env);
    case '/booking':
      return handleBookingRequest(request, env);
    case '/stats':
      return handleSiteStats(request, env);
    case '/projects':
      return handleProjectsAPI(request, env);
    default:
      return new Response('API endpoint not found', { status: 404 });
  }
}

/**
 * Enhanced contact form handler
 */
async function handleContactSubmission(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Rate limiting
  const clientIP = request.headers.get('CF-Connecting-IP');
  const rateLimitKey = `contact:${clientIP}`;
  
  if (await isRateLimited(env, rateLimitKey, RATE_LIMITS.contact)) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  try {
    const formData = await request.formData();
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company') || '',
      project: formData.get('project'),
      message: formData.get('message'),
      timestamp: new Date().toISOString(),
      ip: clientIP,
      userAgent: request.headers.get('User-Agent')
    };

    // Enhanced spam detection
    if (await isSpam(data)) {
      return new Response('Message blocked by spam filter', { status: 400 });
    }

    // Send email via Resend
    const emailResponse = await sendEmail(env, data);
    
    if (emailResponse.ok) {
      // Log successful submission
      await logSubmission(env, data, 'success');
      return new Response('Message sent successfully', { status: 200 });
    } else {
      await logSubmission(env, data, 'error');
      return new Response('Failed to send message', { status: 500 });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response('Server error', { status: 500 });
  }
}

/**
 * Handle booking requests with calendar integration
 */
async function handleBookingRequest(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const clientIP = request.headers.get('CF-Connecting-IP');
  const rateLimitKey = `booking:${clientIP}`;
  
  if (await isRateLimited(env, rateLimitKey, RATE_LIMITS.booking)) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  try {
    const data = await request.json();
    
    // Generate booking confirmation
    const bookingId = generateBookingId();
    const calendarEvent = generateCalendarEvent(data);
    
    // Send confirmation email
    await sendBookingConfirmation(env, data, bookingId);
    
    return new Response(JSON.stringify({
      success: true,
      bookingId,
      calendarEvent,
      message: 'Booking request received'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Booking error:', error);
    return new Response('Booking failed', { status: 500 });
  }
}

/**
 * Health check endpoint
 */
async function handleHealthCheck() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      resend: 'operational',
      database: 'operational',
      cache: 'operational'
    }
  };

  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Site analytics endpoint
 */
async function handleAnalytics(request, env) {
  // Return aggregated analytics data
  const analytics = {
    visitors: await getVisitorStats(env),
    pageViews: await getPageViewStats(env),
    topProjects: await getTopProjects(env),
    bookingRequests: await getBookingStats(env)
  };

  return new Response(JSON.stringify(analytics), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Projects API endpoint
 */
async function handleProjectsAPI(request, env) {
  const projects = [
    {
      id: 'proxmox-infrastructure',
      category: 'infrastructure',
      status: 'live',
      featured: true,
      metrics: {
        uptime: '99.9%',
        users: '50+',
        costReduction: '30%'
      }
    },
    {
      id: 'retool-platform',
      category: 'platform',
      status: 'production',
      featured: true,
      metrics: {
        users: '50+',
        timeSaved: '60%',
        efficiency: '95%'
      }
    },
    {
      id: 'transparency-portal',
      category: 'web-development',
      status: 'coming-soon',
      featured: true,
      openSource: true,
      metrics: {
        transparency: '100%',
        openData: 'Yes',
        community: 'Government'
      }
    }
  ];

  return new Response(JSON.stringify(projects), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Utility functions
 */
async function isRateLimited(env, key, limit) {
  // Implementation would use Cloudflare KV or Durable Objects
  // for rate limiting state
  return false; // Placeholder
}

async function isSpam(data) {
  // Enhanced spam detection logic
  const spamKeywords = ['crypto', 'bitcoin', 'forex', 'casino', 'pills'];
  const message = data.message.toLowerCase();
  
  return spamKeywords.some(keyword => message.includes(keyword)) ||
         data.message.length < 10 ||
         !data.email.includes('@');
}

async function sendEmail(env, data) {
  // Use existing Resend integration
  return await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'contact@flong.dev',
      to: 'hello@flong.dev',
      subject: `New ${data.project} inquiry from ${data.name}`,
      html: generateEmailHTML(data)
    })
  });
}

function generateEmailHTML(data) {
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
    <p><strong>Project Type:</strong> ${data.project}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message.replace(/\n/g, '<br>')}</p>
    <hr>
    <p><small>Submitted: ${data.timestamp}</small></p>
  `;
}

function generateBookingId() {
  return 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function logSubmission(env, data, status) {
  // Log to analytics or monitoring service
  console.log(`Contact submission ${status}:`, {
    email: data.email,
    project: data.project,
    timestamp: data.timestamp
  });
}