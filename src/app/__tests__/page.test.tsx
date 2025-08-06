import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<HomePage />);
    
    const heading = screen.getByRole('heading', { 
      name: /welcome to our hotel/i 
    });
    expect(heading).toBeTruthy();
  });

  it('renders login and register links', () => {
    render(<HomePage />);
    
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    const createAccountLink = screen.getByRole('link', { name: /create account/i });
    
    expect(signInLink).toBeTruthy();
    expect(createAccountLink).toBeTruthy();
  });

  it('renders feature cards', () => {
    render(<HomePage />);
    
    const easyBookingCard = screen.getByText(/easy booking/i);
    const securePaymentsCard = screen.getByText(/secure payments/i);
    const guestReviewsCard = screen.getByText(/guest reviews/i);
    const supportCard = screen.getByText(/24\/7 support/i);
    
    expect(easyBookingCard).toBeTruthy();
    expect(securePaymentsCard).toBeTruthy();
    expect(guestReviewsCard).toBeTruthy();
    expect(supportCard).toBeTruthy();
  });

  it('renders call-to-action buttons', () => {
    render(<HomePage />);
    
    const viewRoomsButton = screen.getByRole('link', { name: /view rooms/i });
    const browseRoomsButton = screen.getByRole('link', { name: /browse rooms/i });
    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    
    expect(viewRoomsButton).toBeTruthy();
    expect(browseRoomsButton).toBeTruthy();
    expect(getStartedButton).toBeTruthy();
  });

  it('renders footer links', () => {
    render(<HomePage />);
    
    const contactLink = screen.getByRole('link', { name: /contact us/i });
    const helpLink = screen.getByRole('link', { name: /help center/i });
    const faqLink = screen.getByRole('link', { name: /faq/i });
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    
    expect(contactLink).toBeTruthy();
    expect(helpLink).toBeTruthy();
    expect(faqLink).toBeTruthy();
    expect(privacyLink).toBeTruthy();
    expect(termsLink).toBeTruthy();
  });
}); 