import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    message: "API is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
} 