// This file prevents Prisma from running during build time
import { PrismaClient } from '../generated/prisma';

let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  // During build time, return a mock client
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return {
      user: {
        findUnique: async () => null,
        create: async () => null,
      },
      // Add other models as needed
    } as unknown as PrismaClient;
  }

  // At runtime, return the real client
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  return prismaClient;
} 