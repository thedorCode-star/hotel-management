import nodemailer from 'nodemailer';

// Check if email is properly configured
export const isEmailConfigured = () => {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

// Email configuration
export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// Create transporter only if credentials are available
export const transporter = isEmailConfigured() 
  ? nodemailer.createTransport(emailConfig)
  : null;

// Verify email configuration
export const verifyEmailConfig = async () => {
  if (!transporter) {
    console.warn('⚠️ Email not configured. Set SMTP_USER and SMTP_PASS in .env.local');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration verification failed:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  paymentConfirmation: (data: {
    customerName: string;
    bookingId: string;
    amount: number;
    roomNumber: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    transactionId: string;
    paymentMethod: string;
  }) => ({
    subject: `Payment Confirmation - Booking #${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Payment Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your payment</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Booking Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Guest Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Booking ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">#${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Room:</td>
                <td style="padding: 8px 0; font-weight: bold;">Room ${data.roomNumber} (${data.roomType})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Check-in:</td>
                <td style="padding: 8px 0; font-weight: bold;">${new Date(data.checkIn).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Check-out:</td>
                <td style="padding: 8px 0; font-weight: bold;">${new Date(data.checkOut).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Payment Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #28a745;">$${data.amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.transactionId}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; margin-bottom: 20px;">Your booking has been confirmed and payment has been processed successfully.</p>
            <p style="color: #666;">If you have any questions, please contact our support team.</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Hotel Management System. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  refundConfirmation: (data: {
    customerName: string;
    bookingId: string;
    originalAmount: number;
    refundAmount: number;
    refundReason: string;
    transactionId: string;
    refundTransactionId: string;
  }) => ({
    subject: `Refund Processed - Booking #${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Refund Processed</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your refund has been processed</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Refund Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Guest Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Booking ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">#${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Original Amount:</td>
                <td style="padding: 8px 0; font-weight: bold;">$${data.originalAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Refund Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #28a745;">$${data.refundAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Reason:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.refundReason}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Transaction Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Original Transaction:</td>
                <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Refund Transaction:</td>
                <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.refundTransactionId}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; margin-bottom: 20px;">Your refund has been processed and will appear in your account within 3-5 business days.</p>
            <p style="color: #666;">If you have any questions, please contact our support team.</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Hotel Management System. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  bookingReminder: (data: {
    customerName: string;
    bookingId: string;
    roomNumber: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
  }) => ({
    subject: `Upcoming Stay Reminder - Booking #${data.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Upcoming Stay</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">We're excited to welcome you!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Booking Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Guest Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Booking ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">#${data.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Room:</td>
                <td style="padding: 8px 0; font-weight: bold;">Room ${data.roomNumber} (${data.roomType})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Check-in:</td>
                <td style="padding: 8px 0; font-weight: bold;">${new Date(data.checkIn).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Check-out:</td>
                <td style="padding: 8px 0; font-weight: bold;">${new Date(data.checkOut).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Amount:</td>
                <td style="padding: 8px 0; font-weight: bold;">$${data.totalPrice.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; margin-bottom: 20px;">We're looking forward to your stay! Please arrive at our hotel on your check-in date.</p>
            <p style="color: #666;">If you need to make any changes to your booking, please contact us as soon as possible.</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Hotel Management System. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  custom: (data: { subject: string; html: string }) => ({
    subject: data.subject,
    html: data.html,
  }),
};

// Email sending functions
export const sendEmail = async (to: string, template: keyof typeof emailTemplates, data: any) => {
  if (!transporter) {
    console.error('Email transporter not configured. Cannot send email.');
    return { success: false, error: 'Email transporter not configured' };
  }

  try {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@hotelmanagement.com',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Specific email functions
export const sendPaymentConfirmation = async (email: string, paymentData: any) => {
  return await sendEmail(email, 'paymentConfirmation', paymentData);
};

export const sendRefundConfirmation = async (email: string, refundData: any) => {
  return await sendEmail(email, 'refundConfirmation', refundData);
};

export const sendBookingReminder = async (email: string, bookingData: any) => {
  return await sendEmail(email, 'bookingReminder', bookingData);
}; 