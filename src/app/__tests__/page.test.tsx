import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { 
      name: /welcome to our hotel management system/i 
    })
    expect(heading).toBeTruthy()
  })

  it('renders login and register links', () => {
    render(<Home />)
    
    const loginLink = screen.getByRole('link', { name: /login/i })
    const registerLink = screen.getByRole('link', { name: /register/i })
    
    expect(loginLink).toBeTruthy()
    expect(registerLink).toBeTruthy()
  })

  it('renders feature cards', () => {
    render(<Home />)
    
    const bookingCard = screen.getByText(/booking management/i)
    const roomCard = screen.getByText(/room management/i)
    const guestCard = screen.getByText(/guest services/i)
    const reviewCard = screen.getByText(/reviews & ratings/i)
    
    expect(bookingCard).toBeTruthy()
    expect(roomCard).toBeTruthy()
    expect(guestCard).toBeTruthy()
    expect(reviewCard).toBeTruthy()
  })
}) 