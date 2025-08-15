import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 PAYMENT TEST ENDPOINT CALLED');
    
    // Simulate a delay to test timeout handling
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return NextResponse.json({
      success: true,
      message: 'Payment test endpoint is working',
      timestamp: new Date().toISOString(),
      testData: {
        status: 'success',
        processingTime: '2s',
        endpoint: '/api/test-payment'
      }
    });
  } catch (error) {
    console.error('Payment test error:', error);
    return NextResponse.json(
      { error: 'Payment test failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 PAYMENT TEST POST ENDPOINT CALLED');
    
    const body = await request.json();
    console.log('📋 Test request body:', body);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      success: true,
      message: 'Payment test POST endpoint is working',
      timestamp: new Date().toISOString(),
      receivedData: body,
      testResponse: {
        status: 'success',
        processingTime: '1s',
        method: 'POST'
      }
    });
  } catch (error) {
    console.error('Payment test POST error:', error);
    return NextResponse.json(
      { error: 'Payment test POST failed' },
      { status: 500 }
    );
  }
}
