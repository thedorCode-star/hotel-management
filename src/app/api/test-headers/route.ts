import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const headers = {
    'x-user-id': request.headers.get('x-user-id'),
    'x-user-role': request.headers.get('x-user-role'),
    'x-user-email': request.headers.get('x-user-email'),
    'authorization': request.headers.get('authorization'),
    'cookie': request.headers.get('cookie'),
  };

  return NextResponse.json({
    message: 'Headers received',
    headers,
    allHeaders: Object.fromEntries(request.headers.entries())
  });
}
