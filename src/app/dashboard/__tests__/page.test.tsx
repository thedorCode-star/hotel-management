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
    active: 120, // Currently checked-in bookings
    today: 8,
    monthly: 180,
  },
  revenue: {
    actual: {
      today: 2450,
      monthly: 52000,
    },
    net: {
      today: 2450,
      monthly: 52000,
    },
    refunds: {
      today: 0,
      monthly: 0,
    },
  },
  payments: {
    total: 150,
    completed: 120,
    successRate: '80%',
  },
  guests: {
    uniqueThisMonth: 85,
    averageStayDuration: 2.5,
  },
  financialReconciliation: {
    grossRevenue: 52000,
    totalRefunds: 0,
    netRevenue: 52000,
    refundRate: 0,
    paymentCount: 150,
    refundCount: 0,
    reconciliationDate: new Date().toISOString(),
  },
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          revenue: { today: 2450, monthly: 52000, net: 52000 },
          refunds: { total: { amount: 0, count: 0 } },
          payments: { completed: { count: 120 }, pending: { count: 15 }, failed: { count: 0 } }
        }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      // Look for the specific stats in the basic stats cards section
      const statsCards = screen.getAllByText('24');
      expect(statsCards.length).toBeGreaterThan(0);
    });
    
    await waitFor(() => {
      const activeBookings = screen.getAllByText('120');
      expect(activeBookings.length).toBeGreaterThan(0);
    });
    
    await waitFor(() => {
      const revenueToday = screen.getAllByText('$2,450.00');
      expect(revenueToday.length).toBeGreaterThan(0);
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          revenue: { today: 2450, monthly: 52000, net: 52000 },
          refunds: { total: { amount: 0, count: 0 } },
          payments: { completed: { count: 120 }, pending: { count: 15 }, failed: { count: 0 } }
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stats: mockStats }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          revenue: { today: 2450, monthly: 52000, net: 52000 },
          refunds: { total: { amount: 0, count: 0 } },
          payments: { completed: { count: 120 }, pending: { count: 15 }, failed: { count: 0 } }
        }),
      });

    render(<DashboardPage />);
    
    // Wait for stats to load first
    await waitFor(() => {
      expect(screen.getAllByText('24').length).toBeGreaterThan(0);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    // Should trigger another fetch call for stats
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(5); // Initial auth + stats + financial + refresh stats + refresh financial
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          revenue: { today: 2450, monthly: 52000, net: 52000 },
          refunds: { total: { amount: 0, count: 0 } },
          payments: { completed: { count: 120 }, pending: { count: 15 }, failed: { count: 0 } }
        }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Manage Bookings')).toBeInTheDocument();
      expect(screen.getByText('Room Management')).toBeInTheDocument();
      expect(screen.getByText('Guest Management')).toBeInTheDocument();
      expect(screen.getByText('Reviews & Ratings')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      // Check that Settings appears at least once
      const settingsElements = screen.getAllByText('Settings');
      expect(settingsElements.length).toBeGreaterThan(0);
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          revenue: { today: 2450, monthly: 52000, net: 52000 },
          refunds: { total: { amount: 0, count: 0 } },
          payments: { completed: { count: 120 }, pending: { count: 15 }, failed: { count: 0 } }
        }),
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
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          revenue: { today: 2450, monthly: 52000, net: 52000 },
          refunds: { total: { amount: 0, count: 0 } },
          payments: { completed: { count: 120 }, pending: { count: 15 }, failed: { count: 0 } }
        }),
      });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('33.3%')).toBeInTheDocument();
    });
  });
}); 