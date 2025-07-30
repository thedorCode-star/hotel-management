import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getBuildSafeDatabase } from "../../../../lib/build-safe-db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const db = getBuildSafeDatabase();
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      (user as { password: string }).password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: (user as { id: string | number }).id, 
        email: (user as { email: string }).email, 
        role: (user as { role: string }).role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Create response with user data (excluding password)
    const userData = {
      id: (user as { id: string | number }).id,
      name: (user as { name: string }).name,
      email: (user as { email: string }).email,
      role: (user as { role: string }).role,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.format() },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 