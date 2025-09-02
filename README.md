# 🔐 SecureDocShare - Secure Government Document Management

A modern, secure web application for uploading, storing, and sharing government documents with family members. Built with Next.js 15, Clerk authentication, and enterprise-grade security features.

## ✨ Features

- **🔐 Secure Authentication** - Clerk-powered user management
- **📄 Document Management** - Upload, encrypt, and organize documents
- **🔒 End-to-End Encryption** - Military-grade document security
- **👨‍👩‍👧‍👦 Family Sharing** - Secure document sharing with family members
- **📱 Responsive Design** - Works perfectly on all devices
- **⚡ Performance Optimized** - Fast loading and smooth interactions
- **🛡️ Security First** - Comprehensive security measures

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account (for authentication)
- Cloudinary account (for file storage)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/secureshare-app.git
cd secureshare-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
secureshare-app/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication routes
│   │   ├── sign-in/             # Sign in page
│   │   └── sign-up/             # Sign up page
│   ├── (static)/                 # Static pages
│   ├── api/                      # API routes
│   ├── dashboard/                # Main dashboard
│   ├── documents/                # Document management
│   ├── encryption/               # Encryption utilities
│   ├── security/                 # Security settings
│   └── shared/                   # Shared documents
├── components/                    # Reusable React components
│   ├── auth/                     # Authentication components
│   ├── ui/                       # UI components
│   └── ...                       # Other component categories
├── lib/                          # Utility libraries
│   ├── context/                  # React contexts
│   ├── hooks/                    # Custom hooks
│   └── utils/                    # Helper utilities
├── public/                       # Static assets
└── scripts/                      # Build and deployment scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:r2` - Test R2 configuration

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User authentication
- `GET /api/auth/user` - Get current user

### Document Management
- `GET /api/documents` - List all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/[id]` - Get specific document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

### File Operations
- `POST /api/upload` - Upload new document
- `GET /api/download/[id]` - Download document
- `GET /api/cloudinary-status` - Check Cloudinary status

## 🔐 Security Features

### Authentication & Authorization
- **Clerk Integration** - Enterprise-grade authentication
- **JWT Tokens** - Secure session management
- **Role-Based Access** - Granular permission control

### Document Security
- **End-to-End Encryption** - AES-256 encryption
- **Secure File Storage** - Cloudinary with encryption
- **Access Control** - Family member permissions
- **Audit Logging** - Complete access history

### Application Security
- **HTTPS Enforcement** - Secure communication
- **XSS Protection** - Built-in Next.js security
- **CSRF Protection** - Cross-site request forgery prevention
- **Input Validation** - Comprehensive data sanitization

## 🎨 UI Components

### Core Components
- **EnhancedFileUpload** - Drag & drop with validation
- **DocumentCard** - Document preview and actions
- **PDFViewer** - PDF rendering and navigation
- **LoadingSpinner** - Consistent loading states
- **Toast** - User notification system

### Design System
- **Responsive Layout** - Mobile-first design
- **Dark Theme** - Modern, professional appearance
- **Smooth Animations** - Enhanced user experience
- **Accessibility** - WCAG 2.1 compliance

## 🚀 Performance Optimization

### Code Splitting
- **Dynamic Imports** - Lazy loading of components
- **Route-based Splitting** - Automatic code splitting
- **Bundle Analysis** - Performance monitoring

### Asset Optimization
- **Image Optimization** - Next.js image optimization
- **CSS Minification** - Tailwind CSS optimization
- **JavaScript Bundling** - Webpack optimization

### Caching Strategy
- **Static Generation** - Pre-rendered pages
- **Incremental Static Regeneration** - Dynamic updates
- **Service Worker** - Offline functionality

## 🧪 Testing

This project does not include automated tests in this branch.

## 📱 Responsiveness

The application is fully responsive across all device sizes:

- **Mobile** (< 768px) - Optimized mobile experience
- **Tablet** (768px - 1024px) - Touch-friendly interface
- **Desktop** (> 1024px) - Full-featured desktop experience

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel --git
   ```

2. **Configure Environment Variables**
   - Add all variables from `.env.local` to Vercel dashboard

3. **Deploy**
   ```bash
   git push origin main
   ```

### Other Platforms

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### Railway
```bash
railway login
railway init
railway up
```

## 🔧 Configuration

### Clerk Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable and secret keys
4. Configure authentication settings in Clerk dashboard

### Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and secret
3. Create an upload preset for your application

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals** - Real-time performance metrics
- **Error Tracking** - Comprehensive error logging
- **User Analytics** - Usage patterns and insights

### Security Monitoring
- **Access Logs** - Authentication attempts
- **File Access** - Document access patterns
- **Security Events** - Suspicious activity detection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **TypeScript** - Type safety (optional)
- **Conventional Commits** - Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

### Community
- [GitHub Issues](https://github.com/yourusername/secureshare-app/issues)
- [Discord Community](https://discord.gg/yourcommunity)

### Contact
- **Email**: support@secureshare.com
- **Twitter**: [@SecureDocShare](https://twitter.com/SecureDocShare)

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Clerk Team** - Authentication solution
- **Cloudinary Team** - File management platform
- **Tailwind CSS** - Utility-first CSS framework

---

**Made with ❤️ for secure document management**
