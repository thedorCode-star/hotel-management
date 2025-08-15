import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection...');
    
    const db = getBuildSafeDatabase();
    console.log('✅ Database client created successfully');
    
    // Test a simple query
    const roomCount = await db.room.count();
    console.log('✅ Database query successful, room count:', roomCount);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      roomCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
