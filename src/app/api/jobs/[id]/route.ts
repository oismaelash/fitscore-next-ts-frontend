import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { JobUpdate } from '@/lib/supabase';

// GET /api/jobs/[id] - Get a specific job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching job:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: job });

  } catch (error) {
    console.error('Unexpected error in GET /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Update a specific job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Transform the data to match database schema
    const updateData: JobUpdate = {
      updated_at: new Date().toISOString()
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.performance !== undefined) updateData.performance = body.performance;
    if (body.energy !== undefined) updateData.energy = body.energy;
    if (body.culture !== undefined) updateData.culture = body.culture;
    if (body.applicationLink !== undefined) updateData.application_link = body.applicationLink;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json(
        { error: 'Failed to update job', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedJob,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete a specific job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if job exists
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if there are any candidates associated with this job
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id')
      .eq('job_id', id);

    if (candidatesError) {
      console.error('Error checking candidates:', candidatesError);
      return NextResponse.json(
        { error: 'Failed to check job dependencies' },
        { status: 500 }
      );
    }

    if (candidates && candidates.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete job with existing candidates. Please remove all candidates first.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json(
        { error: 'Failed to delete job', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
