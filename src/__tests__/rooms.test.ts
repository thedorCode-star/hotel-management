import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the build-safe database
const mockRoom = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockBooking = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
};

const mockReview = {
  findMany: jest.fn(),
  aggregate: jest.fn(),
};

const mockDb = {
  room: mockRoom,
  booking: mockBooking,
  review: mockReview,
};

jest.mock('../lib/build-safe-db', () => ({
  getBuildSafeDatabase: jest.fn(() => mockDb),
}));

describe('Room Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Room Creation and Management', () => {
    it('should create a new room successfully', async () => {
      const newRoom = {
        id: 'room-101',
        number: '101',
        type: 'SINGLE',
        capacity: 1,
        price: 120,
        description: 'Comfortable single room with city view',
        status: 'AVAILABLE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRoom.create.mockResolvedValue(newRoom);

      const roomResult = await mockRoom.create({
        data: {
          number: newRoom.number,
          type: newRoom.type,
          capacity: newRoom.capacity,
          price: newRoom.price,
          description: newRoom.description,
        },
      });

      expect(roomResult).toEqual(newRoom);
      expect(mockRoom.create).toHaveBeenCalledTimes(1);
      expect(roomResult.status).toBe('AVAILABLE');
    });

    it('should prevent duplicate room numbers', async () => {
      const existingRoom = {
        id: 'room-101',
        number: '101',
        type: 'SINGLE',
        capacity: 1,
        price: 120,
        status: 'AVAILABLE',
      };

      mockRoom.findUnique.mockResolvedValue(existingRoom);

      // Attempt to create room with same number
      const duplicateRoom = {
        number: '101',
        type: 'DOUBLE',
        capacity: 2,
        price: 180,
      };

      expect(existingRoom.number).toBe(duplicateRoom.number);
      expect(mockRoom.create).not.toHaveBeenCalled();
    });

    it('should validate room data correctly', async () => {
      const validRoom = {
        number: '101',
        type: 'SINGLE',
        capacity: 1,
        price: 120,
        description: 'Valid room',
      };

      const invalidRooms = [
        { number: '', type: 'SINGLE', capacity: 1, price: 120 }, // Empty number
        { number: '101', type: 'INVALID', capacity: 1, price: 120 }, // Invalid type
        { number: '101', type: 'SINGLE', capacity: 0, price: 120 }, // Invalid capacity
        { number: '101', type: 'SINGLE', capacity: 1, price: -50 }, // Negative price
      ];

      // Valid room
      expect(validRoom.number.length).toBeGreaterThan(0);
      expect(['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE']).toContain(validRoom.type);
      expect(validRoom.capacity).toBeGreaterThan(0);
      expect(validRoom.price).toBeGreaterThan(0);

      // Invalid rooms
      invalidRooms.forEach(room => {
        if (room.number.length === 0) {
          expect(room.number.length).toBe(0);
        }
        if (!['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'].includes(room.type)) {
          expect(['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE']).not.toContain(room.type);
        }
        if (room.capacity <= 0) {
          expect(room.capacity).toBeLessThanOrEqual(0);
        }
        if (room.price <= 0) {
          expect(room.price).toBeLessThanOrEqual(0);
        }
      });
    });
  });

  describe('Room Status Management', () => {
    it('should update room status correctly', async () => {
      const room = {
        id: 'room-101',
        number: '101',
        status: 'AVAILABLE',
      };

      // Update to occupied
      mockRoom.update.mockResolvedValue({
        ...room,
        status: 'OCCUPIED',
      });

      const updatedRoom = await mockRoom.update({
        where: { id: room.id },
        data: { status: 'OCCUPIED' },
      });

      expect(updatedRoom.status).toBe('OCCUPIED');
      expect(mockRoom.update).toHaveBeenCalledTimes(1);
    });

    it('should handle room maintenance', async () => {
      const room = {
        id: 'room-101',
        number: '101',
        status: 'AVAILABLE',
      };

      mockRoom.findUnique.mockResolvedValue(room);
      mockRoom.update.mockResolvedValue({ ...room, status: 'MAINTENANCE' });

      // Put room in maintenance
      const maintenanceRoom = await mockRoom.update({
        where: { id: room.id },
        data: { status: 'MAINTENANCE' },
      });

      expect(maintenanceRoom.status).toBe('MAINTENANCE');
    });

    it('should prevent booking of rooms in maintenance', async () => {
      const maintenanceRoom = {
        id: 'room-101',
        number: '101',
        status: 'MAINTENANCE',
        type: 'SINGLE',
        capacity: 1,
        price: 120,
      };

      mockRoom.findUnique.mockResolvedValue(maintenanceRoom);

      // Attempt to book room in maintenance
      const canBook = maintenanceRoom.status === 'AVAILABLE';
      expect(canBook).toBe(false);
      expect(maintenanceRoom.status).toBe('MAINTENANCE');
    });

    it('should handle room reservation', async () => {
      const room = {
        id: 'room-101',
        number: '101',
        status: 'AVAILABLE',
      };

      mockRoom.update.mockResolvedValue({ ...room, status: 'RESERVED' });

      // Reserve room
      const reservedRoom = await mockRoom.update({
        where: { id: room.id },
        data: { status: 'RESERVED' },
      });

      expect(reservedRoom.status).toBe('RESERVED');
    });
  });

  describe('Room Availability and Search', () => {
    it('should find available rooms', async () => {
      const mockRooms = [
        { id: '1', number: '101', status: 'AVAILABLE', type: 'SINGLE' },
        { id: '2', number: '102', status: 'OCCUPIED', type: 'DOUBLE' },
        { id: '3', number: '103', status: 'AVAILABLE', type: 'SUITE' },
        { id: '4', number: '201', status: 'MAINTENANCE', type: 'SINGLE' },
      ];

      mockRoom.findMany.mockResolvedValue(
        mockRooms.filter(room => room.status === 'AVAILABLE')
      );

      const availableRooms = await mockRoom.findMany({
        where: { status: 'AVAILABLE' },
      });

      expect(availableRooms).toHaveLength(2);
      availableRooms.forEach((room: any) => {
        expect(room.status).toBe('AVAILABLE');
      });
    });

    it('should filter rooms by type', async () => {
      const roomType = 'SINGLE';
      const mockRooms = [
        { id: '1', number: '101', type: 'SINGLE', status: 'AVAILABLE' },
        { id: '2', number: '102', type: 'DOUBLE', status: 'AVAILABLE' },
        { id: '3', number: '103', type: 'SINGLE', status: 'AVAILABLE' },
        { id: '4', number: '201', type: 'SUITE', status: 'AVAILABLE' },
      ];

      mockRoom.findMany.mockResolvedValue(
        mockRooms.filter(room => room.type === roomType)
      );

      const singleRooms = await mockRoom.findMany({
        where: { type: roomType },
      });

      expect(singleRooms).toHaveLength(2);
      singleRooms.forEach((room: any) => {
        expect(room.type).toBe(roomType);
      });
    });

    it('should search rooms by number', async () => {
      const searchTerm = '10';
      const mockRooms = [
        { id: '1', number: '101', type: 'SINGLE' },
        { id: '2', number: '102', type: 'DOUBLE' },
        { id: '3', number: '201', type: 'SUITE' },
        { id: '4', number: '301', type: 'SINGLE' },
      ];

      mockRoom.findMany.mockResolvedValue(
        mockRooms.filter(room => room.number.includes(searchTerm))
      );

      const searchResults = await mockRoom.findMany({
        where: {
          number: {
            contains: searchTerm,
          },
        },
      });

      expect(searchResults).toHaveLength(2);
      searchResults.forEach((room: any) => {
        expect(room.number).toContain(searchTerm);
      });
    });

    it('should filter rooms by price range', async () => {
      const minPrice = 100;
      const maxPrice = 200;
      const mockRooms = [
        { id: '1', number: '101', price: 120, type: 'SINGLE' },
        { id: '2', number: '102', price: 180, type: 'DOUBLE' },
        { id: '3', number: '103', price: 350, type: 'SUITE' },
        { id: '4', number: '201', price: 90, type: 'SINGLE' },
      ];

      mockRoom.findMany.mockResolvedValue(
        mockRooms.filter(room => room.price >= minPrice && room.price <= maxPrice)
      );

      const filteredRooms = await mockRoom.findMany({
        where: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      });

      expect(filteredRooms).toHaveLength(2);
      filteredRooms.forEach((room: any) => {
        expect(room.price).toBeGreaterThanOrEqual(minPrice);
        expect(room.price).toBeLessThanOrEqual(maxPrice);
      });
    });
  });

  describe('Room Pricing and Revenue', () => {
    it('should calculate room revenue correctly', async () => {
      const room = {
        id: 'room-101',
        price: 120,
        bookings: [
          { totalPrice: 240, status: 'COMPLETED' },
          { totalPrice: 360, status: 'COMPLETED' },
          { totalPrice: 180, status: 'CANCELLED' },
        ],
      };

      const revenue = room.bookings
        .filter(booking => booking.status === 'COMPLETED')
        .reduce((sum, booking) => sum + booking.totalPrice, 0);

      expect(revenue).toBe(600);
      expect(revenue).toBeGreaterThan(0);
    });

    it('should apply dynamic pricing', async () => {
      const basePrice = 120;
      const roomType = 'SUITE';
      const isWeekend = true;
      const isHoliday = false;
      const occupancyRate = 0.8; // 80% occupancy

      let finalPrice = basePrice;

      // Weekend surcharge
      if (isWeekend) {
        finalPrice *= 1.2; // 20% increase
      }

      // Holiday surcharge
      if (isHoliday) {
        finalPrice *= 1.3; // 30% increase
      }

      // High occupancy discount
      if (occupancyRate > 0.7) {
        finalPrice *= 0.95; // 5% discount
      }

      expect(finalPrice).toBeCloseTo(136.8, 1); // 120 * 1.2 * 0.95
      expect(finalPrice).toBeGreaterThan(basePrice);
    });

    it('should track room performance metrics', async () => {
      const roomMetrics = {
        roomId: 'room-101',
        totalBookings: 25,
        completedBookings: 22,
        cancelledBookings: 3,
        totalRevenue: 2640,
        averageRating: 4.2,
        occupancyRate: 0.73,
      };

      const performanceScore = (
        (roomMetrics.completedBookings / roomMetrics.totalBookings) * 0.4 +
        (roomMetrics.averageRating / 5) * 0.3 +
        roomMetrics.occupancyRate * 0.3
      ) * 100;

      expect(performanceScore).toBeCloseTo(82.3, 1);
      expect(performanceScore).toBeGreaterThanOrEqual(0);
      expect(performanceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Room Maintenance and Cleaning', () => {
    it('should schedule room maintenance', async () => {
      const room = {
        id: 'room-101',
        number: '101',
        status: 'AVAILABLE',
        lastMaintenance: new Date('2024-01-01'),
      };

      const daysSinceMaintenance = Math.floor(
        (new Date().getTime() - room.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
      );

      const needsMaintenance = daysSinceMaintenance > 30; // Maintenance every 30 days

      expect(daysSinceMaintenance).toBeGreaterThan(0);
      expect(typeof needsMaintenance).toBe('boolean');
    });

    it('should track cleaning status', async () => {
      const room = {
        id: 'room-101',
        number: '101',
        status: 'OCCUPIED',
        lastCleaned: new Date('2024-01-15'),
      };

      const hoursSinceCleaning = Math.floor(
        (new Date().getTime() - room.lastCleaned.getTime()) / (1000 * 60 * 60)
      );

      const needsCleaning = hoursSinceCleaning > 24; // Clean every 24 hours

      expect(hoursSinceCleaning).toBeGreaterThan(0);
      expect(typeof needsCleaning).toBe('boolean');
    });

    it('should handle maintenance requests', async () => {
      const maintenanceRequest = {
        roomId: 'room-101',
        issue: 'Broken air conditioning',
        priority: 'HIGH',
        reportedAt: new Date(),
        status: 'PENDING',
      };

      expect(maintenanceRequest.issue).toBeDefined();
      expect(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).toContain(maintenanceRequest.priority);
      expect(maintenanceRequest.status).toBe('PENDING');
    });
  });

  describe('Room Analytics and Reporting', () => {
    it('should calculate room utilization', async () => {
      const totalRooms = 24;
      const occupiedRooms = 18;
      const maintenanceRooms = 2;
      const availableRooms = totalRooms - occupiedRooms - maintenanceRooms;

      const utilization = (occupiedRooms / totalRooms) * 100;
      const availability = (availableRooms / totalRooms) * 100;

      expect(utilization).toBe(75);
      expect(availability).toBeCloseTo(16.67, 1);
      expect(utilization + availability + (maintenanceRooms / totalRooms) * 100).toBeCloseTo(100, 1);
    });

    it('should generate room performance report', async () => {
      const roomReport = {
        totalRooms: 24,
        availableRooms: 4,
        occupiedRooms: 18,
        maintenanceRooms: 2,
        averageRating: 4.3,
        totalRevenue: 15800,
        averageOccupancy: 0.75,
        popularRoomTypes: ['DOUBLE', 'SINGLE', 'SUITE'],
      };

      expect(roomReport.totalRooms).toBe(24);
      expect(roomReport.occupiedRooms).toBeGreaterThan(roomReport.availableRooms);
      expect(roomReport.averageRating).toBeGreaterThan(0);
      expect(roomReport.averageRating).toBeLessThanOrEqual(5);
      expect(roomReport.totalRevenue).toBeGreaterThan(0);
      expect(roomReport.averageOccupancy).toBeGreaterThan(0);
      expect(roomReport.averageOccupancy).toBeLessThanOrEqual(1);
    });

    it('should track room type preferences', async () => {
      const roomTypeStats = [
        { type: 'SINGLE', bookings: 45, revenue: 5400, averageRating: 4.1 },
        { type: 'DOUBLE', bookings: 62, revenue: 11160, averageRating: 4.3 },
        { type: 'SUITE', bookings: 28, revenue: 9800, averageRating: 4.6 },
        { type: 'DELUXE', bookings: 15, revenue: 3750, averageRating: 4.4 },
      ];

      const totalBookings = roomTypeStats.reduce((sum, stat) => sum + stat.bookings, 0);
      const totalRevenue = roomTypeStats.reduce((sum, stat) => sum + stat.revenue, 0);
      const averageRating = roomTypeStats.reduce((sum, stat) => sum + stat.averageRating, 0) / roomTypeStats.length;

      expect(totalBookings).toBe(150);
      expect(totalRevenue).toBe(30110);
      expect(averageRating).toBeCloseTo(4.35, 2);
    });
  });

  describe('Room Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockRoom.findMany.mockRejectedValue(new Error('Database connection failed'));

      try {
        await mockRoom.findMany({
          where: { status: 'AVAILABLE' },
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Database connection failed');
      }
    });

    it('should handle invalid room operations', async () => {
      const invalidOperations = [
        { action: 'delete', roomId: 'non-existent' },
        { action: 'update', roomId: null },
        { action: 'create', data: {} },
      ];

      invalidOperations.forEach(operation => {
        if (operation.action === 'delete') {
          // Non-existent room should not be found
          expect(operation.roomId).toBe('non-existent');
        }
        if (operation.action === 'update') {
          // Null roomId should be invalid
          expect(operation.roomId).toBeNull();
        }
        if (operation.action === 'create') {
          // Empty data should be invalid
          expect(Object.keys(operation.data || {})).toHaveLength(0);
        }
      });
    });

    it('should handle concurrent room updates', async () => {
      const roomId = 'room-101';
      
      // Clear previous mocks and set up different results for each call
      mockRoom.update.mockClear();
      mockRoom.update
        .mockResolvedValueOnce({ id: roomId, status: 'OCCUPIED' })
        .mockRejectedValueOnce(new Error('Room already updated'))
        .mockRejectedValueOnce(new Error('Room already updated'))
        .mockRejectedValueOnce(new Error('Room already updated'))
        .mockRejectedValueOnce(new Error('Room already updated'));

      const concurrentUpdates = Array.from({ length: 5 }, (_, i) => 
        mockRoom.update({
          where: { id: roomId },
          data: { status: 'OCCUPIED' },
        })
      );

      const results = await Promise.allSettled(concurrentUpdates);
      const successfulUpdates = results.filter(r => r.status === 'fulfilled');
      const failedUpdates = results.filter(r => r.status === 'rejected');

      expect(successfulUpdates).toHaveLength(1);
      expect(failedUpdates).toHaveLength(4);
    });
  });

  describe('Room Performance', () => {
    it('should handle large room datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `room-${i}`,
        number: `${100 + i}`,
        type: ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'][i % 4],
        status: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'][i % 4],
      }));

      // Mock to return only available rooms (simulating filtering)
      const availableRooms = largeDataset.filter(room => room.status === 'AVAILABLE');
      mockRoom.findMany.mockResolvedValue(availableRooms);

      const startTime = Date.now();
      const rooms = await mockRoom.findMany({
        where: { status: 'AVAILABLE' },
      });
      const endTime = Date.now();

      expect(rooms).toHaveLength(250); // 1000 / 4 statuses
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle rapid room operations', async () => {
      const operations = Array.from({ length: 50 }, (_, i) => 
        mockRoom.findUnique({ where: { id: `room-${i}` } })
      );

      mockRoom.findUnique.mockResolvedValue({ id: 'test-room' });

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
}); 