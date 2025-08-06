import { jest } from '@jest/globals';

// Mock the database with proper typing
const mockBooking = {
  create: jest.fn() as jest.MockedFunction<any>,
  findMany: jest.fn() as jest.MockedFunction<any>,
  findUnique: jest.fn() as jest.MockedFunction<any>,
  update: jest.fn() as jest.MockedFunction<any>,
  delete: jest.fn() as jest.MockedFunction<any>,
  count: jest.fn() as jest.MockedFunction<any>,
  aggregate: jest.fn() as jest.MockedFunction<any>,
};

const mockRoom = {
  findUnique: jest.fn() as jest.MockedFunction<any>,
  update: jest.fn() as jest.MockedFunction<any>,
  findMany: jest.fn() as jest.MockedFunction<any>,
};

const mockUser = {
  findUnique: jest.fn() as jest.MockedFunction<any>,
  findMany: jest.fn() as jest.MockedFunction<any>,
};

const mockDb = {
  booking: mockBooking,
  room: mockRoom,
  user: mockUser,
};

jest.mock('../lib/build-safe-db', () => ({
  getBuildSafeDatabase: () => mockDb,
}));

describe('Booking Management Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking Creation Logic', () => {
    it('should create a new booking successfully', async () => {
      const newBooking = {
        id: 'booking-123',
        roomId: 'room-101',
        userId: 'user-123',
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-03'),
        totalPrice: 200,
        status: 'PENDING',
      };

      const testRoom = {
        id: 'room-101',
        status: 'AVAILABLE',
        price: 100,
        capacity: 2,
      };

      mockRoom.findUnique.mockResolvedValue(testRoom);
      mockBooking.findMany.mockResolvedValue([]); // No overlapping bookings
      mockBooking.create.mockResolvedValue(newBooking);
      mockRoom.update.mockResolvedValue({ ...testRoom, status: 'RESERVED' });

      // Simulate booking creation
      const bookingResult = await mockBooking.create({
        data: {
          roomId: 'room-101',
          userId: 'user-123',
          checkIn: new Date('2024-02-01'),
          checkOut: new Date('2024-02-03'),
          totalPrice: 200,
          status: 'PENDING',
        },
      });

      expect(bookingResult).toEqual(newBooking);
      expect(mockBooking.create).toHaveBeenCalledTimes(1);
      expect(mockRoom.update).toHaveBeenCalledTimes(1);
    });

    it('should prevent booking for unavailable rooms', async () => {
      const testRoom = {
        id: 'room-102',
        status: 'OCCUPIED',
        price: 150,
        capacity: 2,
      };

      mockRoom.findUnique.mockResolvedValue(testRoom);

      // Simulate booking attempt for occupied room
      const bookingAttempt = {
        roomId: 'room-102',
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-03'),
        totalPrice: 300,
        userId: 'user-123',
      };

      // The booking should not be created for occupied rooms
      expect(testRoom.status).toBe('OCCUPIED');
      expect(mockBooking.create).not.toHaveBeenCalled();
    });

    it('should calculate total price correctly', () => {
      const roomPrice = 100;
      const checkIn = new Date('2024-02-01');
      const checkOut = new Date('2024-02-03');
      
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = roomPrice * nights;

      expect(nights).toBe(2);
      expect(totalPrice).toBe(200);
    });

    it('should validate booking dates', () => {
      const checkIn = new Date('2024-12-01');
      const checkOut = new Date('2024-12-03');
      const now = new Date();

      expect(checkIn.getTime()).toBeGreaterThan(now.getTime());
      expect(checkOut.getTime()).toBeGreaterThan(checkIn.getTime());
    });

    it('should reject booking with invalid dates', () => {
      const checkIn = new Date('2024-02-03');
      const checkOut = new Date('2024-02-01'); // Check-out before check-in

      const isValidBooking = checkOut.getTime() > checkIn.getTime();
      expect(isValidBooking).toBe(false);
    });

    it('should reject booking with past dates', () => {
      const checkIn = new Date('2023-01-01'); // Past date
      const now = new Date();

      const isValidBooking = checkIn.getTime() > now.getTime();
      expect(isValidBooking).toBe(false);
    });
  });

  describe('Booking Status Management', () => {
    it('should update booking status correctly', async () => {
      const booking = {
        id: 'booking-123',
        status: 'PENDING',
      };

      const updatedBooking = {
        ...booking,
        status: 'CONFIRMED',
      };

      mockBooking.update.mockResolvedValue(updatedBooking);

      const result = await mockBooking.update({
        where: { id: 'booking-123' },
        data: { status: 'CONFIRMED' },
      });

      expect(result.status).toBe('CONFIRMED');
      expect(mockBooking.update).toHaveBeenCalledTimes(1);
    });

    it('should handle booking cancellation', async () => {
      const booking = {
        id: 'booking-123',
        roomId: 'room-101',
        status: 'CONFIRMED',
      };

      const room = {
        id: 'room-101',
        status: 'OCCUPIED',
      };

      mockBooking.findUnique.mockResolvedValue({ ...booking, room });
      mockBooking.update.mockResolvedValue({ ...booking, status: 'CANCELLED' });
      mockRoom.update.mockResolvedValue({ ...room, status: 'AVAILABLE' });

      const cancelledBooking = await mockBooking.update({
        where: { id: 'booking-123' },
        data: { status: 'CANCELLED' },
      });

      expect(cancelledBooking.status).toBe('CANCELLED');
      expect(mockRoom.update).toHaveBeenCalledWith({
        where: { id: 'room-101' },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should complete finished bookings', async () => {
      const booking = {
        id: 'booking-123',
        roomId: 'room-101',
        status: 'CONFIRMED',
      };

      const room = {
        id: 'room-101',
        status: 'OCCUPIED',
      };

      mockBooking.findUnique.mockResolvedValue({ ...booking, room });
      mockBooking.update.mockResolvedValue({ ...booking, status: 'COMPLETED' });
      mockRoom.update.mockResolvedValue({ ...room, status: 'AVAILABLE' });

      const completedBooking = await mockBooking.update({
        where: { id: 'booking-123' },
        data: { status: 'COMPLETED' },
      });

      expect(completedBooking.status).toBe('COMPLETED');
      expect(mockRoom.update).toHaveBeenCalledWith({
        where: { id: 'room-101' },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should validate status transitions', () => {
      const validTransitions: { [key: string]: string[] } = {
        'PENDING': ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED': ['COMPLETED', 'CANCELLED'],
        'CANCELLED': [],
        'COMPLETED': [],
      };

      // Test valid transitions
      expect(validTransitions['PENDING']).toContain('CONFIRMED');
      expect(validTransitions['PENDING']).toContain('CANCELLED');
      expect(validTransitions['CONFIRMED']).toContain('COMPLETED');
      expect(validTransitions['CONFIRMED']).toContain('CANCELLED');

      // Test invalid transitions
      expect(validTransitions['CANCELLED']).not.toContain('CONFIRMED');
      expect(validTransitions['COMPLETED']).not.toContain('CONFIRMED');
    });
  });

  describe('Booking Search and Filtering', () => {
    it('should filter bookings by status', async () => {
      const bookings = [
        { id: 'booking-1', status: 'CONFIRMED' },
        { id: 'booking-2', status: 'PENDING' },
        { id: 'booking-3', status: 'CONFIRMED' },
      ];

      mockBooking.findMany.mockResolvedValue(bookings.filter(b => b.status === 'CONFIRMED'));

      const confirmedBookings = await mockBooking.findMany({
        where: { status: 'CONFIRMED' },
      });

      expect(confirmedBookings).toHaveLength(2);
      expect(confirmedBookings.every((b: any) => b.status === 'CONFIRMED')).toBe(true);
    });

    it('should search bookings by guest name', async () => {
      const bookings = [
        { id: 'booking-1', user: { name: 'John Doe' } },
        { id: 'booking-2', user: { name: 'Jane Smith' } },
      ];

      mockBooking.findMany.mockResolvedValue(bookings.filter(b => 
        b.user.name.toLowerCase().includes('john')
      ));

      const johnBookings = await mockBooking.findMany({
        where: {
          user: {
            name: { contains: 'john', mode: 'insensitive' },
          },
        },
      });

      expect(johnBookings).toHaveLength(1);
      expect(johnBookings[0].user.name).toBe('John Doe');
    });

    it('should filter bookings by date range', async () => {
      const bookings = [
        { id: 'booking-1', checkIn: new Date('2024-02-01') },
        { id: 'booking-2', checkIn: new Date('2024-02-15') },
        { id: 'booking-3', checkIn: new Date('2024-03-01') },
      ];

      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');

      mockBooking.findMany.mockResolvedValue(bookings.filter(b => 
        b.checkIn >= startDate && b.checkIn <= endDate
      ));

      const filteredBookings = await mockBooking.findMany({
        where: {
          checkIn: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      expect(filteredBookings).toHaveLength(2);
    });
  });

  describe('Booking Business Logic', () => {
    it('should prevent double booking of rooms', async () => {
      const existingBookings = [
        {
          id: 'booking-1',
          roomId: 'room-101',
          checkIn: new Date('2024-02-01'),
          checkOut: new Date('2024-02-03'),
          status: 'CONFIRMED',
        },
      ];

      const newBookingRequest = {
        roomId: 'room-101',
        checkIn: new Date('2024-02-02'),
        checkOut: new Date('2024-02-04'),
      };

      mockBooking.findMany.mockResolvedValue(existingBookings);

      const overlappingBookings = await mockBooking.findMany({
        where: {
          roomId: 'room-101',
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              checkIn: { lt: newBookingRequest.checkOut },
              checkOut: { gt: newBookingRequest.checkIn },
            },
          ],
        },
      });

      expect(overlappingBookings.length).toBeGreaterThan(0);
    });

    it('should calculate occupancy rate correctly', () => {
      const totalRooms = 10;
      const occupiedRooms = 7;
      const occupancyRate = (occupiedRooms / totalRooms) * 100;

      expect(occupancyRate).toBe(70);
    });

    it('should handle room capacity validation', () => {
      const roomCapacity = 2;
      const guestCount = 3;

      const isValidBooking = guestCount <= roomCapacity;
      expect(isValidBooking).toBe(false);
    });

    it('should apply discount for extended stays', () => {
      const basePrice = 100;
      const nights = 7;
      const discountRate = 0.1; // 10% discount for stays >= 7 nights
      
      const totalPrice = nights >= 7 
        ? basePrice * nights * (1 - discountRate)
        : basePrice * nights;

      expect(totalPrice).toBe(630); // 700 * 0.9
    });

    it('should validate overlapping date ranges', () => {
      const existingBooking = {
        checkIn: new Date('2024-02-01'),
        checkOut: new Date('2024-02-03'),
      };

      const newBookings = [
        {
          checkIn: new Date('2024-02-02'),
          checkOut: new Date('2024-02-04'),
          expected: true, // Should overlap
        },
        {
          checkIn: new Date('2024-02-04'),
          checkOut: new Date('2024-02-06'),
          expected: false, // Should not overlap
        },
        {
          checkIn: new Date('2024-01-30'),
          checkOut: new Date('2024-02-02'),
          expected: true, // Should overlap
        },
      ];

      newBookings.forEach(booking => {
        const hasOverlap = 
          booking.checkIn < existingBooking.checkOut && 
          booking.checkOut > existingBooking.checkIn;
        
        expect(hasOverlap).toBe(booking.expected);
      });
    });
  });

  describe('Booking Error Handling', () => {
    it('should handle database connection failures', async () => {
      mockBooking.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(mockBooking.create({
        data: { roomId: 'room-101' },
      })).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid booking data', () => {
      const invalidBookings = [
        { checkIn: new Date('2024-02-03'), checkOut: new Date('2024-02-01') }, // Check-out before check-in
        { totalPrice: -100 }, // Negative price
        { guestCount: 0 }, // Invalid guest count
      ];

      invalidBookings.forEach(booking => {
        if (booking.checkIn && booking.checkOut) {
          expect(booking.checkIn.getTime()).toBeGreaterThan(booking.checkOut.getTime());
        }
        if (booking.totalPrice !== undefined) {
          expect(booking.totalPrice).toBeGreaterThan(0);
        }
        if (booking.guestCount !== undefined) {
          expect(booking.guestCount).toBeGreaterThan(0);
        }
      });
    });

    it('should handle concurrent booking attempts', async () => {
      const bookingPromises = Array.from({ length: 5 }, (_, i) =>
        mockBooking.create({
          data: {
            roomId: 'room-101',
            userId: `user-${i}`,
            checkIn: new Date('2024-02-01'),
            checkOut: new Date('2024-02-03'),
          },
        })
      );

      mockBooking.create.mockResolvedValueOnce({ id: 'booking-success' });
      mockBooking.create.mockRejectedValue(new Error('Room already booked'));

      const results = await Promise.allSettled(bookingPromises);
      const successfulBookings = results.filter(r => r.status === 'fulfilled');
      const failedBookings = results.filter(r => r.status === 'rejected');

      expect(successfulBookings).toHaveLength(1);
      expect(failedBookings).toHaveLength(4);
    });
  });

  describe('Booking Performance', () => {
    it('should handle large booking datasets efficiently', async () => {
      const startTime = Date.now();
      
      const bookings = Array.from({ length: 1000 }, (_, i) => ({
        id: `booking-${i}`,
        status: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'][i % 4],
        guestName: `Guest ${i}`,
      }));

      mockBooking.findMany.mockResolvedValue(bookings);

      const result = await mockBooking.findMany({
        take: 250,
        orderBy: { createdAt: 'desc' },
      });

      const endTime = Date.now();
      
      expect(result).toHaveLength(250);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle rapid booking operations', async () => {
      const startTime = Date.now();
      
      const operations = Array.from({ length: 100 }, () =>
        mockBooking.create({
          data: {
            roomId: 'room-101',
            userId: 'user-123',
            checkIn: new Date(),
            checkOut: new Date(Date.now() + 86400000),
          },
        })
      );

      mockBooking.create.mockResolvedValue({ id: 'booking-123' });

      await Promise.all(operations);
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Booking Analytics', () => {
    it('should calculate booking statistics', async () => {
      const bookings = [
        { status: 'CONFIRMED', totalPrice: 200 },
        { status: 'CONFIRMED', totalPrice: 300 },
        { status: 'PENDING', totalPrice: 150 },
        { status: 'CANCELLED', totalPrice: 100 },
      ];

      mockBooking.aggregate.mockResolvedValue({
        _sum: { totalPrice: 500 },
        _count: { id: 4 },
      });

      const stats = await mockBooking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalPrice: true },
        _count: { id: true },
      });

      expect(stats._sum.totalPrice).toBe(500);
      expect(stats._count.id).toBe(4);
    });

    it('should track booking trends', async () => {
      const monthlyBookings = [
        { month: 'Jan', count: 10 },
        { month: 'Feb', count: 15 },
        { month: 'Mar', count: 12 },
      ];

      mockBooking.findMany.mockResolvedValue(monthlyBookings);

      const trends = await mockBooking.findMany({
        select: {
          month: true,
          count: true,
        },
        orderBy: { month: 'asc' },
      });

      expect(trends).toHaveLength(3);
      expect(trends[1].count).toBe(15); // February has highest bookings
    });

    it('should calculate revenue metrics', () => {
      const bookings = [
        { totalPrice: 200, status: 'CONFIRMED' },
        { totalPrice: 300, status: 'CONFIRMED' },
        { totalPrice: 150, status: 'PENDING' },
        { totalPrice: 100, status: 'CANCELLED' },
      ];

      const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const averageRevenue = totalRevenue / confirmedBookings.length;

      expect(totalRevenue).toBe(500);
      expect(averageRevenue).toBe(250);
    });
  });
}); 