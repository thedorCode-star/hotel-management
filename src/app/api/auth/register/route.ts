import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getBuildSafeDatabase } from "../../../../lib/build-safe-db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
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
               { status: 400 }
             );
           }

           // Hash password
           const hashedPassword = await bcrypt.hash(password, 12);

           // Create user
           const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "GUEST",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { 
        message: "User created successfully",
        user 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.format() },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 