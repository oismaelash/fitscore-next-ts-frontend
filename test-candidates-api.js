const fs = require('fs');
const path = require('path');

// Test the candidates API
async function testCandidatesAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Candidates API...\n');

  // Test 1: Get candidates for a job
  console.log('1. Testing GET /api/candidates?jobId=...');
  try {
    const response = await fetch(`${baseUrl}/api/candidates?jobId=f8ba3555-9bab-4bed-965f-9dcfb8b53833`);
    const data = await response.json();
    console.log('✅ GET /api/candidates response:', data);
  } catch (error) {
    console.log('❌ GET /api/candidates failed:', error.message);
  }

  // Test 2: Submit a candidate application with real job ID
  console.log('\n2. Testing POST /api/candidates with real job ID');
  try {
    // Get a real job ID first
    const jobsResponse = await fetch(`${baseUrl}/api/jobs`);
    const jobsData = await jobsResponse.json();
    
    if (jobsData.data && jobsData.data.length > 0) {
      const realJobId = jobsData.data[0].id;
      console.log(`📋 Using real job ID: ${realJobId}`);
      
      // Create a mock resume file
      const mockResumeContent = 'Mock resume content for testing';
      const mockResume = new Blob([mockResumeContent], { type: 'application/pdf' });
      
      const formData = new FormData();
      formData.append('jobId', realJobId);
      formData.append('name', 'John Doe');
      formData.append('email', 'john.doe@example.com');
      formData.append('phone', '+1234567890');
      formData.append('resume', mockResume, 'resume.pdf');
      formData.append('culturalFit', JSON.stringify({
        performance: 'High performer with excellent track record',
        energy: 'Very energetic and deadline-driven',
        culture: 'Strong alignment with company values'
      }));

      const response = await fetch(`${baseUrl}/api/candidates`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('✅ POST /api/candidates response:', data);
      
      if (data.success) {
        console.log('🎉 Candidate application submitted successfully!');
        console.log('📎 Resume URL:', data.data.resumeUrl);
        console.log('🆔 Candidate ID:', data.data.id);
      }
    } else {
      console.log('⚠️ No jobs found to test with');
    }
  } catch (error) {
    console.log('❌ POST /api/candidates failed:', error.message);
  }

  console.log('\n🎉 Candidates API test completed!');
}

// Test the jobs API to get a real job ID
async function testJobsAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Jobs API...\n');

  try {
    const response = await fetch(`${baseUrl}/api/jobs`);
    const data = await response.json();
    console.log('✅ GET /api/jobs response:', data);
    
    if (data.data && data.data.length > 0) {
      const jobId = data.data[0].id;
      console.log(`📋 Found job ID: ${jobId}`);
      
      // Test candidates API with real job ID
      console.log('\n3. Testing GET /api/candidates with real job ID');
      const candidatesResponse = await fetch(`${baseUrl}/api/candidates?jobId=${jobId}`);
      const candidatesData = await candidatesResponse.json();
      console.log('✅ GET /api/candidates with real job ID response:', candidatesData);
    }
  } catch (error) {
    console.log('❌ Jobs API test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testJobsAPI();
  await testCandidatesAPI();
  
  console.log('\n✨ All tests completed!');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Fetch is not available. Please use Node.js 18+ or install node-fetch');
  process.exit(1);
}

runTests().catch(console.error);
