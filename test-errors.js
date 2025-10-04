// Test error conditions for the contact form
async function testInvalidSubmission() {
    console.log('\n--- Testing invalid submission (missing fields) ---');
    
    // Test with missing required fields
    const params = new URLSearchParams();
    params.append('name', 'Test User');
    // Missing email, project, and message - should fail validation
    
    try {
        const response = await fetch('http://127.0.0.1:8787/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 400) {
            // For error responses, try to read as text first
            const errorText = await response.text();
            console.log('Error response body:', errorText);
            console.log('✅ Correctly rejected invalid submission!');
        } else {
            // Try to parse JSON for successful responses
            const result = await response.json();
            console.log('Response body:', result);
            console.log('❌ Should have rejected invalid submission!');
        }
    } catch (error) {
        console.error('Error testing invalid submission:', error);
    }
}

async function testSpamDetection() {
    console.log('\n--- Testing spam detection ---');
    
    // Test with spam content
    const params = new URLSearchParams();
    params.append('name', 'Test User');
    params.append('email', 'test@example.com');
    params.append('company', 'Test Company');
    params.append('project', 'website');
    params.append('message', 'Buy viagra now! Click here for amazing deals! $$$ $$$ $$$');
    
    try {
        const response = await fetch('http://127.0.0.1:8787/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });
        
        console.log('Response status:', response.status);
        
        if (response.status === 400) {
            // For error responses, try to read as text first
            const errorText = await response.text();
            console.log('Error response body:', errorText);
            console.log('✅ Correctly flagged spam submission!');
        } else {
            // Try to parse JSON for successful responses
            const result = await response.json();
            console.log('Response body:', result);
            console.log('❌ Should have flagged spam submission!');
        }
    } catch (error) {
        console.error('Error testing spam detection:', error);
    }
}

async function testValidSubmission() {
    console.log('\n--- Testing valid submission ---');
    
    const params = new URLSearchParams();
    params.append('name', 'Valid User');
    params.append('email', 'valid@example.com');
    params.append('company', 'Valid Company');
    params.append('project', 'consulting');
    params.append('message', 'This is a legitimate inquiry about your services.');
    
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
            console.log('✅ Valid submission successful!');
        } else {
            console.log('❌ Valid submission failed!');
        }
    } catch (error) {
        console.error('Error testing valid submission:', error);
    }
}

// Run tests
console.log('Testing error conditions for contact form...');
testInvalidSubmission();
setTimeout(testSpamDetection, 1000);
setTimeout(testValidSubmission, 2000);