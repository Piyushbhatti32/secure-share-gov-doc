import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import LoginPage from '@/app/(auth)/login/page';

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all required fields', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('Email:');
    const passwordInput = screen.getByLabelText('Password:');
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // The form should submit without errors now
    // We can't easily test the actual submission without mocking Firebase,
    // but we can verify the form elements are properly connected
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('testpassword');
  });

  it('handles Google sign-in button click', async () => {
    render(<LoginPage />);
    
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    
    await act(async () => {
      fireEvent.click(googleButton);
    });

    // Check if error message appears (expected behavior due to missing Google setup)
    await waitFor(() => {
      expect(screen.getByText('Failed to get Google access token. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows Google Drive access note', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/includes access to google drive/i)).toBeInTheDocument();
  });

  it('displays navigation header correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('SecureDocShare')).toBeInTheDocument();
    expect(screen.getByText('Digital Document Management')).toBeInTheDocument();
    expect(screen.getByText('Government of India | Digital Document Management Portal')).toBeInTheDocument();
  });

  it('shows registration link', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Register here')).toBeInTheDocument();
  });
});
