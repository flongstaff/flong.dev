#!/usr/bin/env node

/**
 * Test script to send a contact form submission
 * Usage: node test-contact.js [local|production]
 */

const env = process.argv[2] || 'local';

const urls = {
  local: 'http://localhost:59478/api/contact',
  production: 'https://flong.dev/api/contact'
};

const url = urls[env];

if (!url) {
  console.error('Invalid environment. Use: node test-contact.js [local|production]');
  process.exit(1);
}

console.log(`🧪 Testing email submission to: ${env}`);
console.log(`📧 URL: ${url}\n`);

const formData = new FormData();
formData.append('name', 'Test User - Email Test');
formData.append('email', 'test@example.com');
formData.append('company', 'Test Company');
formData.append('project', 'general');
formData.append('message', 'This is a test email from the contact form test script. If you receive this, the email routing is working correctly!');

fetch(url, {
  method: 'POST',
  body: formData
})
  .then(async response => {
    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Email submission successful!');
      console.log('📬 Check hello@flong.dev (franco.longstaff@gmail.com) for the email');
    } else {
      console.log('\n❌ Email submission failed!');
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
