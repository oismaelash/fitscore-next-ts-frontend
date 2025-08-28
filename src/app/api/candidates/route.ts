import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CandidateInsert } from '@/lib/supabase';

// Helper function to upload resume to Supabase Storage
async function uploadResumeToStorage(file: File, candidateName: string, jobId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${jobId}/${candidateName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload resume: ${error.message}`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Helper function to create candidate in database
async function createCandidate(candidateData: CandidateInsert) {
  const { data, error } = await supabase
    .from('candidates')
    .insert(candidateData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create candidate: ${error.message}`);
  }

  return data;
}

// Helper function to get candidates by job ID
async function getCandidatesByJob(jobId: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const jobId = formData.get('jobId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const resume = formData.get('resume') as File;
    const culturalFitString = formData.get('culturalFit') as string;
    
    // Validate required fields
    if (!jobId || !name || !email || !phone || !resume || !culturalFitString) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Parse cultural fit data
    let culturalFit;
    try {
      culturalFit = JSON.parse(culturalFitString);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid cultural fit data' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(resume.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOC, or DOCX files only.' },
        { status: 400 }
      );
    }

    if (resume.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Upload resume to Supabase Storage
    const resumeUrl = await uploadResumeToStorage(resume, name, jobId);

    // Save candidate data to database
    const candidateData: CandidateInsert = {
      job_id: jobId,
      name,
      email,
      phone,
      resume_url: resumeUrl,
      cultural_fit: culturalFit,
      status: 'new'
    };

    const candidate = await createCandidate(candidateData);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: candidate.id,
        jobId: candidate.job_id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        resumeUrl: candidate.resume_url,
        culturalFit: candidate.cultural_fit,
        status: candidate.status,
        createdAt: candidate.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing candidate application:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Validate job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Fetch candidates from database
    let query = supabase
      .from('candidates')
      .select('*')
      .eq('job_id', jobId);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: candidates, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    // Transform data to match frontend expectations
    const transformedCandidates = candidates?.map(candidate => ({
      id: candidate.id,
      jobId: candidate.job_id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      resumeUrl: candidate.resume_url,
      culturalFit: candidate.cultural_fit,
      status: candidate.status,
      createdAt: candidate.created_at
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedCandidates,
      job: {
        id: job.id,
        title: job.title
      }
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
