#!/usr/bin/env node

/**
 * Simple test script to verify jobs CRUD integration
 * Run with: node test-jobs-integration.js
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testJob = {
  title: 'Test Job - Senior Developer',
  description: 'This is a test job posting for integration testing.',
  performance: {
    experience: '5+ years',
    deliveries: 'High quality code and documentation',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript']
  },
  energy: {
    availability: 'Full-time, remote',
    deadlines: 'Flexible with clear communication',
    pressure: 'Medium during sprints'
  },
  culture: {
    legalValues: ['Innovation', 'Collaboration', 'Excellence']
  },
  applicationLink: 'https://example.com/apply/test'
};

async function testJobsAPI() {
  console.log('🧪 Testing Jobs CRUD Integration...\n');

  let createdJobId = null;

  try {
    // Test 1: GET /api/jobs (list jobs)
    console.log('1. Testing GET /api/jobs...');
    const listResponse = await fetch(`${BASE_URL}/api/jobs`);
    const listData = await listResponse.json();
    
    if (listResponse.ok) {
      console.log('✅ Jobs list retrieved successfully');
      console.log(`   Found ${listData.data?.length || 0} jobs`);
    } else {
      console.log('❌ Failed to retrieve jobs list');
      console.log('   Error:', listData.error);
    }

    // Test 2: POST /api/jobs (create job)
    console.log('\n2. Testing POST /api/jobs...');
    const createResponse = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testJob),
    });
    const createData = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Job created successfully');
      createdJobId = createData.data.id;
      console.log(`   Job ID: ${createdJobId}`);
    } else {
      console.log('❌ Failed to create job');
      console.log('   Error:', createData.error);
    }

    if (createdJobId) {
      // Test 3: GET /api/jobs/[id] (get specific job)
      console.log('\n3. Testing GET /api/jobs/[id]...');
      const getResponse = await fetch(`${BASE_URL}/api/jobs/${createdJobId}`);
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        console.log('✅ Job retrieved successfully');
        console.log(`   Title: ${getData.data.title}`);
      } else {
        console.log('❌ Failed to retrieve job');
        console.log('   Error:', getData.error);
      }

      // Test 4: PUT /api/jobs/[id] (update job)
      console.log('\n4. Testing PUT /api/jobs/[id]...');
      const updateData = {
        title: 'Updated Test Job - Senior Developer',
        description: 'This is an updated test job posting.'
      };
      
      const updateResponse = await fetch(`${BASE_URL}/api/jobs/${createdJobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ Job updated successfully');
        console.log(`   New title: ${updateResult.data.title}`);
      } else {
        console.log('❌ Failed to update job');
        console.log('   Error:', updateResult.error);
      }

      // Test 5: DELETE /api/jobs/[id] (delete job)
      console.log('\n5. Testing DELETE /api/jobs/[id]...');
      const deleteResponse = await fetch(`${BASE_URL}/api/jobs/${createdJobId}`, {
        method: 'DELETE',
      });
      const deleteData = await deleteResponse.json();
      
      if (deleteResponse.ok) {
        console.log('✅ Job deleted successfully');
      } else {
        console.log('❌ Failed to delete job');
        console.log('   Error:', deleteData.error);
      }
    }

    // Test 6: Verify job was deleted
    if (createdJobId) {
      console.log('\n6. Verifying job deletion...');
      const verifyResponse = await fetch(`${BASE_URL}/api/jobs/${createdJobId}`);
      
      if (verifyResponse.status === 404) {
        console.log('✅ Job successfully deleted (404 as expected)');
      } else {
        console.log('❌ Job still exists after deletion');
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Jobs CRUD integration test completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/jobs`);
    return response.status !== 0; // If we get any response, server is running
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Jobs CRUD Integration Test...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the development server first:');
    console.log('   npm run dev\n');
    process.exit(1);
  }

  await testJobsAPI();
}

main().catch(console.error);
