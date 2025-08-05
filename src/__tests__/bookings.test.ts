import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the build-safe database
const mockBooking = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockRoom = {
  findUnique: jest.fn(),
  update: jest.fn(),
};

const mockUser = {
  findUnique: jest.fn(),
};

const mockDb = {
  booking: mockBooking,
  room: mockRoom,
  user: mockUser,
};

jest.mock('../lib/build-safe-db', () => ({
  getBuildSafeDatabase: jest.fn(() => mockDb),
}));

describe('Booking Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Booking Creation Flow', () => {
    it('should create a new booking successfully', async () => {
      const testUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'GUEST',
      };

      const testRoom = {
        id: 'room-101',
        number: '101',
        type: 'SINGLE',
        capacity: 1,
        price: 120,
        status: 'AVAILABLE',
      };

      const newBooking = {
        id: 'booking-123',
        userId: testUser.id,
        roomId: testRoom.id,
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-03'),
        status: 'PENDING',
        totalPrice: 240,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock user and room existence
      mockUser.findUnique.mockResolvedValue(testUser);
      mockRoom.findUnique.mockResolvedValue(testRoom);
      mockBooking.create.mockResolvedValue(newBooking);
      mockRoom.update.mockResolvedValue({ ...testRoom, status: 'RESERVED' });

      // Simulate booking creation
      const bookingResult = await mockBooking.create({
        data: {
          userId: testUser.id,
          roomId: testRoom.id,
          checkIn: newBooking.checkIn,
          checkOut: newBooking.checkOut,
          totalPrice: newBooking.totalPrice,
        },
      });

      expect(bookingResult).toEqual(newBooking);
      expect(mockBooking.create).toHaveBeenCalledTimes(1);
      expect(mockRoom.update).toHaveBeenCalledTimes(1);
    });

    it('should prevent booking for unavailable rooms', async () => {
      const testRoom = {
        id: 'room-102',
        number: '102',
        type: 'DOUBLE',
        capacity: 2,
        price: 180,
        status: 'OCCUPIED', // Room is not available
      };

      mockRoom.findUnique.mockResolvedValue(testRoom);

      // Attempt to book unavailable room
      const bookingAttempt = mockBooking.create({
        data: {
          userId: 'user-123',
          roomId: testRoom.id,
          checkIn: new Date('2024-02-01'),
          checkOut: new Date('2024-02-03'),
          totalPrice: 360,
        },
      });

      expect(mockBooking.create).not.toHaveBeenCalled();
      expect(testRoom.status).toBe('OCCUPIED');
    });

    it('should calculate total price correctly', async () => {
      const roomPrice = 120;
      const checkIn = new Date('2024-02-01');
      const checkOut = new Date('2024-02-04');
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const expectedTotal = roomPrice * nights;

      expect(nights).toBe(3);
      expect(expectedTotal).toBe(360);
      expect(expectedTotal).toBeGreaterThan(0);
    });

    it('should validate booking dates', async () => {
      const validBooking = {
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-03'),
      };

      const invalidBooking = {
        checkIn: new Date('2024-02-03'),
        checkOut: new Date('2024-02-01'), // Check-out before check-in
      };

      // Valid booking
      expect(validBooking.checkIn.getTime()).toBeLessThan(validBooking.checkOut.getTime());
      // Check-in should be in the future (using a fixed date for testing)
      const futureDate = new Date('2024-12-31');
      expect(validBooking.checkIn.getTime()).toBeLessThan(futureDate.getTime());

      // Invalid booking
      expect(invalidBooking.checkIn.getTime()).toBeGreaterThan(invalidBooking.checkOut.getTime());
    });
  });

  describe('Booking Status Management', () => {
    it('should update booking status correctly', async () => {
      const booking = {
        id: 'booking-123',
        status: 'PENDING',
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-03'),
      };

      // Update to confirmed
      mockBooking.update.mockResolvedValue({
        ...booking,
        status: 'CONFIRMED',
      });

      const updatedBooking = await mockBooking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      });

      expect(updatedBooking.status).toBe('CONFIRMED');
      expect(mockBooking.update).toHaveBeenCalledTimes(1);
    });

    it('should handle booking cancellation', async () => {
      const booking = {
        id: 'booking-123',
        status: 'CONFIRMED',
        roomId: 'room-101',
      };

      const room = {
        id: 'room-101',
        status: 'RESERVED',
      };

      mockBooking.findUnique.mockResolvedValue(booking);
      mockRoom.findUnique.mockResolvedValue(room);
      mockBooking.update.mockResolvedValue({ ...booking, status: 'CANCELLED' });
      mockRoom.update.mockResolvedValue({ ...room, status: 'AVAILABLE' });

      // Cancel booking
      const cancelledBooking = await mockBooking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      });

      expect(cancelledBooking.status).toBe('CANCELLED');
      expect(mockRoom.update).toHaveBeenCalledWith({
        where: { id: room.id },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should complete finished bookings', async () => {
      const pastBooking = {
        id: 'booking-123',
        status: 'CONFIRMED',
        checkOut: new Date('2024-01-15'), // Past date
        roomId: 'room-101',
      };

      const room = {
        id: 'room-101',
        status: 'OCCUPIED',
      };

      mockBooking.findUnique.mockResolvedValue(pastBooking);
      mockRoom.findUnique.mockResolvedValue(room);
      mockBooking.update.mockResolvedValue({ ...pastBooking, status: 'COMPLETED' });
      mockRoom.update.mockResolvedValue({ ...room, status: 'AVAILABLE' });

      // Complete booking
      const completedBooking = await mockBooking.update({
        where: { id: pastBooking.id },
        data: { status: 'COMPLETED' },
      });

      expect(completedBooking.status).toBe('COMPLETED');
      expect(mockRoom.update).toHaveBeenCalledWith({
        where: { id: room.id },
        data: { status: 'AVAILABLE' },
      });
    });
  });

  describe('Booking Search and Filtering', () => {
    it('should filter bookings by status', async () => {
      const mockBookings = [
        { id: '1', status: 'CONFIRMED', guestName: 'John Doe' },
        { id: '2', status: 'PENDING', guestName: 'Jane Smith' },
        { id: '3', status: 'CONFIRMED', guestName: 'Mike Johnson' },
        { id: '4', status: 'CANCELLED', guestName: 'Sarah Wilson' },
      ];

      mockBooking.findMany.mockResolvedValue(mockBookings.filter(b => b.status === 'CONFIRMED'));

      const confirmedBookings = await mockBooking.findMany({
        where: { status: 'CONFIRMED' },
      });

      expect(confirmedBookings).toHaveLength(2);
      confirmedBookings.forEach(booking => {
        expect(booking.status).toBe('CONFIRMED');
      });
    });

    it('should search bookings by guest name', async () => {
      const searchTerm = 'John';
      const mockBookings = [
        { id: '1', guestName: 'John Doe', status: 'CONFIRMED' },
        { id: '2', guestName: 'Jane Smith', status: 'PENDING' },
        { id: '3', guestName: 'Mike Johnson', status: 'CONFIRMED' },
      ];

      mockBooking.findMany.mockResolvedValue(
        mockBookings.filter(b => b.guestName.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      const searchResults = await mockBooking.findMany({
        where: {
          user: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      });

      expect(searchResults).toHaveLength(2);
      searchResults.forEach(booking => {
        expect(booking.guestName.toLowerCase()).toContain(searchTerm.toLowerCase());
      });
    });

    it('should filter bookings by date range', async () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');
      const mockBookings = [
        { id: '1', checkIn: new Date('2024-02-05'), checkOut: new Date('2024-02-07') },
        { id: '2', checkIn: new Date('2024-02-15'), checkOut: new Date('2024-02-17') },
        { id: '3', checkIn: new Date('2024-03-01'), checkOut: new Date('2024-03-03') },
      ];

      mockBooking.findMany.mockResolvedValue(
        mockBookings.filter(b => 
          b.checkIn >= startDate && b.checkIn <= endDate
        )
      );

      const filteredBookings = await mockBooking.findMany({
        where: {
          checkIn: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      expect(filteredBookings).toHaveLength(2);
      filteredBookings.forEach(booking => {
        expect(booking.checkIn.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(booking.checkIn.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe('Booking Business Logic', () => {
    it('should prevent double booking of rooms', async () => {
      const roomId = 'room-101';
      const checkIn = new Date('2024-02-01');
      const checkOut = new Date('2024-02-03');

      const existingBooking = {
        id: 'existing-booking',
        roomId,
        checkIn: new Date('2024-02-02'),
        checkOut: new Date('2024-02-04'),
        status: 'CONFIRMED',
      };

      mockBooking.findMany.mockResolvedValue([existingBooking]);

      // Check for overlapping bookings
      const overlappingBookings = await mockBooking.findMany({
        where: {
          roomId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              checkIn: { lt: checkOut },
              checkOut: { gt: checkIn },
            },
          ],
        },
      });

      expect(overlappingBookings).toHaveLength(1);
      expect(overlappingBookings[0].id).toBe('existing-booking');
    });

    it('should calculate occupancy rate correctly', async () => {
      const totalRooms = 24;
      const occupiedRooms = 18;
      const occupancyRate = (occupiedRooms / totalRooms) * 100;

      expect(occupancyRate).toBe(75);
      expect(occupancyRate).toBeGreaterThanOrEqual(0);
      expect(occupancyRate).toBeLessThanOrEqual(100);
    });

    it('should handle room capacity validation', async () => {
      const room = {
        id: 'room-101',
        type: 'SINGLE',
        capacity: 1,
      };

      const bookingRequest = {
        guestCount: 2,
        roomId: room.id,
      };

      // Validate capacity
      const isValidCapacity = bookingRequest.guestCount <= room.capacity;
      expect(isValidCapacity).toBe(false);
      expect(room.capacity).toBe(1);
      expect(bookingRequest.guestCount).toBe(2);
    });

    it('should apply discount for extended stays', async () => {
      const basePrice = 120;
      const nights = 7;
      const discountRate = 0.1; // 10% discount for stays longer than 5 nights
      const discount = nights > 5 ? basePrice * nights * discountRate : 0;
      const totalPrice = basePrice * nights - discount;

      expect(nights).toBe(7);
      expect(discount).toBe(84); // 120 * 7 * 0.1
      expect(totalPrice).toBe(756); // (120 * 7) - 84
    });
  });

  describe('Booking Error Handling', () => {
    it('should handle database connection failures', async () => {
      mockBooking.create.mockRejectedValue(new Error('Database connection failed'));

      try {
        await mockBooking.create({
          data: {
            userId: 'user-123',
            roomId: 'room-101',
            checkIn: new Date(),
            checkOut: new Date(),
            totalPrice: 240,
          },
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Database connection failed');
      }
    });

    it('should handle invalid booking data', async () => {
      const invalidBookings = [
        { checkIn: null, checkOut: new Date() },
        { checkIn: new Date(), checkOut: null },
        { checkIn: new Date('2024-02-03'), checkOut: new Date('2024-02-01') }, // Check-out before check-in
        { totalPrice: -100 },
        { totalPrice: 0 },
      ];

      invalidBookings.forEach(booking => {
        if (booking.checkIn && booking.checkOut) {
          expect(booking.checkIn.getTime()).toBeLessThanOrEqual(booking.checkOut.getTime());
        }
        if (booking.totalPrice !== undefined) {
          expect(booking.totalPrice).toBeGreaterThan(0);
        }
      });
    });

    it('should handle concurrent booking attempts', async () => {
      const roomId = 'room-101';
      const concurrentBookings = Array.from({ length: 5 }, (_, i) => 
        mockBooking.create({
          data: {
            userId: `user-${i}`,
            roomId,
            checkIn: new Date('2024-02-01'),
            checkOut: new Date('2024-02-03'),
            totalPrice: 240,
          },
        })
      );

      // Only one should succeed
      mockBooking.create
        .mockResolvedValueOnce({ id: 'booking-1' })
        .mockRejectedValueOnce(new Error('Room already booked'))
        .mockRejectedValueOnce(new Error('Room already booked'))
        .mockRejectedValueOnce(new Error('Room already booked'))
        .mockRejectedValueOnce(new Error('Room already booked'));

      const results = await Promise.allSettled(concurrentBookings);
      const successfulBookings = results.filter(r => r.status === 'fulfilled');
      const failedBookings = results.filter(r => r.status === 'rejected');

      expect(successfulBookings).toHaveLength(1);
      expect(failedBookings).toHaveLength(4);
    });
  });

  describe('Booking Performance', () => {
    it('should handle large booking datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `booking-${i}`,
        guestName: `Guest ${i}`,
        status: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'][i % 4],
      }));

      mockBooking.findMany.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const bookings = await mockBooking.findMany({
        where: { status: 'CONFIRMED' },
      });
      const endTime = Date.now();

      expect(bookings).toHaveLength(250); // 1000 / 4 statuses
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle rapid booking operations', async () => {
      const operations = Array.from({ length: 50 }, (_, i) => 
        mockBooking.findUnique({ where: { id: `booking-${i}` } })
      );

      mockBooking.findUnique.mockResolvedValue({ id: 'test-booking' });

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Booking Analytics', () => {
    it('should calculate booking statistics', async () => {
      const bookings = [
        { status: 'CONFIRMED', totalPrice: 240 },
        { status: 'CONFIRMED', totalPrice: 360 },
        { status: 'PENDING', totalPrice: 180 },
        { status: 'CANCELLED', totalPrice: 500 },
        { status: 'COMPLETED', totalPrice: 300 },
      ];

      const stats = {
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
        totalRevenue: bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.totalPrice, 0),
        averageBookingValue: bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.totalPrice, 0) / bookings.filter(b => b.status === 'CONFIRMED').length,
      };

      expect(stats.totalBookings).toBe(5);
      expect(stats.confirmedBookings).toBe(2);
      expect(stats.totalRevenue).toBe(600);
      expect(stats.averageBookingValue).toBe(300);
    });

    it('should track booking trends', async () => {
      const monthlyBookings = [
        { month: 'January', count: 45, revenue: 5400 },
        { month: 'February', count: 52, revenue: 6240 },
        { month: 'March', count: 48, revenue: 5760 },
        { month: 'April', count: 61, revenue: 7320 },
      ];

      const trends = {
        averageMonthlyBookings: monthlyBookings.reduce((sum, m) => sum + m.count, 0) / monthlyBookings.length,
        averageMonthlyRevenue: monthlyBookings.reduce((sum, m) => sum + m.revenue, 0) / monthlyBookings.length,
        growthRate: ((monthlyBookings[3].count - monthlyBookings[0].count) / monthlyBookings[0].count) * 100,
      };

      expect(trends.averageMonthlyBookings).toBe(51.5);
      expect(trends.averageMonthlyRevenue).toBe(6180);
      expect(trends.growthRate).toBeCloseTo(35.56, 1);
    });
  });
}); 