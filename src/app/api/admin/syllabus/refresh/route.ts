import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Admin API for manual Skolverket syllabus refresh
 * POST /api/admin/syllabus/refresh
 * 
 * Protected route for triggering manual curriculum data refresh
 * Requires admin API key for security
 */

interface RefreshRequest {
  fresh?: boolean; // Whether to do a fresh import (clears existing data)
}

interface RefreshResponse {
  success: boolean;
  message: string;
  stats?: {
    subjectsProcessed: number;
    processingTime: number;
    apiSource: string;
  };
  error?: string;
}

function isAuthorized(request: NextRequest): boolean {
  const adminApiKey = process.env.ADMIN_API_KEY;
  
  if (!adminApiKey) {
    console.error('ADMIN_API_KEY not configured');
    return false;
  }
  
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  return apiKey === adminApiKey;
}

export async function POST(request: NextRequest): Promise<NextResponse<RefreshResponse>> {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Otillräcklig behörighet' 
        },
        { status: 401 }
      );
    }
    
    const body: RefreshRequest = await request.json().catch(() => ({}));
    const { fresh = false } = body;
    
    console.log(`🔄 Starting manual syllabus refresh (fresh=${fresh})`);
    const startTime = Date.now();
    
    // Execute ETL script
    const scriptPath = path.join(process.cwd(), 'scripts/etl/skolverket.js');
    const command = `node ${scriptPath}${fresh ? ' --fresh' : ''}`;
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        timeout: 300000, // 5 minute timeout
        env: {
          ...process.env,
          NODE_ENV: 'production' // Ensure production behavior
        }
      });
      
      const processingTime = Date.now() - startTime;
      
      // Parse output for stats (basic parsing)
      const subjectsMatch = output.match(/Processed (\d+) subjects/);
      const sourceMatch = output.match(/using ([\w_]+)/);
      
      const stats = {
        subjectsProcessed: subjectsMatch ? parseInt(subjectsMatch[1]) : 0,
        processingTime,
        apiSource: sourceMatch ? sourceMatch[1] : 'unknown'
      };
      
      console.log(`✅ Manual refresh completed in ${processingTime}ms`);
      
      return NextResponse.json({
        success: true,
        message: 'Syllabusdata uppdaterad framgångsrikt',
        stats
      });
      
    } catch (execError) {
      console.error('ETL script execution failed:', execError);
      
      return NextResponse.json(
        {
          success: false,
          message: 'ETL-processen misslyckades',
          error: execError instanceof Error ? execError.message : 'Okänt fel'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Admin refresh request failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Serverfel under syllabusuppdatering',
        error: error instanceof Error ? error.message : 'Okänt fel'
      },
      { status: 500 }
    );
  }
}

// Only allow POST
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Metod ej tillåten' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Metod ej tillåten' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Metod ej tillåten' },
    { status: 405 }
  );
}