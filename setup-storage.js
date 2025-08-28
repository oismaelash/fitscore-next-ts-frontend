const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure you have:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for resumes...\n');

  try {
    // Check if the resumes bucket exists
    console.log('1. Checking if resumes bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const resumesBucket = buckets.find(bucket => bucket.name === 'resumes');
    
    if (resumesBucket) {
      console.log('✅ Resumes bucket already exists');
    } else {
      console.log('📦 Creating resumes bucket...');
      const { data: bucket, error: createError } = await supabase.storage.createBucket('resumes', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 5242880 // 5MB in bytes
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        return;
      }

      console.log('✅ Resumes bucket created successfully');
    }

    // Set up bucket policies
    console.log('\n2. Setting up bucket policies...');
    
    // Policy to allow authenticated users to upload files
    const { error: uploadPolicyError } = await supabase.storage
      .from('resumes')
      .createPolicy('Allow authenticated uploads', {
        name: 'Allow authenticated uploads',
        definition: {
          role: 'authenticated',
          operation: 'INSERT'
        }
      });

    if (uploadPolicyError && !uploadPolicyError.message.includes('already exists')) {
      console.error('❌ Error creating upload policy:', uploadPolicyError.message);
    } else {
      console.log('✅ Upload policy configured');
    }

    // Policy to allow public read access
    const { error: readPolicyError } = await supabase.storage
      .from('resumes')
      .createPolicy('Allow public read access', {
        name: 'Allow public read access',
        definition: {
          role: 'anon',
          operation: 'SELECT'
        }
      });

    if (readPolicyError && !readPolicyError.message.includes('already exists')) {
      console.error('❌ Error creating read policy:', readPolicyError.message);
    } else {
      console.log('✅ Read policy configured');
    }

    console.log('\n🎉 Storage setup completed successfully!');
    console.log('\n📋 Storage Configuration:');
    console.log('- Bucket: resumes');
    console.log('- Public: true');
    console.log('- Allowed file types: PDF, DOC, DOCX');
    console.log('- Max file size: 5MB');
    console.log('- File structure: {jobId}/{candidateName}_{timestamp}.{extension}');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Test file upload
async function testFileUpload() {
  console.log('\n🧪 Testing file upload...');
  
  try {
    // Create a test file
    const testContent = 'This is a test resume file';
    const testFile = new Blob([testContent], { type: 'application/pdf' });
    
    const fileName = `test/test-resume-${Date.now()}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Upload test failed:', error.message);
      return;
    }

    console.log('✅ Test file uploaded successfully');
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    console.log('📎 Public URL:', publicUrl);
    
    // Test downloading the file
    const response = await fetch(publicUrl);
    if (response.ok) {
      console.log('✅ File download test successful');
    } else {
      console.log('⚠️ File download test failed');
    }

  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
  }
}

// Run setup
async function main() {
  await setupStorage();
  await testFileUpload();
}

main().catch(console.error);
