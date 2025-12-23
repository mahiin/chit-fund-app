import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({
        success: true,
        authenticated: false,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check session' },
      { status: 500 }
    );
  }
}

