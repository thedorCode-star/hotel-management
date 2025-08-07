import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../page';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock fetch
global.fetch = jest.fn();

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'ADMIN',
};

const mockStats = {
  rooms: {
    total: 24,
    available: 12,
    occupied: 8,
    maintenance: 4,
    occupancyRate: '33.3',
  },
  bookings: {
    total: 150,
    confirmed: 120,
    pending: 15,
    cancelled: 15,
    today: 8,
    weekly: 45,
    monthly: 180,
  },
  revenue: {
    today: 2450,
    weekly: 12500,
    monthly: 52000,
    average: 350,
  },
  guests: {
    uniqueThisMonth: 85,
    averageStayDuration: 2.5,
  },
  roomTypes: {
    'SINGLE': 8,
    'DOUBLE': 12,
    'SUITE': 4,
  },
  recentBookings: [],
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<DashboardPage />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard with user data', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stats: mockStats }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Hotel Dashboard')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });
  });

  it('displays dynamic statistics', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stats: mockStats }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('24')).toBeInTheDocument(); // Total Rooms
    });
    
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument(); // Active Bookings
    });
    
    await waitFor(() => {
      expect(screen.getByText('$2,450.00')).toBeInTheDocument(); // Revenue Today
    });
  });

  it('handles refresh button click', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stats: mockStats }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    // Should trigger another fetch call for stats
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial auth + stats (refresh is the same as initial stats call)
    });
  });

  it('displays error message on fetch failure', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  it('shows navigation links', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stats: mockStats }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Bookings')).toBeInTheDocument();
      expect(screen.getByText('Room Management')).toBeInTheDocument();
      expect(screen.getByText('Guest Management')).toBeInTheDocument();
      expect(screen.getByText('Reviews & Ratings')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('formats currency correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stats: mockStats }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$2,450.00')).toBeInTheDocument();
    });
  });

  it('shows occupancy rate', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stats: mockStats }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('33.3%')).toBeInTheDocument();
    });
  });
}); 