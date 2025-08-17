import { render, screen } from '@testing-library/react';
import DocumentPage from '@/app/documents/[id]/page';

// Mock Next.js 15 use() hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn((promise) => {
    if (promise && typeof promise === 'object' && 'id' in promise) {
      return promise;
    }
    return { id: 'test-id' };
  }),
}));

// Mock services
jest.mock('@/lib/services/document-service', () => ({
  getDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
}));

jest.mock('@/lib/services/share-service', () => ({
  shareDocument: jest.fn(),
  getDocumentShares: jest.fn(),
}));

jest.mock('@/lib/services/activity-service', () => ({
  logActivity: jest.fn(),
}));

describe('Document Management', () => {
  describe('Document Page', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders document page without crashing', () => {
      render(<DocumentPage params={{ id: 'doc1' }} />);
      
      // Check if the component renders without throwing an error
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
