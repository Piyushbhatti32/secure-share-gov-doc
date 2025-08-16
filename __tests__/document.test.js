import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentPage from '@/app/documents/[id]/page';
import { act } from 'react';

// Mock useParams
jest.mock('next/navigation', () => ({
  useParams: () => ({
    id: 'test-doc-id',
  }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// (no firebase mock here so tests run similarly to earlier baseline)

// Mock firebase auth
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: { uid: 'test-user-id', email: 'test@example.com' } },
  db: {}
}));

// Mock document data
const mockDocument = {
  id: 'test-doc-id',
  name: 'Test Document',
  type: 'application/pdf',
  size: 1024,
  url: 'https://example.com/test.pdf',
  createdAt: new Date().toISOString(),
};

// Mock document service first
jest.mock('@/lib/services/document-service', () => ({
  getDocument: jest.fn()
}));

// Mock share service first
jest.mock('@/lib/services/share-service', () => ({
  getDocumentShares: jest.fn(),
  shareDocument: jest.fn()
}));

// Then get references to the mocked functions
const mockGetDocument = require('@/lib/services/document-service').getDocument;
const mockGetDocumentShares = require('@/lib/services/share-service').getDocumentShares;
const mockShareDocument = require('@/lib/services/share-service').shareDocument;


describe('DocumentPage', () => {
  beforeEach(() => {
    // Reset mock implementations
    mockGetDocument.mockReset().mockResolvedValue(mockDocument);
    mockGetDocumentShares.mockReset().mockResolvedValue([]);
    mockShareDocument.mockReset().mockResolvedValue('mock-share-id');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders document details', async () => {
    render(<DocumentPage />);
    
    // Wait for document and UI to load
    await screen.findByText('Test Document');
    expect(screen.getByText('application/pdf')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();

    // Verify service was called
    expect(mockGetDocument).toHaveBeenCalledWith('test-doc-id');
  });

  it('handles share form submission', async () => {
    render(<DocumentPage />);

    // Wait for document to load
    await screen.findByText('Test Document');

    // Get form elements
    const emailInput = screen.getByPlaceholderText('Enter email address');
    const shareButton = screen.getByRole('button', { name: /share/i });

    // Fill and submit form
    fireEvent.change(emailInput, { target: { value: 'share@example.com' } });
    fireEvent.click(shareButton);

    // Verify share was triggered
    await waitFor(() => {
      expect(mockShareDocument).toHaveBeenCalledWith(
        'test-doc-id',
        'test-user-id',  // From our firebase auth mock
        'share@example.com',
        ['view']
      );
    });
  });
});
