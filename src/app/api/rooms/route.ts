import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let whereClause: any = {};
    
    if (status && status !== 'all') {
      // Handle comma-separated status values
      if (status.includes(',')) {
        const statuses = status.split(',').map(s => s.trim());
        whereClause.status = {
          in: statuses
        };
      } else {
        whereClause.status = status;
      }
    }
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    const rooms = await db.room.findMany({
      where: whereClause,
      orderBy: { number: 'asc' },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 ROOM CREATION ATTEMPT RECEIVED');
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Check if user is authenticated via cookie
    const cookies = request.cookies;
    const authToken = cookies.get('auth-token')?.value;
    
    console.log('🍪 Auth token present:', !!authToken);
    
    if (!authToken) {
      console.log('❌ No auth token found - BLOCKING ACCESS');
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }
    
    // TODO: In production, verify JWT token and extract real user info
    // For now, we'll use a simple approach - check if user is logged in
    const db = getBuildSafeDatabase();
    
    // Try to find a user with this token (simplified approach)
    // In production, this should verify the JWT and extract user info
    let userId: string;
    let userRole: string;
    
    try {
      // For now, assume any authenticated user is ADMIN
      // This is TEMPORARY - we need to fix the middleware
      userId = 'authenticated-user';
      userRole = 'ADMIN';
      
      console.log('✅ User authenticated, role:', userRole);
    } catch (error) {
      console.log('❌ Error verifying user:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    console.log('👤 User attempting room creation:', { userId, userRole });
    
    // Check if user has permission to create rooms
    const allowedRoles = ['ADMIN', 'MANAGER', 'STAFF'];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only ADMIN, MANAGER, and STAFF can create rooms.' },
        { status: 403 }
      );
    }
    const body = await request.json();
    
    const { number, type, capacity, price, description } = body;

    // Validation
    if (!number || !type || !capacity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (capacity < 1 || capacity > 10) {
      return NextResponse.json(
        { error: 'Capacity must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: 'Price must be positive' },
        { status: 400 }
      );
    }

    // Check if room number already exists
    const existingRoom = await db.room.findUnique({
      where: { number },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room number already exists' },
        { status: 409 }
      );
    }

    const room = await db.room.create({
      data: {
        number,
        type,
        capacity,
        price,
        description,
        status: 'AVAILABLE',
      },
    });

    // Log the room creation for security audit
    console.log(`🔐 ROOM CREATED: User ${userId} (${userRole}) created room ${number}`);

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
} 