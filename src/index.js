export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Security: Rate limiting
    const rateLimitKey = `rate_limit_${clientIP}`;
    const currentTime = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10; // Max 10 requests per 15 minutes
    
    // Basic rate limiting without KV (for now)
    const userAgent = request.headers.get('User-Agent') || '';
    
    // Block obvious bot requests
    const suspiciousPatterns = [
      /curl/i, /wget/i, /python/i, /bot/i, /crawler/i, /spider/i,
      /scanner/i, /scraper/i, /^$/
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://flong.dev',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    // Handle contact form submission
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const company = formData.get('company') || 'N/A';
        const project = formData.get('project');
        const message = formData.get('message');
        
        // Input validation and sanitization
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Validate required fields
        if (!name || !email || !project || !message) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://flong.dev'
            }
          });
        }
        
        // Validate field lengths
        if (name.length > 100 || email.length > 200 || message.length > 2000) {
          return new Response(JSON.stringify({ error: 'Field length exceeded' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://flong.dev'
            }
          });
        }
        
        // Validate email format
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: 'Invalid email format' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://flong.dev'
            }
          });
        }
        
        // Basic spam detection
        const spamPatterns = [
          /\b(viagra|casino|lottery|prize|winner|congratulations)\b/i,
          /\b(click here|buy now|act now|limited time)\b/i,
          /\$\$\$|!!!/,
          /http:\/\/[^\s]+/gi
        ];
        
        const fullText = `${name} ${email} ${message}`;
        if (spamPatterns.some(pattern => pattern.test(fullText))) {
          return new Response(JSON.stringify({ error: 'Message flagged as spam' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://flong.dev'
            }
          });
        }
        
        // Email content
        const emailContent = `
New Contact Form Submission from flong.dev

Name: ${name}
Email: ${email}
Company: ${company}
Project Type: ${project}

Message:
${message}

---
Submitted at: ${new Date().toISOString()}
        `.trim();
        
        // Log the submission
        console.log('Contact form submission received:', {
          name, email, company, project, message,
          timestamp: new Date().toISOString(),
          ip: request.headers.get('CF-Connecting-IP')
        });
        
        // Send email using Resend API (you'll need to add RESEND_API_KEY to worker environment)
        if (env.RESEND_API_KEY) {
          try {
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Contact Form <onboarding@resend.dev>',
                to: ['franco.longstaff@gmail.com'],
                subject: `New Contact Form: ${project} - ${name}`,
                text: emailContent,
                reply_to: email
              })
            });
            
            if (emailResponse.ok) {
              console.log('Email sent successfully via Resend');
            } else {
              const error = await emailResponse.text();
              console.error('Resend API error:', error);
            }
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
          }
        } else {
          console.log('RESEND_API_KEY not configured - email not sent');
        }
        
        // Store submission details for manual review
        const submissionData = {
          name, email, company, project, message,
          timestamp: new Date().toISOString(),
          ip: request.headers.get('CF-Connecting-IP')
        };
        
        // Try to store in KV if available, but don't fail if it's not configured
        try {
          if (env.CONTACT_FORMS) {
            const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await env.CONTACT_FORMS.put(submissionId, JSON.stringify(submissionData));
          }
        } catch (kvError) {
          console.log('KV storage not available, continuing without it');
        }
        
        // For now, return success - you'll get the actual form data via email routing
        return new Response(JSON.stringify({ success: true, message: 'Form submitted successfully' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://flong.dev'
          }
        });
        
      } catch (error) {
        console.error('Form submission error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://flong.dev'
          }
        });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

async function sendEmail(env, { from, to, subject, text }) {
  try {
    // Using MailChannels API with proper domain verification
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }]
        }],
        from: { 
          email: from,
          name: 'flong.dev Contact Form'
        },
        subject,
        content: [{
          type: 'text/plain',
          value: text
        }],
        headers: {
          'X-MC-Tags': 'contact-form'
        }
      })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      console.error('Email API error:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}