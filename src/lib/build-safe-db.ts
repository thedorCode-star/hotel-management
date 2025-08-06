// Build-safe database wrapper
export interface BuildSafeDatabase {
  [x: string]: any;
  user: {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    count: (args: unknown) => Promise<unknown>;
    groupBy: (args: unknown) => Promise<unknown>;
  };
  room: {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    count: (args: unknown) => Promise<unknown>;
    groupBy: (args: unknown) => Promise<unknown>;
  };
  booking: {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    count: (args: unknown) => Promise<unknown>;
    aggregate: (args: unknown) => Promise<unknown>;
  };
  reviews: {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    count: (args: unknown) => Promise<unknown>;
    aggregate: (args: unknown) => Promise<unknown>;
  };
  payment: {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    count: (args: unknown) => Promise<unknown>;
    aggregate: (args: unknown) => Promise<unknown>;
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
    findMany: async () => [],
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    groupBy: async () => [],
  },
  room: {
    findUnique: async () => ({
      id: 'room-safe-id',
      number: '101',
      type: 'SINGLE',
      capacity: 2,
      price: 100,
      status: 'AVAILABLE',
      description: 'Build safe room',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    create: async () => ({
      id: 'room-safe-id',
      number: '101',
      type: 'SINGLE',
      capacity: 2,
      price: 100,
      status: 'AVAILABLE',
      description: 'Build safe room',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    findMany: async () => [],
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    groupBy: async () => [],
  },
  booking: {
    findUnique: async () => ({
      id: 'booking-safe-id',
      roomId: 'room-safe-id',
      userId: 'build-safe-id',
      checkIn: new Date('2024-01-01'),
      checkOut: new Date('2024-01-03'),
      totalPrice: 200,
      status: 'PENDING',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    create: async () => ({
      id: 'booking-safe-id',
      roomId: 'room-safe-id',
      userId: 'build-safe-id',
      checkIn: new Date('2024-01-01'),
      checkOut: new Date('2024-01-03'),
      totalPrice: 200,
      status: 'PENDING',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    findMany: async () => [],
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    aggregate: async () => ({ _sum: { totalPrice: 0 }, _avg: { totalPrice: 0 } }),
  },
  reviews: {
    findUnique: async () => ({
      id: 'review-safe-id',
      roomId: 'room-safe-id',
      userId: 'build-safe-id',
      rating: 5,
      comment: 'Build safe review',
      status: 'APPROVED',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    create: async () => ({
      id: 'review-safe-id',
      roomId: 'room-safe-id',
      userId: 'build-safe-id',
      rating: 5,
      comment: 'Build safe review',
      status: 'APPROVED',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    findMany: async () => [],
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    aggregate: async () => ({ _sum: { rating: 0 }, _avg: { rating: 0 } }),
  },
  payment: {
    findUnique: async () => ({
      id: 'payment-safe-id',
      bookingId: 'booking-safe-id',
      amount: 200,
      paymentMethod: 'credit_card',
      status: 'completed',
      transactionId: 'txn-safe-id',
      processedAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    create: async () => ({
      id: 'payment-safe-id',
      bookingId: 'booking-safe-id',
      amount: 200,
      paymentMethod: 'credit_card',
      status: 'completed',
      transactionId: 'txn-safe-id',
      processedAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }),
    findMany: async () => [],
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    aggregate: async () => ({ _sum: { amount: 0 }, _avg: { amount: 0 } }),
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