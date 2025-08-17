# SecureDocShare - Government Document Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)

## 🎯 Project Overview

**SecureDocShare** is a secure digital document management platform designed specifically for government document storage and sharing. The system enables citizens to store, manage, and securely share vital documents (Aadhar cards, PAN cards, passports, mark sheets) with family members while maintaining the highest security standards.

## 🚀 Features

### ✅ **Core Functionality**
- **User Registration & OTP Verification** - Secure account creation with phone verification
- **Multi-Factor Authentication** - Email/password + Google OAuth + 2FA support
- **Document Management** - Upload, update, delete, and organize government documents
- **Google Drive Integration** - Automatic Google Drive connection during sign-in
- **Secure Document Sharing** - Share documents with family members using encryption
- **Activity Logging** - Comprehensive audit trail for all user actions
- **Profile Management** - User profile and security preferences

### 🔒 **Security Features**
- **End-to-End Encryption** - Documents encrypted before storage
- **Two-Factor Authentication** - TOTP-based 2FA using authenticator apps
- **Role-Based Access Control** - Granular permissions for document sharing
- **Audit Logging** - Complete activity tracking and monitoring
- **Secure API Endpoints** - JWT-based authentication with Firebase Admin

### 📱 **User Experience**
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI/UX** - Clean, intuitive interface following Material Design principles
- **Real-time Updates** - Live notifications and status updates
- **Drag & Drop Upload** - Easy document upload with preview

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15.4.6** - React framework with App Router
- **React 18.2.0** - Modern React with hooks and concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **FontAwesome** - Icon library for consistent UI elements

### **Backend & Services**
- **Firebase Authentication** - User management and OAuth
- **Firebase Firestore** - NoSQL database for document metadata
- **Firebase Admin SDK** - Server-side authentication and user management
- **Google Drive API** - Document storage and management

### **Security & Infrastructure**
- **JWT Tokens** - Secure API authentication
- **OAuth 2.0** - Google sign-in integration
- **Encryption** - AES-256 document encryption
- **Content Security Policy** - XSS and injection protection

## 📁 Project Structure

```
secureshare/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication APIs
│   │   ├── google-drive/        # Google Drive integration
│   │   └── notifications/       # Notification system
│   ├── dashboard/               # User dashboard
│   ├── documents/               # Document management
│   ├── security/                # Security settings
│   └── shared/                  # Shared documents
├── components/                   # Reusable React components
├── lib/                         # Core libraries and utilities
│   ├── services/                # Business logic services
│   ├── utils/                   # Utility functions
│   └── firebase.js             # Firebase configuration
├── __tests__/                   # Test files
└── public/                      # Static assets
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Cloud Console project

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/secureshare.git
   cd secureshare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase and Google OAuth credentials:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   # Google OAuth
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### **Run Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Test Coverage**
- **Authentication System** - Login, registration, OAuth
- **Document Management** - Upload, update, delete, sharing
- **Security Features** - 2FA, encryption, access control
- **API Endpoints** - All backend functionality
- **User Interface** - Component rendering and interactions

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### **Other Platforms**
- **Netlify** - Static site hosting
- **AWS Amplify** - Full-stack hosting
- **Google Cloud Run** - Container-based deployment
- **Docker** - Containerized deployment

## 📊 Code Standards

### **JavaScript/React**
- **ES6+ Features** - Modern JavaScript syntax
- **Functional Components** - React hooks and functional programming
- **PropTypes** - Runtime type checking for props
- **Error Boundaries** - Graceful error handling

### **Code Quality**
- **ESLint** - Code linting and formatting
- **Prettier** - Consistent code formatting
- **Jest** - Unit and integration testing
- **TypeScript** - Type safety (optional)

### **Architecture Patterns**
- **Service Layer** - Business logic separation
- **Repository Pattern** - Data access abstraction
- **Observer Pattern** - Event-driven architecture
- **Factory Pattern** - Object creation abstraction

## 🔒 Security Implementation

### **Authentication & Authorization**
- **Multi-factor Authentication** - TOTP-based 2FA
- **OAuth 2.0** - Google sign-in integration
- **JWT Tokens** - Secure session management
- **Role-based Access Control** - Granular permissions

### **Data Protection**
- **End-to-End Encryption** - AES-256 encryption
- **Secure File Storage** - Google Drive with encryption
- **Audit Logging** - Complete activity tracking
- **Input Validation** - XSS and injection prevention

### **API Security**
- **Rate Limiting** - Request throttling
- **CORS Configuration** - Cross-origin resource sharing
- **Input Sanitization** - Data validation and cleaning
- **HTTPS Enforcement** - Secure communication

## 📈 Performance Optimization

### **Frontend Optimization**
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Next.js image optimization
- **Bundle Analysis** - Webpack bundle optimization
- **Caching Strategies** - Browser and CDN caching

### **Backend Optimization**
- **Database Indexing** - Firestore query optimization
- **Connection Pooling** - Efficient resource management
- **Async Operations** - Non-blocking I/O operations
- **Memory Management** - Efficient resource utilization

## 🐛 Troubleshooting

### **Common Issues**

1. **Firebase Connection Errors**
   - Verify environment variables
   - Check Firebase project configuration
   - Ensure service account permissions

2. **Google Drive Integration Issues**
   - Verify OAuth credentials
   - Check API quotas and limits
   - Ensure proper scopes are configured

3. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### **Debug Mode**
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code style and patterns
- Write tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Firebase Team** - For robust backend services
- **Google Cloud** - For reliable infrastructure
- **Open Source Community** - For valuable libraries and tools

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/yourusername/secureshare/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/secureshare/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/secureshare/discussions)
- **Email**: support@securedocshare.com

---

**Built with ❤️ for secure document management**
