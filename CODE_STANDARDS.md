# SecureDocShare - Code Standards & Best Practices

## 📋 Table of Contents

1. [General Principles](#general-principles)
2. [JavaScript/React Standards](#javascriptreact-standards)
3. [File Organization](#file-organization)
4. [Naming Conventions](#naming-conventions)
5. [Code Style](#code-style)
6. [Error Handling](#error-handling)
7. [Security Standards](#security-standards)
8. [Testing Standards](#testing-standards)
9. [Documentation Standards](#documentation-standards)
10. [Performance Standards](#performance-standards)

## 🎯 General Principles

### **Code Quality Standards**
- **Readability** - Code should be self-documenting and easy to understand
- **Maintainability** - Code should be easy to modify and extend
- **Testability** - Code should be designed for easy testing
- **Security** - Security should be built-in, not bolted on
- **Performance** - Code should be efficient and scalable

### **Development Workflow**
- **Code Review** - All code must be reviewed before merging
- **Testing** - All new features must have corresponding tests
- **Documentation** - Code changes must include updated documentation
- **Standards Compliance** - Code must pass linting and formatting checks

## ⚛️ JavaScript/React Standards

### **React Component Structure**

```jsx
// ✅ Good: Functional component with proper structure
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { someService } from '@/lib/services/some-service';
import logger from '@/lib/utils/logger';

const ComponentName = ({ prop1, prop2, children }) => {
  // 1. State declarations
  const [state1, setState1] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. Custom hooks
  const customHook = useCustomHook();

  // 3. Event handlers
  const handleClick = async () => {
    try {
      setLoading(true);
      const result = await someService.doSomething();
      setState1(result);
      logger.info('Operation successful', { result });
    } catch (error) {
      logger.error('Operation failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);

  // 5. Render logic
  if (loading) return <div>Loading...</div>;
  if (!state1) return <div>No data</div>;

  return (
    <div className="component-name">
      <h1>{prop1}</h1>
      <p>{prop2}</p>
      {children}
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Processing...' : 'Click Me'}
      </button>
    </div>
  );
};

// PropTypes for type checking
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  children: PropTypes.node
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

### **Hook Usage Standards**

```jsx
// ✅ Good: Custom hook with proper structure
import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/utils/logger';

export const useCustomHook = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const updateValue = useCallback(async (newValue) => {
    try {
      setLoading(true);
      // Async operation
      setValue(newValue);
      logger.info('Value updated successfully', { newValue });
    } catch (error) {
      logger.error('Failed to update value', { error: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Side effect logic
  }, [value]);

  return { value, loading, updateValue };
};

// ❌ Bad: Hook used conditionally
if (condition) {
  useEffect(() => {}, []); // This will cause errors
}
```

## 📁 File Organization

### **Directory Structure Standards**

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Route groups for authentication
│   ├── api/               # API routes
│   └── [dynamic]/         # Dynamic routes
├── components/             # Reusable React components
│   ├── ui/                # Basic UI components
│   ├── forms/             # Form-related components
│   └── layout/            # Layout components
├── lib/                   # Core libraries and utilities
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── constants/         # Application constants
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── styles/                # Global styles and CSS modules
```

### **File Naming Conventions**

```bash
# ✅ Good: Descriptive, kebab-case
user-profile-page.js
document-upload-form.js
google-drive-service.js
use-auth-hook.js

# ❌ Bad: Unclear or inconsistent
page.js
form.js
service.js
hook.js
```

## 🏷️ Naming Conventions

### **Variables and Functions**

```javascript
// ✅ Good: Descriptive names
const userProfile = getUserProfile(userId);
const isDocumentShared = checkDocumentSharingStatus(documentId);
const handleDocumentUpload = async (file) => { /* ... */ };

// ❌ Bad: Unclear names
const data = getData(id);
const flag = checkFlag(docId);
const func = async (f) => { /* ... */ };
```

### **Constants and Enums**

```javascript
// ✅ Good: UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = ['application/pdf'];
const API_ENDPOINTS = {
  UPLOAD: '/api/documents/upload',
  SHARE: '/api/documents/share'
};

// ✅ Good: PascalCase for enums
export const ActivityType = {
  UPLOAD: 'upload',
  SHARE: 'share',
  DELETE: 'delete'
};
```

### **CSS Classes**

```css
/* ✅ Good: BEM methodology */
.component-name { }
.component-name__element { }
.component-name--modifier { }

/* ✅ Good: Utility-first with Tailwind */
.btn btn-primary btn-lg
card card-header card-body
```

## 🎨 Code Style

### **JavaScript/JSX Formatting**

```javascript
// ✅ Good: Consistent spacing and formatting
const Component = ({ prop1, prop2, children }) => {
  const [state, setState] = useState(null);

  const handleClick = () => {
    setState(prevState => !prevState);
  };

  return (
    <div className="component">
      <button onClick={handleClick}>
        {state ? 'Active' : 'Inactive'}
      </button>
      {children}
    </div>
  );
};

// ❌ Bad: Inconsistent formatting
const Component=({prop1,prop2,children})=>{
  const [state,setState]=useState(null);
  const handleClick=()=>{setState(prevState=>!prevState);};
  return(<div className="component"><button onClick={handleClick}>{state?'Active':'Inactive'}</button>{children}</div>);
};
```

### **Import/Export Standards**

```javascript
// ✅ Good: Organized imports
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// 3. Internal utilities and services
import { validateFile } from '@/lib/utils/validation';
import { uploadDocument } from '@/lib/services/document-service';

// 4. Components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// 5. Styles
import styles from './Component.module.css';
```

## ⚠️ Error Handling

### **Error Handling Standards**

```javascript
// ✅ Good: Comprehensive error handling
const handleOperation = async () => {
  try {
    setLoading(true);
    const result = await someService.operation();
    
    if (!result.success) {
      throw new Error(result.error || 'Operation failed');
    }
    
    setData(result.data);
    logger.info('Operation successful', { result: result.data });
    
  } catch (error) {
    logger.error('Operation failed', { 
      error: error.message, 
      stack: error.stack 
    });
    
    // User-friendly error message
    setError(getUserFriendlyMessage(error));
    
    // Show toast notification
    toast.error(getUserFriendlyMessage(error));
    
  } finally {
    setLoading(false);
  }
};

// ✅ Good: Error boundary for React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Component error caught', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### **API Error Handling**

```javascript
// ✅ Good: Consistent API error responses
export const handleApiError = (error, context = '') => {
  const errorInfo = {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    context,
    timestamp: new Date().toISOString()
  };

  logger.error('API Error', errorInfo);

  // Return standardized error response
  return {
    success: false,
    error: errorInfo.message,
    code: errorInfo.code,
    timestamp: errorInfo.timestamp
  };
};
```

## 🔒 Security Standards

### **Input Validation**

```javascript
// ✅ Good: Comprehensive input validation
import { z } from 'zod';

const documentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  type: z.enum(['aadhar', 'pan', 'passport', 'other']),
  description: z.string().max(500, 'Description too long').optional(),
  file: z.object({
    size: z.number().max(10 * 1024 * 1024, 'File too large'),
    type: z.string().refine(type => type === 'application/pdf', 'Only PDF files allowed')
  })
});

const validateDocument = (data) => {
  try {
    return { success: true, data: documentSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error.errors[0].message };
  }
};
```

### **Authentication & Authorization**

```javascript
// ✅ Good: Proper authentication checks
export const requireAuth = (handler) => {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Authentication required' 
        });
      }

      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = decodedToken;
      
      return handler(req, res);
    } catch (error) {
      logger.error('Authentication failed', { error: error.message });
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }
  };
};

// ✅ Good: Role-based access control
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'user';
    
    if (userRole !== requiredRole && userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};
```

## 🧪 Testing Standards

### **Test Structure**

```javascript
// ✅ Good: Comprehensive test structure
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Component from './Component';

// Mock dependencies
jest.mock('@/lib/services/some-service');
jest.mock('@/lib/utils/logger');

describe('Component', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  // Test cases
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Component />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('displays correct initial state', () => {
      render(<Component initialValue="test" />);
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles button click correctly', async () => {
      const mockHandler = jest.fn();
      render(<Component onClick={mockHandler} />);
      
      const button = screen.getByRole('button');
      
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('displays error message when operation fails', async () => {
      // Test error scenarios
    });
  });
});
```

### **Test Coverage Requirements**

- **Unit Tests**: Minimum 80% coverage for all business logic
- **Integration Tests**: All API endpoints and service interactions
- **Component Tests**: All React components with user interactions
- **Security Tests**: Authentication, authorization, and input validation

## 📚 Documentation Standards

### **Code Comments**

```javascript
/**
 * Uploads a document to Google Drive and stores metadata in Firestore
 * 
 * @param {File} file - The file to upload
 * @param {Object} metadata - Document metadata
 * @param {string} metadata.name - Document name
 * @param {string} metadata.type - Document type (aadhar, pan, passport, other)
 * @param {string} metadata.description - Optional description
 * @param {string} userId - ID of the user uploading the document
 * 
 * @returns {Promise<Object>} Upload result with document ID and URL
 * @throws {Error} If upload fails or validation errors occur
 * 
 * @example
 * const result = await uploadDocument(file, metadata, userId);
 * console.log('Document uploaded:', result.documentId);
 */
export const uploadDocument = async (file, metadata, userId) => {
  // Implementation...
};
```

### **README Documentation**

- **Project Overview** - Clear description of what the project does
- **Installation** - Step-by-step setup instructions
- **Usage** - Examples of how to use the application
- **API Reference** - Documentation of all endpoints
- **Contributing** - Guidelines for contributors
- **License** - Project licensing information

## ⚡ Performance Standards

### **Code Optimization**

```javascript
// ✅ Good: Memoized expensive operations
import { useMemo, useCallback } from 'react';

const Component = ({ items, filter }) => {
  // Memoize filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);

  // Memoize event handlers
  const handleItemClick = useCallback((itemId) => {
    // Handle click
  }, []);

  return (
    <div>
      {filteredItems.map(item => (
        <Item 
          key={item.id} 
          item={item} 
          onClick={handleItemClick} 
        />
      ))}
    </div>
  );
};

// ✅ Good: Lazy loading for large components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

### **Performance Requirements**

- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 250KB gzipped

## 🔧 Tools and Configuration

### **Required Tools**

```json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  }
}
```

### **ESLint Configuration**

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

### **Prettier Configuration**

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

---

## 📋 Code Review Checklist

Before submitting code for review, ensure:

- [ ] Code follows naming conventions
- [ ] All functions have JSDoc comments
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Code is properly formatted
- [ ] No console.log statements remain
- [ ] Security considerations are addressed
- [ ] Performance impact is considered
- [ ] Documentation is updated
- [ ] Linting passes without errors

## 🚀 Continuous Integration

The project uses GitHub Actions to enforce these standards:

- **Linting**: ESLint and Prettier checks
- **Testing**: Jest test suite execution
- **Security**: Dependency vulnerability scanning
- **Build**: Production build verification
- **Deployment**: Automatic deployment on main branch

---

**Remember**: These standards are designed to ensure code quality, maintainability, and security. Following them consistently will make the codebase more professional and easier to work with for all team members.
