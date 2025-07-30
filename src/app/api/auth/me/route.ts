import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getBuildSafeDatabase } from "../../../../lib/build-safe-db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No authentication token" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;

               // Get user from database
           const db = getBuildSafeDatabase();
           const user = await db.user.findUnique({
             where: { id: decoded.userId },
             select: {
               id: true,
               name: true,
               email: true,
               role: true,
               createdAt: true,
             },
           });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    );
  }
} 