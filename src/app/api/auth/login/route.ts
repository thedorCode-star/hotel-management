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
    const jwt = await import('jsonwebtoken');
    const { z } = await import('zod');
    const { getBuildSafeDatabase } = await import('../../../../lib/build-safe-db');

    const loginSchema = z.object({
      email: z.string().email("Please enter a valid email address"),
      password: z.string().min(1, "Password is required"),
    });

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const db = getBuildSafeDatabase();
    const user = await db.user.findUnique({
      where: { email },
    }) as { id: string; email: string; password: string; name: string; role: string } | null;

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token - temporarily hardcode for testing
    const jwtSecret = 'dev-secret-change-me-in-production';
    console.log('Login API using JWT_SECRET:', jwtSecret);
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Create response with user data (excluding password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json(
      { 
        message: "Login successful",
        user: userData,
        token 
      },
      { status: 200 }
    );

    // Set HTTP-only cookie with JWT token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 