import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Fetch specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Get user ID and role from headers (set by middleware)
    const userRole = request.headers.get('x-user-role');
    
    // Only ADMIN and MANAGER can view user details
    if (!['ADMIN', 'MANAGER'].includes(userRole || '')) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        bookings: {
          include: {
            room: true,
            payments: true
          }
        },
        reviews: {
          include: {
            room: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user information
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const userRole = request.headers.get('x-user-role');
    
    // Only ADMIN and MANAGER can update users
    if (!['ADMIN', 'MANAGER'].includes(userRole || '')) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, role, isActive, phone, address } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { message: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use by another user' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        isActive: isActive !== undefined ? isActive : true,
        profile: {
          upsert: {
            create: {
              phone: phone || null,
              address: address || null,
            },
            update: {
              phone: phone || null,
              address: address || null,
            }
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Remove sensitive information
    const { password, ...safeUser } = updatedUser;

    return NextResponse.json({
      message: 'User updated successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const userRole = request.headers.get('x-user-role');
    
    // Only ADMIN can delete users
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Only administrators can delete users' },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'Cannot delete administrator accounts' },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
