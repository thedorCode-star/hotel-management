import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders navigation without user', async () => {
    // Mock both API calls - auth check returns no user, refunds check won't be called
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

    await act(async () => {
      render(<Navigation />);
    });
    
    // Wait for the auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Hotel Management')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  it('handles logout', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    // Mock all possible fetch calls with more responses to handle any additional calls
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({  // First call: /api/auth/me
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({  // Second call: /api/refunds
        ok: true,
        json: async () => ({ refunds: [] }),
      })
      .mockResolvedValueOnce({  // Third call: /api/auth/logout
        ok: true,
        json: async () => ({ success: true }),
      })
      // Add more mock responses to handle any additional fetch calls
      .mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    await act(async () => {
      render(<Navigation />);
    });
    
    // Wait for both API calls to complete and user to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);
    
    // Use getAllByText and select the first one (desktop menu)
    const signOutButtons = screen.getAllByText('Sign Out');
    const signOutButton = signOutButtons[0];
    fireEvent.click(signOutButton);
    
    // The logout function should be called, but we need to wait for it
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  it('toggles mobile menu', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ refunds: [] }),
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    await act(async () => {
      render(<Navigation />);
    });
    
    // Wait for both API calls to complete and user to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find the mobile menu button (hamburger menu)
    const mobileMenuButton = screen.getByRole('button', { name: '' });
    fireEvent.click(mobileMenuButton);
    
    // Use getAllByText to handle multiple elements
    const myProfileElements = screen.getAllByText('My Profile');
    const myBookingsElements = screen.getAllByText('My Bookings');
    
    expect(myProfileElements.length).toBeGreaterThan(0);
    expect(myBookingsElements.length).toBeGreaterThan(0);
  });

  it('renders admin navigation for admin user', async () => {
    const mockUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ refunds: [] }),
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    await act(async () => {
      render(<Navigation />);
    });
    
    // Wait for both API calls to complete and admin user to be loaded
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders navigation with user', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ refunds: [] }),
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    await act(async () => {
      render(<Navigation />);
    });
    
    // Wait for both API calls to complete and user to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  // Snapshot tests
  it('matches snapshot for unauthenticated user', async () => {
    // Mock fetch to return error response with json method
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    let container: any;
    await act(async () => {
      const result = render(<Navigation />);
      container = result.container;
    });
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Hotel Management')).toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for authenticated user', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ refunds: [] }),
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    let container: any;
    await act(async () => {
      const result = render(<Navigation />);
      container = result.container;
    });
    
    // Wait for both API calls to complete and user to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for admin user', async () => {
    const mockUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ refunds: [] }),
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    let container: any;
    await act(async () => {
      const result = render(<Navigation />);
      container = result.container;
    });
    
    // Wait for both API calls to complete and admin user to be loaded
    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for loading state', async () => {
    localStorageMock.getItem.mockReturnValue('mock-token');
    // Mock fetch to return a promise that resolves after a delay to simulate loading
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' }),
          });
        }, 1000); // 1 second delay
      })
    );

    let container: any;
    await act(async () => {
      const result = render(<Navigation />);
      container = result.container;
    });
    
    // The component should be in loading state initially
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for mobile menu open', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ refunds: [] }),
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    let container: any;
    await act(async () => {
      const result = render(<Navigation />);
      container = result.container;
    });
    
    // Wait for both API calls to complete and user to be loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const mobileMenuButton = screen.getByRole('button', { name: '' });
    fireEvent.click(mobileMenuButton);
    
    expect(container).toMatchSnapshot();
  });
}); 