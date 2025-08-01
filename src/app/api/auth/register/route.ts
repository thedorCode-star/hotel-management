import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering and skip build analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Skip this route during build time completely
export async function POST(request: NextRequest) {
  // During build time, return immediately
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return new NextResponse('Service unavailable during build', { status: 503 });
  }

  // Only import and use database at runtime
  try {
    const bcrypt = await import('bcryptjs');
    const { z } = await import('zod');
    const { getBuildSafeDatabase } = await import('../../../../lib/build-safe-db');

    const registerSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const db = getBuildSafeDatabase();
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "GUEST",
      },
    }) as { id: string; name: string; email: string; role: string };

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: userData 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 