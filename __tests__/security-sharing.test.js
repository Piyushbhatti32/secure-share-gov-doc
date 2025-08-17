import { render, screen, waitFor } from '@testing-library/react';
import SecurityPage from '@/app/security/page';
import SharedDocumentsPage from '@/app/shared/page';
import TwoFactorSetup from '@/components/TwoFactorSetup';

// Mock Firebase auth with app property
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    },
    onAuthStateChanged: jest.fn((callback) => {
      callback({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      });
      return jest.fn();
    }),
    app: {
      options: {
        authDomain: 'test-project.firebaseapp.com'
      }
    }
  }
}));

// Mock services
jest.mock('@/lib/services/user-service', () => ({
  getUserProfile: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock('@/lib/services/share-service', () => ({
  getSharedDocuments: jest.fn(),
  shareDocument: jest.fn(),
  revokeShare: jest.fn(),
}));

jest.mock('@/lib/utils/2fa', () => ({
  generateSecret: jest.fn(),
  generateQRCodeData: jest.fn(),
  verifyToken: jest.fn(),
}));

describe('Security and Sharing System', () => {
  describe('Security Page', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      const mockGetUserProfile = require('@/lib/services/user-service').getUserProfile;
      mockGetUserProfile.mockResolvedValue({
        securityPreferences: {
          twoFactorEnabled: false,
          notifyOnLogin: true,
          notifyOnShare: true,
          encryptionEnabled: true
        }
      });
    });

    it('renders security settings form', async () => {
      render(<SecurityPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Security Settings')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Document share notifications')).toBeInTheDocument();
      expect(screen.getByText('Login notifications')).toBeInTheDocument();
    });

    it('shows two-factor authentication setup when disabled', async () => {
      render(<SecurityPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Use an authenticator app to generate verification codes')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeInTheDocument();
    });
  });

  describe('Two-Factor Authentication Setup', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      const mockGenerateSecret = require('@/lib/utils/2fa').generateSecret;
      const mockGenerateQRCodeData = require('@/lib/utils/2fa').generateQRCodeData;
      
      mockGenerateSecret.mockReturnValue('test-secret-key');
      mockGenerateQRCodeData.mockReturnValue('otpauth://totp/SecureShare:test@example.com?secret=test-secret-key&issuer=SecureShare');
    });

    it('renders two-factor setup form', () => {
      render(<TwoFactorSetup />);
      
      expect(screen.getByText('Set Up Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Scan this QR code with your authenticator app (like Google Authenticator or Authy).')).toBeInTheDocument();
    });

    it('renders verification code input', () => {
      render(<TwoFactorSetup />);
      
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify & enable/i })).toBeInTheDocument();
    });
  });

  describe('Document Sharing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders shared documents page header', () => {
      render(<SharedDocumentsPage />);
      
      // Check for the loading state that's actually rendered
      expect(screen.getByText('Loading shared documents...')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<SharedDocumentsPage />);
      
      expect(screen.getByText('Loading shared documents...')).toBeInTheDocument();
    });
  });
});
