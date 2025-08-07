import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('HomePage', () => {
  it('renders login and register links', () => {
    render(<HomePage />);
    
    const loginLink = screen.getAllByRole('link', { name: /sign in/i })[0];
    const registerLink = screen.getAllByRole('link', { name: /create account/i })[0];
    
    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<HomePage />);
    
    const viewRoomsButton = screen.getAllByRole('link', { name: /view rooms/i })[0];
    const browseRoomsButton = screen.getAllByRole('link', { name: /browse rooms/i })[0];
    
    expect(viewRoomsButton).toBeInTheDocument();
    expect(browseRoomsButton).toBeInTheDocument();
  });

  it('renders hero section with title', () => {
    render(<HomePage />);
    
    const heroTitle = screen.getByText(/welcome to our hotel/i);
    expect(heroTitle).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(<HomePage />);
    
    const featuresTitle = screen.getByText(/why choose our hotel/i);
    expect(featuresTitle).toBeInTheDocument();
  });

  it('renders footer links', () => {
    render(<HomePage />);
    
    const contactLink = screen.getByText(/contact us/i);
    const privacyLink = screen.getByText(/privacy policy/i);
    
    expect(contactLink).toBeInTheDocument();
    expect(privacyLink).toBeInTheDocument();
  });

  // Snapshot tests
  it('matches snapshot for homepage', () => {
    const { container } = render(<HomePage />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for hero section', () => {
    const { container } = render(<HomePage />);
    const heroSection = container.querySelector('.bg-gradient-to-r');
    expect(heroSection).toMatchSnapshot();
  });

  it('matches snapshot for features section', () => {
    const { container } = render(<HomePage />);
    const featuresSection = container.querySelector('.bg-gray-50');
    expect(featuresSection).toMatchSnapshot();
  });

  it('matches snapshot for footer', () => {
    const { container } = render(<HomePage />);
    const footer = container.querySelector('footer');
    expect(footer).toMatchSnapshot();
  });
}); 