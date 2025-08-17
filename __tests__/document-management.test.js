import { render, screen, waitFor } from '@testing-library/react';
import DocumentUploadPage from '@/app/documents/upload/page';
import DocumentsPage from '@/app/documents/page';

// Mock Firebase
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
    })
  },
  db: {},
  storage: {}
}));

// Mock services
jest.mock('@/lib/services/google-drive-connection-service', () => ({
  checkGoogleDriveConnection: jest.fn(),
  setGoogleDriveConnected: jest.fn(),
  refreshGoogleDriveConnection: jest.fn(),
}));

jest.mock('@/lib/services/google-drive-service', () => ({
  uploadFileToDrive: jest.fn(),
}));

jest.mock('@/lib/services/document-service', () => ({
  getDocuments: jest.fn(),
  getUserDocuments: jest.fn(),
  deleteDocument: jest.fn(),
  archiveDocument: jest.fn(),
}));

describe('Document Management System', () => {
  describe('Document Upload', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock Google Drive as connected
      const mockCheckConnection = require('@/lib/services/google-drive-connection-service').checkGoogleDriveConnection;
      mockCheckConnection.mockResolvedValue({ connected: true });
    });

    it('renders upload form when Google Drive is connected', async () => {
      render(<DocumentUploadPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Google Drive is connected and ready for secure document uploads.')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Document File (PDF only)')).toBeInTheDocument();
      expect(screen.getByText('Document Name')).toBeInTheDocument();
      expect(screen.getByText('Document Type')).toBeInTheDocument();
    });

    it('shows Google Drive connection prompt when not connected', async () => {
      const mockCheckConnection = require('@/lib/services/google-drive-connection-service').checkGoogleDriveConnection;
      mockCheckConnection.mockResolvedValue({ connected: false });

      render(<DocumentUploadPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/sign in with google to automatically connect/i)).toBeInTheDocument();
      });
    });

    it('renders file upload area', async () => {
      render(<DocumentUploadPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Google Drive is connected and ready for secure document uploads.')).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/click to upload/i)).toBeInTheDocument();
      expect(screen.getByText('or drag and drop')).toBeInTheDocument();
      expect(screen.getByText('PDF up to 10MB')).toBeInTheDocument();
    });

    it('renders form fields', async () => {
      render(<DocumentUploadPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Google Drive is connected and ready for secure document uploads.')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Document Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Document Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
    });

    it('renders submit button', async () => {
      render(<DocumentUploadPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Google Drive is connected and ready for secure document uploads.')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
    });
  });

  describe('Document List', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders page header', () => {
      // Mock the document service to return data so component renders in loaded state
      const mockGetUserDocuments = require('@/lib/services/document-service').getUserDocuments;
      mockGetUserDocuments.mockResolvedValue([
        {
          id: 'doc1',
          name: 'Test Document 1',
          type: 'pdf',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
      
      render(<DocumentsPage />);
      
      // Wait for the component to load and then check for content
      return waitFor(() => {
        // Use getAllByText to get all instances and check the main heading
        const headings = screen.getAllByText('My Documents');
        expect(headings.length).toBeGreaterThan(0);
        
        // Check for the description text
        expect(screen.getByText('Manage and organize your important government documents')).toBeInTheDocument();
      });
    });

    it('renders upload button', () => {
      // Mock the document service to return data so component renders in loaded state
      const mockGetUserDocuments = require('@/lib/services/document-service').getUserDocuments;
      mockGetUserDocuments.mockResolvedValue([
        {
          id: 'doc1',
          name: 'Test Document 1',
          type: 'pdf',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
      
      render(<DocumentsPage />);
      
      return waitFor(() => {
        expect(screen.getByRole('link', { name: /upload new document/i })).toBeInTheDocument();
      });
    });

    it('renders search and filter controls', () => {
      // Mock the document service to return data so component renders in loaded state
      const mockGetUserDocuments = require('@/lib/services/document-service').getUserDocuments;
      mockGetUserDocuments.mockResolvedValue([
        {
          id: 'doc1',
          name: 'Test Document 1',
          type: 'pdf',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
      
      render(<DocumentsPage />);
      
      return waitFor(() => {
        expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
        expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
        expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      // Mock the document service to return a promise that never resolves
      // This ensures the component stays in loading state
      const mockGetUserDocuments = require('@/lib/services/document-service').getUserDocuments;
      mockGetUserDocuments.mockImplementation(() => new Promise(() => {}));
      
      render(<DocumentsPage />);
      
      // Check for the actual loading text that's rendered
      expect(screen.getByText('Loading documents...')).toBeInTheDocument();
    });

    it('renders page content when loaded', async () => {
      // Mock the document service to return data
      const mockGetUserDocuments = require('@/lib/services/document-service').getUserDocuments;
      mockGetUserDocuments.mockResolvedValue([
        {
          id: 'doc1',
          name: 'Test Document 1',
          type: 'pdf',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
      
      render(<DocumentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('My Documents')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Manage and organize your important government documents')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /upload new document/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
    });
  });
});
