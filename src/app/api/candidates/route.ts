import { NextRequest, NextResponse } from 'next/server';
import { CandidateForm } from '@/types';

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

    // TODO: Upload resume to Supabase Storage
    // const resumeUrl = await uploadResumeToStorage(resume);

    // TODO: Save candidate data to database
    // const candidate = await createCandidate({
    //   jobId,
    //   name,
    //   email,
    //   phone,
    //   resumeUrl,
    //   culturalFit,
    //   status: 'new'
    // });

    // For now, return success response
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        jobId,
        name,
        email,
        phone,
        culturalFit
      }
    });

  } catch (error) {
    console.error('Error processing candidate application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch candidates from database
    // const candidates = await getCandidatesByJob(jobId);

    // For now, return empty array
    return NextResponse.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
