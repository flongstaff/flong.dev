// Test the contact form endpoint using URLSearchParams for form data
async function testContactForm() {
    // Create form data as URLSearchParams (works with form submissions)
    const params = new URLSearchParams();
    params.append('name', 'Test User');
    params.append('email', 'test@example.com');
    params.append('company', 'Test Company');
    params.append('project', 'website');
    params.append('message', 'This is a test message to verify the email functionality is working properly.');
    
    try {
        const response = await fetch('http://127.0.0.1:8787/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        const result = await response.json();
        console.log('Response status:', response.status);
        console.log('Response body:', result);
        
        if (response.status === 200 && result.success) {
            console.log('✅ Contact form submission successful!');
        } else {
            console.log('❌ Contact form submission failed!');
        }
    } catch (error) {
        console.error('Error testing contact form:', error);
    }
}

// Test the health endpoint
async function testHealthEndpoint() {
    try {
        const response = await fetch('http://127.0.0.1:8787/health');
        const result = await response.json();
        console.log('Health endpoint response:', result);
    } catch (error) {
        console.error('Error testing health endpoint:', error);
    }
}

// Run the tests
console.log('Testing local development server...');
testHealthEndpoint();
setTimeout(testContactForm, 1000);  // Wait a bit before testing contact form