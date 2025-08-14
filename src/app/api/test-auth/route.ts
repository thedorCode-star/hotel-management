import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 TEST-AUTH ENDPOINT CALLED');
  console.log('🔍 Headers received:', Object.fromEntries(request.headers.entries()));
  
  return NextResponse.json({
    message: 'Test auth endpoint working',
    headers: {
      'x-user-id': request.headers.get('x-user-id'),
      'x-user-role': request.headers.get('x-user-role'),
      'x-user-email': request.headers.get('x-user-email'),
    }
  });
}
