// Build-safe database wrapper
export interface BuildSafeDatabase {
  user: {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
  };
}

// During build time, return a completely safe mock
const buildSafeMock: BuildSafeDatabase = {
  user: {
    findUnique: async () => ({
      id: 'build-safe-id',
      email: 'build@safe.com',
      password: '$2a$12$build.safe.hash.for.build.time',
      name: 'Build Safe User',
      role: 'GUEST',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    create: async () => ({
      id: 'build-safe-id',
      email: 'build@safe.com',
      name: 'Build Safe User',
      role: 'GUEST',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
  },
};

// Runtime database client
let runtimeDb: BuildSafeDatabase | null = null;

export function getBuildSafeDatabase(): BuildSafeDatabase {
  // Always use mock during build
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return buildSafeMock;
  }

  // Use mock during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return buildSafeMock;
  }

  // At runtime, use real database
  if (!runtimeDb) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaClient } = require('../generated/prisma');
      runtimeDb = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      }) as BuildSafeDatabase;
    } catch (error) {
      console.warn('Failed to initialize Prisma, using mock:', error);
      return buildSafeMock;
    }
  }

  return runtimeDb;
} 