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
      whereClause.status = status;
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
    const db = getBuildSafeDatabase();
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

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
} 