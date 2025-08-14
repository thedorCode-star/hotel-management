import { NextRequest, NextResponse } from 'next/server';

// Mock system settings - in a real app, this would be stored in a database
let systemSettings = {
  hotel: {
    name: 'Luxury Hotel & Resort',
    address: '123 Main Street, City, Country',
    phone: '+1-555-0123',
    email: 'info@luxuryhotel.com',
    website: 'https://luxuryhotel.com',
    timezone: 'UTC-5',
    currency: 'USD',
  },
  booking: {
    checkInTime: '15:00',
    checkOutTime: '11:00',
    maxAdvanceBooking: 365, // days
    minAdvanceBooking: 1, // days
    allowSameDayBooking: true,
    requireDeposit: true,
    depositPercentage: 20,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmations: true,
    paymentReminders: true,
    checkInReminders: true,
    checkOutReminders: true,
  },
  security: {
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    requireTwoFactor: false,
    passwordMinLength: 8,
    passwordComplexity: 'medium',
  },
  maintenance: {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    scheduledMaintenance: false,
    maintenanceStartTime: null,
    maintenanceEndTime: null,
  },
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(systemSettings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch system settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Update settings (in a real app, you'd validate permissions here)
    systemSettings = {
      ...systemSettings,
      ...body,
    };

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: systemSettings,
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { message: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
