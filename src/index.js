export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
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
        
        // Since we have Cloudflare Email Routing set up, 
        // we'll send a simple email using MailChannels API (free for Cloudflare Workers)
        const emailResponse = await sendEmail(env, {
          from: env.FROM_EMAIL || 'noreply@flong.dev',
          to: env.TO_EMAIL || 'hello@flong.dev',
          subject: `New Contact Form: ${project} - ${name}`,
          text: emailContent
        });
        
        if (emailResponse.success) {
          // Store submission in KV (optional)
          if (env.CONTACT_FORMS) {
            const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await env.CONTACT_FORMS.put(submissionId, JSON.stringify({
              name, email, company, project, message,
              timestamp: new Date().toISOString(),
              ip: request.headers.get('CF-Connecting-IP')
            }));
          }
          
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://flong.dev'
            }
          });
        } else {
          throw new Error('Email sending failed');
        }
        
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
    // Using MailChannels API (free for Cloudflare Workers)
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          dkim_domain: 'flong.dev',
          dkim_selector: 'mailchannels'
        }],
        from: { email: from },
        subject,
        content: [{
          type: 'text/plain',
          value: text
        }]
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