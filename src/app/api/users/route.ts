import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get user role from headers (set by middleware)
    const userRole = request.headers.get('x-user-role');
    
    // Only ADMIN and MANAGER can view all users
    if (!['ADMIN', 'MANAGER'].includes(userRole || '')) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      include: {
        profile: true,
        bookings: {
          select: {
            id: true,
            status: true,
            totalPrice: true,
            createdAt: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remove sensitive information and format data
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return {
        ...safeUser,
        // Flatten profile data for easier access
        phone: safeUser.profile?.phone || null,
        address: safeUser.profile?.address || null,
        city: safeUser.profile?.city || null,
        country: safeUser.profile?.country || null,
        postalCode: safeUser.profile?.postalCode || null,
        dateOfBirth: safeUser.profile?.dateOfBirth || null,
        emergencyContact: safeUser.profile?.emergencyContact || null,
        preferences: safeUser.profile?.preferences || null,
        avatar: safeUser.profile?.avatar || null,
        // Keep profile for backward compatibility
        profile: safeUser.profile
      };
    });

    return NextResponse.json({
      users: safeUsers,
      total: safeUsers.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password (you'll need to import bcrypt)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
