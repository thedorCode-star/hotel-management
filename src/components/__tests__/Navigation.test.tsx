import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    // Mock the auth check to return no user
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<Navigation />);
    
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

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    localStorageMock.getItem.mockReturnValue('mock-token');

    render(<Navigation />);
    
    await screen.findByText('John Doe');
    
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    localStorageMock.getItem.mockReturnValue('mock-token');

    render(<Navigation />);
    
    // Wait for the user to be loaded
    await screen.findByText('John Doe');
    
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

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    localStorageMock.getItem.mockReturnValue('mock-token');

    render(<Navigation />);
    
    // Wait for the admin user to be loaded
    await screen.findByText('Admin User');
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders navigation with user', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    localStorageMock.getItem.mockReturnValue('mock-token');

    render(<Navigation />);
    
    // Wait for the component to load
    await screen.findByText('John Doe');
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  // Snapshot tests
  it('matches snapshot for unauthenticated user', () => {
    const { container } = render(<Navigation />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for authenticated user', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    localStorageMock.getItem.mockReturnValue('mock-token');

    const { container } = render(<Navigation />);
    
    await screen.findByText('John Doe');
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for admin user', async () => {
    const mockUser = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    localStorageMock.getItem.mockReturnValue('mock-token');

    const { container } = render(<Navigation />);
    
    // Wait for the admin user to be loaded
    await screen.findByText('Admin User');
    
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for loading state', () => {
    localStorageMock.getItem.mockReturnValue('mock-token');
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { container } = render(<Navigation />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for mobile menu open', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    localStorageMock.getItem.mockReturnValue('mock-token');

    const { container } = render(<Navigation />);
    
    // Wait for the user to be loaded
    await screen.findByText('John Doe');
    
    const mobileMenuButton = screen.getByRole('button', { name: '' });
    fireEvent.click(mobileMenuButton);
    
    expect(container).toMatchSnapshot();
  });
}); 