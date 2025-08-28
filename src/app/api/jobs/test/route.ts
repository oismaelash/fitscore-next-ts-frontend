import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/jobs/test - Test Supabase connection
export async function GET() {
  try {
    // Test the connection by trying to count jobs
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      jobCount: count || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
