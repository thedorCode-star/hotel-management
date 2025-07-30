// Database abstraction that works during build and runtime
export interface DatabaseClient {
  user: {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
  };
}

// Mock client for build time
const mockClient: DatabaseClient = {
  user: {
    findUnique: async () => ({
      id: 'mock-id',
      email: 'mock@example.com',
      password: 'hashed-password',
      name: 'Mock User',
      role: 'GUEST',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    create: async () => ({
      id: 'mock-id',
      email: 'mock@example.com',
      name: 'Mock User',
      role: 'GUEST',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  },
};

// Real client for runtime
let realClient: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
  // During build time or when DATABASE_URL is not available, use mock
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return mockClient;
  }

  // At runtime, use real Prisma client
  if (!realClient) {
    // Dynamic import to prevent build-time loading
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('../generated/prisma');
    realClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    }) as DatabaseClient;
  }

  return realClient || mockClient;
} 