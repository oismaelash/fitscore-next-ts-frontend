import { NextRequest, NextResponse } from 'next/server';
import { Interview } from '@/types';

// Mock database for demonstration
let interviews: Interview[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get('candidateId');
  const jobId = searchParams.get('jobId');

  let filteredInterviews = interviews;

  if (candidateId) {
    filteredInterviews = filteredInterviews.filter(interview => interview.candidateId === candidateId);
  }

  if (jobId) {
    filteredInterviews = filteredInterviews.filter(interview => interview.jobId === jobId);
  }

  return NextResponse.json({
    success: true,
    data: filteredInterviews,
    message: 'Interviews retrieved successfully'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'> = body;

    const newInterview: Interview = {
      id: Date.now().toString(),
      ...interviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    interviews.push(newInterview);

    return NextResponse.json({
      success: true,
      data: newInterview,
      message: 'Interview created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create interview',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const interviewIndex = interviews.findIndex(interview => interview.id === id);
    
    if (interviewIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found'
      }, { status: 404 });
    }

    interviews[interviewIndex] = {
      ...interviews[interviewIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: interviews[interviewIndex],
      message: 'Interview updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update interview',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Interview ID is required'
      }, { status: 400 });
    }

    const interviewIndex = interviews.findIndex(interview => interview.id === id);
    
    if (interviewIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found'
      }, { status: 404 });
    }

    const deletedInterview = interviews[interviewIndex];
    interviews.splice(interviewIndex, 1);

    return NextResponse.json({
      success: true,
      data: deletedInterview,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to delete interview',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}
