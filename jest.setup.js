import '@testing-library/jest-dom';

// Mock Firebase globally
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
      getIdTokenResult: jest.fn().mockResolvedValue({
        claims: {
          google_oauth_connected: true
        }
      })
    },
    onAuthStateChanged: jest.fn((callback) => {
      callback({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      });
      return jest.fn();
    }),
    signOut: jest.fn().mockResolvedValue(),
  },
  db: {
    collection: jest.fn(() => ({
      add: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ name: 'Test Document' }),
          id: 'mock-doc-id'
        }),
        set: jest.fn().mockResolvedValue(),
        update: jest.fn().mockResolvedValue(),
        delete: jest.fn().mockResolvedValue(),
      })),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          {
            id: 'doc1',
            data: () => ({
              name: 'Test Document 1',
              type: 'aadhar',
              size: 1024,
              createdAt: new Date().toISOString(),
              status: 'active'
            })
          }
        ]
      }),
    })),
  },
  signInWithGoogle: jest.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  }),
  GoogleAuthProvider: jest.fn(),
}));

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    }
  }),
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn((callback) => {
    callback({
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    });
    return jest.fn();
  }),
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({
    add: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ name: 'Test Document' }),
        id: 'mock-doc-id'
      }),
      set: jest.fn().mockResolvedValue(),
      update: jest.fn().mockResolvedValue(),
      delete: jest.fn().mockResolvedValue(),
    })),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: 'doc1',
          data: () => ({
            name: 'Test Document 1',
            type: 'aadhar',
            size: 1024,
            createdAt: new Date().toISOString(),
            status: 'active'
          })
        }
      ]
    }),
  })),
  addDoc: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      {
        id: 'doc1',
        data: () => ({
          name: 'Test Document 1',
          type: 'aadhar',
          size: 1024,
          createdAt: new Date().toISOString(),
          status: 'active'
        })
      }
    ]
  }),
  query: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
