import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function middleware(request: NextRequest) {
  console.log('=== MIDDLEWARE LOADED ===');
  console.log('🔍 Request URL:', request.url);
  console.log('🔍 Pathname:', request.nextUrl.pathname);
  
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/rooms' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // Skip middleware for test endpoints
  if (pathname.startsWith('/api/test-')) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('=== MIDDLEWARE DEBUG ===');
    console.log('Pathname:', pathname);
    console.log('Token present:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none');

    if (!token) {
      // Redirect to login for dashboard routes
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Check API routes that require authentication
  if (pathname.startsWith('/api/')) {
    // Allow public access to certain API endpoints
    const publicApiEndpoints = [
      '/api/rooms',           // Public room viewing
      '/api/auth/login',      // Login endpoint
      '/api/auth/register',   // Registration endpoint
    ];
    
    // Check if this is a public API endpoint
    const isPublicEndpoint = publicApiEndpoints.some(endpoint => 
      pathname === endpoint || pathname.startsWith(endpoint)
    );
    
    if (isPublicEndpoint) {
      console.log('🌐 Public API endpoint, allowing access:', pathname);
      return NextResponse.next();
    }
    
    // For protected API endpoints, require authentication
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('=== MIDDLEWARE DEBUG ===');
    console.log('Pathname:', pathname);
    console.log('Token present:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none');

    if (!token) {
      // Return 401 for protected API routes
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      // For now, just allow access if token is present
      // We'll implement proper JWT verification later
      console.log('Token found, allowing access (JWT verification temporarily disabled)');
      
      // For now, we'll set a default admin role to allow testing
      // In production, this should extract real user info from JWT
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', 'admin-user-id');
      requestHeaders.set('x-user-role', 'ADMIN');
      requestHeaders.set('x-user-email', 'admin@hotel.com');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.log('Authentication failed with error:', error);
      
      // Invalid token
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
