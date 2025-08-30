# SecureShare - Secure Document Management System

A modern, secure document management application built with Next.js that allows users to upload, store, and share important documents securely with family members. Features include end-to-end encryption, cloud storage integration, and a user-friendly interface.

## 🚀 Features

- **🔐 Secure Document Storage** - End-to-end encryption for all uploaded documents
- **☁️ Cloud Integration** - Seamless integration with Cloudinary for reliable cloud storage
- **👥 Family Sharing** - Secure sharing of documents with family members
- **📱 Responsive Design** - Modern, mobile-friendly interface built with Tailwind CSS
- **🔒 Authentication** - Secure user authentication powered by Clerk
- **📊 Real-time Progress** - Live upload progress tracking with XMLHttpRequest
- **🎨 Modern UI/UX** - Beautiful animations and corner effects for enhanced user experience
- **📁 Multiple File Types** - Support for PDFs, images, documents, and more
- **🔍 Document Search** - Easy document discovery and management
- **📱 Mobile Optimized** - Responsive design that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Authentication**: Clerk
- **Cloud Storage**: Cloudinary
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Font Awesome 7.0.0
- **Development**: ESLint, PostCSS

## 📋 Prerequisites

Before running this application, you'll need:

- Node.js 18+ and npm
- Cloudinary account and API credentials
- Clerk account and API credentials

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd secureshare-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_URL=your_cloudinary_url
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
secureshare-app/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (static)/          # Static pages (contact, FAQ, etc.)
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── documents/         # Document management
│   ├── encryption/        # Encryption utilities
│   ├── security/          # Security settings
│   └── shared/            # Shared documents
├── components/            # Reusable React components
├── lib/                   # Utility libraries and services
│   ├── services/          # Business logic services
│   └── utils/             # Helper utilities
├── public/                # Static assets
└── scripts/               # Build and deployment scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Document Management
- `GET /api/documents` - List all documents
- `DELETE /api/documents` - Delete a document
- `GET /api/documents/[id]` - Get specific document

### File Operations
- `POST /api/upload` - Upload new document
- `GET /api/download` - Download document
- `GET /api/cloudinary-status` - Check Cloudinary status

### Authentication
- `/sign-in` - User sign in
- `/sign-up` - User registration
- `/dashboard` - Protected dashboard

## 🔐 Security Features

- **End-to-End Encryption** - All documents are encrypted before upload
- **Secure Authentication** - Clerk-powered user authentication
- **Cloud Security** - Cloudinary's enterprise-grade security
- **Input Validation** - Comprehensive file type and size validation
- **XSS Protection** - Built-in Next.js security features

## 🎨 UI Components

### EnhancedFileUpload
- Drag & drop file upload
- Real-time progress tracking
- File validation and security scanning
- Multiple file type support

### DocumentCard
- Document preview and metadata
- Quick actions (view, edit, download, delete)
- Responsive design with animations

### PDFViewer
- PDF document rendering
- Image support for various formats
- Error handling and fallbacks

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Configure build settings and environment variables
- **Railway**: Use the provided Dockerfile
- **Self-hosted**: Build and deploy using `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Changelog

### v1.0.0
- Initial release with core document management features
- Cloudinary integration for cloud storage
- Clerk authentication system
- Responsive design with Tailwind CSS
- Real-time upload progress tracking

---

**Built with ❤️ using Next.js and modern web technologies**

## 🗂️ .gitignore Best Practices

- The `.gitignore` file is pre-configured for Next.js, Node.js, and common cloud deployment scenarios.
- **All user uploads are stored in Cloudinary**; there is no local uploads directory to ignore.
- Sensitive files, build artifacts, environment variables, editor files, and OS files are all excluded from version control.
- If you add new tools, editors, or environments, update `.gitignore` accordingly.

## 🔒 Production UI Note
- The Debug button has been removed from the navigation and dashboard for production deployments to ensure a clean user experience.
